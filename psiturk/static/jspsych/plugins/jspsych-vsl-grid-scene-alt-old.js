const roomChar2Word = {
  "w": "wall", // wall
  "e": "entrance", // entrance
  "o": "obstacle", // obstacle
  "x": "exit", // exit
  "b": "outside-fov", // no blocks
  0: "room-chunk", // empty spaces
}

var jsPsychVslGridAlt = (function (jspsych) {
  'use strict';

  const info = {
    name: "vsl-grid-scene",
    parameters: {
      html: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "HTML Template",
        description: "We need to pass-in the HTML template since JSPsych can't load local HTML",
      },
      stimuli: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: 'Stimuli',
        array: true,
        default: undefined,
        description: 'An array that defines a grid.'
      },
      base_img: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: 'Base image in overlay.',
        description: 'A base image that gets overlayed.'
      },
      image_size: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Image size',
        array: true,
        default: [100, 100],
        description: 'Array specifying the width and height of the images to show.'
      },
      img_path: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Path for the images getting overlayed.",
        default: `/static/data/images/stims/`,
      },
      cell_size: {
        type: jspsych.ParameterType.INT,
        pretty_name: "The pixel size of grid cells.",
        default: 25,
      },
      grid_size: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Number of cells in the grid.",
        array: true,
        default: [32, 32],
      },
      room: {
        type: jspsych.ParameterType.STRING,
        array: true,
        pretty_name: "Room Layout",
        description: "An array of room chunks with their specified chunk-type.",
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the stimulus for in milliseconds.'
      },
      /** If true, then trial will end when user responds. */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response ends trial",
        default: true,
      },
    },
  };

  class VslGridPluginAlt {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      display_element.innerHTML = trial.html;
      const room = trial.room;

      const root = document.querySelector(":root");
      root.style.setProperty("--n-rows", room.length);
      root.style.setProperty("--n-cols", room[0].length);

      const start_time = performance.now();
      const minObstacles = 5;

      const obstacleCounter = document.querySelector("#obstacle-counter");
      obstacleCounter.setAttribute("n", 0);
      obstacleCounter.setAttribute("min", minObstacles);

      const overlayContainer = document.querySelector("#overlay-container");
      overlayContainer.setAttribute("base-path", trial.img_path);

      // Add the base image
      const baseImg = document.getElementById("base-img");
      baseImg.src = trial.base_img;
      overlayContainer.style.width = `${baseImg.naturalWidth}px`;

      // Generate the grid for participants to click on
      generateGrid(room);
      usingFabric(trial);

      const drawBtn = document.querySelector("#draw");
      drawBtn.addEventListener("click", () => {
        // TODO toggle "draw" mode on the `SquareBrush`
      })
      const eraseBtn = document.querySelector("#erase");
      eraseBtn.addEventListener("click", () => {
        // TODO toggle "erase" mode on the `SquareBrush`
      })

      // Setup the `Next` button for participants to advance
      const nextBtn = document.querySelector("#next");
      nextBtn.disabled = true;
      nextBtn.addEventListener("click", () => {
        const obs = getObs();
        (obs.n >= obs.min) && end_trial();
      });

      // function to end trial when it is time
      const end_trial = () => {
        // kill any remaining setTimeout handlers
        this.jsPsych.pluginAPI.clearAllTimeouts();
        const obstacles = overlayContainer.querySelectorAll(":not(#base-img)")
        for (const obstacle of obstacles) {
          const row = obstacle.getAttribute("row");
          const col = obstacle.getAttribute("col");
          room[row][col] = 0;
        }
        // gather the data to store for the trial
        var trial_data = {
          response: room,
          rt: performance.now() - start_time,
        };
        console.log(trial_data)
        // clear the display
        display_element.innerHTML = "";
        // move on to the next trial
        this.jsPsych.finishTrial(trial_data);
      };

      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }

    }
  }
  VslGridPluginAlt.info = info;

  return VslGridPluginAlt;

})(jsPsychModule);

const getObs = () => {
  const obstacleCounter = document.querySelector("#obstacle-counter");
  const n = parseInt(obstacleCounter.getAttribute("n"));
  const min = parseInt(obstacleCounter.getAttribute("min"));
  return {elem: obstacleCounter, n, min}
}

