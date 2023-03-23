var jsPsychVslGrid = (function (jspsych) {
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
      back_color: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Background color for grid cell.",
        default: "#000000",
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
        pretty_name: "Background color for grid cell.",
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

  class VslGridPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      display_element.innerHTML = trial.html;
      console.log(trial.html)
      const start_time = performance.now();
      const room = trial.room;
      const obstacleCount = 900;
      const minObstacles = 5;
      let obstacleCounter = 0;

      console.log(room)
      // create the container div for the overlay and grid
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'row';
      container.style.alignItems = 'center';
      container.style.justifyContent = "center";

      const cellSize = trial.cell_size;
      const gridSize = trial.grid_size;
      const [nRows, nCols] = gridSize;

      const instructionsElem = document.createElement("h3");
      instructionsElem.innerHTML = `Please use the grid below to place obstacles in the room. <br />` +
        `To <strong style='color: green;'>add</strong> an obstacle <strong>click on the cell</strong> in the grid. To <strong style='color: red;'>remove</strong> an obstacle, <strong>click on it again</strong>. <br /> <br /> <br />`;
      display_element.appendChild(instructionsElem);

      const legendElem = document.createElement("p");
      legendElem.innerHTML = `<strong> Grid Legend </strong> <br />` + 
      `<entrance></entrance>&emsp;&emsp; <b>Your location</b> &emsp;&emsp;&emsp;&emsp;` +
      `<exit></exit>&emsp;&emsp; <b>Exit</b> &emsp;&emsp;&emsp;&emsp;` +
      `<wall></wall>&emsp;&emsp; <b>Wall</b> &emsp;&emsp;&emsp;&emsp;` + 
      `<obstacle></obstacle>&emsp;&emsp; <b>Obstacle</b> &emsp;&emsp;&emsp;&emsp;` +
      `<no_obstacle></no_obstacle>&emsp;&emsp; <b>Out of field of view</b><br />`;
      legendElem.style.border = "1px solid black"
      legendElem.style.marginBottom = `2rem`;
      display_element.appendChild(legendElem);

      // `<span style="width: 100px; height: 100px; background-color: blue; position: absolute; top:0;bottom: 0;left: 0;right: 0; margin: auto;"></span>`
      const obstacleCountElem = document.createElement("p");
      obstacleCountElem.id = "obstacle-counter";
      obstacleCountElem.style.color = "red";
      display_element.appendChild(obstacleCountElem);

      // create the overlay container
      const overlayContainer = document.createElement('div');
      overlayContainer.id = "overlay-container";
      overlayContainer.style.width = `${cellSize * nCols * 2}px`;
      overlayContainer.style.height = `${cellSize * nRows * 2}px`;
      overlayContainer.style.marginRight = `2rem`;
      overlayContainer.style.position = 'relative';

      function updateObstacleCount() {
        if (obstacleCounter >= minObstacles) {
          nextBtn.disabled = false;
        }
        if (obstacleCounter >= obstacleCount) {
          obstacleCountElem.innerHTML = `You have used the maximum number of obstacles in <strong>this</strong> room.`;
        } else {
          obstacleCountElem.innerHTML = "";
        }
      }

      function addOverlayImage(zIndex = 0, row, col) {
        const img = document.createElement("img");
        if (row >= 0 && col >= 0) {
          img.src = trial.img_path + `${row}_${col}.png`;
          room[row][col] = "o";
          obstacleCounter += 1;
          updateObstacleCount();
        } else {
          img.src = trial.base_img;
        }
        img.style.position = "absolute";
        img.style.top = "0px";
        img.style.left = "0px";
        img.style.zIndex = zIndex;
        img.style.width = "100%";
        img.setAttribute("row", row);
        img.setAttribute("col", col);
        overlayContainer.appendChild(img);
      }

      function delOverlayImage(row, col) {
        for (const child of overlayContainer.children) {
          const childRow = parseInt(child.getAttribute("row"));
          const childCol = parseInt(child.getAttribute("col"));
          if (childRow === row && childCol === col) {
            child.remove();
            room[row][col] = 0;
            obstacleCounter -= 1;
            updateObstacleCount();
          }
        }
      }

      // Add Base Image to the Overlay Container
      addOverlayImage(-9999, -1, -1);

      // create the grid container
      const gridContainer = document.createElement('div');
      // gridContainer.style.flexGrow = '1';

      function addCell(row, col, color, addListener) {
        const cell = document.createElement("td");
        cell.style.border = "1px solid black";
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.backgroundColor = color;

        if (addListener) {
          // TODO: use `mousemove` to drag, needs to be fixed to click for undo
          cell.addEventListener('click', function () {
            switch (cell.style.backgroundColor) {
              case "blue":
                cell.style.backgroundColor = 'white';
                delOverlayImage(row, col);
                break;
              case "white":
                if (obstacleCounter < obstacleCount) {
                  cell.style.backgroundColor = 'blue';
                  addOverlayImage(0, row, col);
                }
                break;
            }
          });
        }
        cell.id = `cell-${row}-${col}`;
        cell.setAttribute("row", row);
        cell.setAttribute("col", col);
        return cell;
      }

      // generate the grid
      function generateGrid(gridSize, cellSize, img_size, back_color) {
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = `${nCols * cellSize}px`;
        table.style.height = `${nRows * cellSize}px`;

        for (let row = 0; row < nRows; row++) {
          const tr = document.createElement('tr');
          for (let col = 0; col < nCols; col++) {
            const isFirstLastRow = [0, nRows - 1].includes(row);
            const isFirstLastCol = [0, nCols - 1].includes(col);
            const hasListener = !isFirstLastRow && !isFirstLastCol;
            const bgcolor = back_color[row][col]

            const cell = addCell(row, col, bgcolor, hasListener);
            tr.appendChild(cell);
          }
          table.appendChild(tr);
        }

        gridContainer.innerHTML = '';
        gridContainer.style.transform = `rotate(180deg)`
        gridContainer.appendChild(table);
        container.appendChild(overlayContainer);
        container.appendChild(gridContainer);
        display_element.appendChild(container);
      }

      // generate the grid and image overlay
      generateGrid(gridSize, cellSize, trial.img_size, trial.back_color);

      const nextBtn = document.createElement("button");
      nextBtn.innerText = "Next";
      nextBtn.classList.add("jspsych-btn");
      nextBtn.style.marginTop = "2rem";
      nextBtn.disabled = true;
      nextBtn.addEventListener("click", () => {
        if (obstacleCounter >= minObstacles) {
          end_trial()
        }
      });
      display_element.appendChild(nextBtn);

      // function to end trial when it is time
      const end_trial = () => {
        // kill any remaining setTimeout handlers
        this.jsPsych.pluginAPI.clearAllTimeouts();
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
  VslGridPlugin.info = info;

  return VslGridPlugin;

})(jsPsychModule);