/**
  * Generates the grid for people to click on
  * @param {string[][]} room - A 2D array of the room representing the "chunk types".
  */
function generateGrid(room) {
  const root = document.querySelector(":root");
  const nRows = getComputedStyle(root).getPropertyValue("--n-rows");
  const nCols = getComputedStyle(root).getPropertyValue("--n-cols");

  const chunkColors = room.map(rows => rows.map(col => roomChar2Word[col]))
  const grid = document.getElementById("grid");

  for (let row = 0; row < nRows; row++) {
    for (let col = 0; col < nCols; col++) {
      const cell = addCell(row, col, chunkColors[row][col]);
      grid.appendChild(cell);
    }
  }
}

const paintCell = (cell) => {
  const row = cell.getAttribute("row");
  const col = cell.getAttribute("col");
  const obs = getObs();

  if (cell.classList.contains("obstacle")) {
    delOverlayImage(row, col);
  } else if (obs.n < obs.max) {
    addOverlayImage(new fabric.Point(row, col));
  }
}

/**
 * Adds a cell to the grid.
 * @param {number} row - The row number.
 * @param {number} col - The column number.
 * @param {string} chunkType - The type of the current chunk
 * @returns HTMLSpanElement
 */
function addCell(row, col, chunkType) {
  const cell = document.createElement("span");
  cell.classList.add(chunkType);

  if (chunkType === "room-chunk") {
    const gridContainer = document.querySelector("#grid");
    // TODO: use `mousemove` to drag, needs to be fixed to click for undo
    cell.addEventListener("click", () => {
      gridContainer.setAttribute("clicked", true);
      paintCell(cell)
      setTimeout(() => {
        gridContainer.setAttribute("clicked", false);
      }, 500);
    });
    cell.addEventListener("mousemove", () => {
      if (gridContainer.getAttribute("clicked")) {
        paintCell(cell);
      }
    })
  }
  cell.id = `cell-${row}-${col}`;
  cell.setAttribute("row", row);
  cell.setAttribute("col", col);
  return cell;
}

/**
 * Removes the corresponding `(row, col)` barrier from the image overlay
 * participants see. Also returns the corresponding cell to a blank "room-chunk".
 * @param {number} row The row coordinate of the grid
 * @param {number} col The column coordinate of the grid
 */
function delOverlayImage(row, col) {
  const child = document.querySelector(`#overlay-container img[row="${row}"][col="${col}"]`);
  if (child) {
      const cell = document.querySelector(`#grid span[row="${row}"][col="${col}"]`)
      cell.classList.remove("obstacle");

      child.remove();
      updateObstacleCount(-1);
  }
}

/**
 * Adds the corresponding `(row, col)` barrier to the image overlay participants see.
 * Also updates the corresponding cell to be an obstacle.
 * @param {fabric.Point} point The location of the obstacle in the grid
 */
function addOverlayImage(point) {
  const root = document.querySelector(":root");
  const nRows = getComputedStyle(root).getPropertyValue("--n-rows");
  const nCols = getComputedStyle(root).getPropertyValue("--n-cols");
  const {x, y} = point;

  console.log(x, y)
  const cell = document.querySelector(`#grid span[row="${y}"][col="${x}"]`)
  cell.classList.add("obstacle");

  const overlayContainer = document.querySelector("#overlay-container")
  let basepath = overlayContainer.getAttribute("base-path");
  basepath = basepath.endsWith("/") ? basepath.slice(0, basepath.length - 1) : basepath;

  const img = document.createElement("img");
  img.classList.add("img-overlay");
  img.src = `${basepath}/${x}_${y}.png`

  updateObstacleCount(1);

  const zIndexX = nCols - x;
  const zIndexY = nRows - y;
  img.style.zIndex = -(zIndexX * zIndexY);

  img.setAttribute("col", x);
  img.setAttribute("row", y);
  overlayContainer.appendChild(img);
}

/**
 * Updates DOM based on the number of obstacles selected. When people exceed the
 * maximum number of obstacles, the warning text is made visible. Until the minimum
 * number of obstacles are selected, participants cannot advance.
 * @param {number} inc The amount to increment `n` by on the `obstacle-counter`.
 */
function updateObstacleCount(inc) {
  const obs = getObs();
  const nObs = obs.n + inc;
  obs.elem.setAttribute("n", nObs);

  const nextBtn = document.querySelector("#next");
  nextBtn.disabled = obs.min <= nObs;
}

const toggleObstacleState = (canvas, options) => {
  const {name, left, top } = options.target;
  const cell = canvas.getItemByName(name);
  if (cell.my.cellType !== "room-chunk") {
    return 
  }
  const cellColor = cell.get("fill");
  const obstacleColor = getCellColor("obstacle");
  if (cellColor !== obstacleColor) {
    cell.set("fill", getCellColor("obstacle"))
  } else {
    cell.set("fill", getCellColor("room-chunk"))
  }
}

const usingFabric = (trial) => {
  const root = document.querySelector(":root");
  const nRows = parseInt(getComputedStyle(root).getPropertyValue("--n-rows"));
  const nCols = parseInt(getComputedStyle(root).getPropertyValue("--n-cols"));
  // https://stackoverflow.com/a/42769683
  const gridSize = (
    parseFloat(getComputedStyle(root).getPropertyValue("--cell-size")) *
    parseFloat(getComputedStyle(document.documentElement).fontSize)
  );

  const canvas = new fabric.Canvas("fabric-grid", {
    backgroundColor: "rgb(240, 240, 240)",
    centeredScaling: true,
    selection: false,
    isDrawingMode: true,
    viewportTransform: [1, 0, 0, 1, 0, 0],
  });
  canvas.setDimensions({
    width: nCols * gridSize,
    height: nRows * gridSize,
  })
  // canvas.zoomToPoint({ x: 0, y: 0, }, gridSize);

  const { cells, canHaveObstacle } = fabricGenerateGrid(trial.room);
  canvas.add(...cells)

  canvas.freeDrawingBrush = new fabric.SquareBrush(canvas, { canHaveObstacle, width: gridSize });
  canvas.freeDrawingBrush.setMode("draw");

  canvas.on({
    "object:modified": function ({ cell, mode }) {
      console.log(mode, cell.my.point)
      switch (mode) {
        case "draw": addOverlayImage(cell.my.point); break;
        case "erase": delOverlayImage(cell.my.point); break;
      }
    },
    // "mouse:down": (options) => {
    //   toggleObstacleState(canvas, options);
    //   canvas.requestRenderAll();
    // },
    // "mouse:move": (options) => {
    //   toggleObstacleState(canvas, options);
    //   canvas.requestRenderAll();
    // },
  })
}

const getCellColor = (name) => {
  const root = document.querySelector(":root");
  return getComputedStyle(root).getPropertyValue(`--grid-${name}-bg`);
}

const fabricGenerateGrid = (room) => {
  const root = document.querySelector(":root");
  const nRows = getComputedStyle(root).getPropertyValue("--n-rows");
  const nCols = getComputedStyle(root).getPropertyValue("--n-cols");

  const chunkColors = room.map(rows => rows.map(col => roomChar2Word[col]))

  const cells = [];
  const canHaveObstacle = [];
  for (let col = 0; col < nCols; col++) {
    for (let row = 0; row < nRows; row++) {
      const point = new fabric.Point(col, row)
      const cellType = chunkColors[row][col];
      console.log(point, cellType)
      const cell = fabricAddCell(point, cellType);
      cells.push(cell);
      (cellType === "room-chunk") && canHaveObstacle.push(point)
    }
  }
  return { cells, canHaveObstacle };
}

const fabricAddCell = (point, color) => {
  const root = document.querySelector(":root");
  const nRows = parseInt(getComputedStyle(root).getPropertyValue("--n-rows"));
  const nCols = parseInt(getComputedStyle(root).getPropertyValue("--n-cols"));
  // https://stackoverflow.com/a/42769683
  const gridSize = (
    parseFloat(getComputedStyle(root).getPropertyValue("--cell-size")) *
    parseFloat(getComputedStyle(document.documentElement).fontSize)
  );
  const name = `cell-${point.x}-${point.y}`
  console.log(name, point)
  const rect = new fabric.Rect({
    name,
    width: 1 * gridSize,
    height: 1 * gridSize,
    fill: getCellColor(color),
    left: point.x * gridSize, // + 0.5,
    top: point.y * gridSize, // - 0.5,
    // originX: "left",
    // originY: "top",
    hasControls: false,
    selectable: false,
    hasBorders: false,
    my: {
      obstacle: false,
      cellType: color,
      point,
    }
  });
  return rect;
}

// Shamelessly pulled from https://stackoverflow.com/a/20826113
/**
 * Item name is non-unique
 */
fabric.Canvas.prototype.getItemsByName = function(name) {
  var objectList = [],
      objects = this.getObjects();

  for (var i = 0, len = this.size(); i < len; i++) {
    if (objects[i].name && objects[i].name === name) {
      objectList.push(objects[i]);
    }
  }

  return objectList;
};

/**
 * Item name is unique
 */
fabric.Canvas.prototype.getItemByName = function(name) {
  var object = null,
      objects = this.getObjects();

  for (var i = 0, len = this.size(); i < len; i++) {
    if (objects[i].name && objects[i].name === name) {
      object = objects[i];
      break;
    }
  }

  return object;
};

fabric.SquareBrush = fabric.util.createClass(fabric.BaseBrush, {

  initialize: function(canvas, opt) {
    this.canvas = canvas;
    opt = opt || {};
    this.width = opt.width || 17.5;
    this.height = this.width;
    this.canHaveObstacle = opt.canHaveObstacle || [];
    console.log(this.canHaveObstacle)
    this.points = []
    this._mode = "draw";
  },

  setMode: function (mode) {
    this._mode = mode;
  },

  canAdd: function (point) {
    return this.canHaveObstacle.some(p => p.eq(point));
  },

  drawSquare: function(pointer) {
    const point = this.addPoint(pointer);
    if (!point) {
      console.log(`Found ${point}, which isn't supposed to be an obstacle...`)
      return;
    }
    const ctx = this.canvas.contextTop;
    this._saveAndTransform(ctx);
    this.square(ctx, point);
    ctx.restore();
  },

  square: function(ctx, point) {
    ctx.fillStyle = point.fill;
    ctx.fillRect(
      (point.x * this.width) - point.width / 2,
      (point.y * this.width) - point.height / 2,
      point.width,
      point.height
    );
  },

  onMouseDown: function(pointer) {
    this.points.length = 0;
    this.canvas.clearContext(this.canvas.contextTop);
    this.drawSquare(pointer);
  },

  onMouseMove: function(pointer) {
    if (this._isOutSideCanvas(pointer)) {
      return;
    }
    if (this.needsFullRender()) {
      this.canvas.clearContext(this.canvas.contextTop);
      this.addPoint(pointer);
      this._render();
    } else {
      this.drawSquare(pointer);
    }
  },

  onMouseUp: function(pointer) {
    const originalRenderOnAddRemove = this.canvas.renderOnAddRemove;
    this.canvas.renderOnAddRemove = false;

    for (const point of this.points) {
      const cell = this.canvas.getItemByName(`cell-${point.x}-${point.y}`);
      cell.set("fill", point.fill);
      this.canvas.fire("object:modified", { cell, mode: this._mode, })
      // const sq = new fabric.Rect({
      //   name: `obstacle-${point.x}-${point.y}`,
      //   width: point.width,
      //   height: point.height,
      //   left: point.x,
      //   top: point.y,
      //   originX: "center",
      //   originY: "center",
      //   fill: point.fill,
      // });
      // squares.push(sq);
    }

    // this.canvas.fire("before:path:created", { path: })
    // this.canvas.add(...squares);

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.renderOnAddRemove = originalRenderOnAddRemove;
    this.canvas.requestRenderAll();
  },

  addPoint: function (pointer) {
    const pointerPoint = new fabric.Point(
      Math.round(pointer.x / this.width), Math.round(pointer.y / this.height)
    );
    if (!this.canAdd(pointerPoint)) {
      console.log(`Tried to place ${pointerPoint}, which can't have an obstacle...`)
      return;
    }
    pointerPoint.width = this.width;
    pointerPoint.height = this.height;
    pointerPoint.fill = this._mode === "draw" ? getCellColor("obstacle") : getCellColor("room-chunk");
    this.points.push(pointerPoint);
    return pointerPoint;
  },

  _render: function() {
    const ctx = this.context.contextTop;
    const points = this.points;
    this._saveAndTransform(ctx);
    for (const point of points) {
      this.square(ctx, point);
    }
    ctx.restore();
  }
});