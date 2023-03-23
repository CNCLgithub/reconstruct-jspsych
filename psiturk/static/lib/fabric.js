/*! Fabric.js Copyright 2008-2015, Printio (Juriy Zaytsev, Maxim Chernyak) */

var fabric = fabric || { version: '5.2.1' };
if (typeof exports !== 'undefined') {
  exports.fabric = fabric;
}
/* _AMD_START_ */
else if (typeof define === 'function' && define.amd) {
  define([], function() { return fabric; });
}
/* _AMD_END_ */
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (document instanceof (typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document)) {
    fabric.document = document;
  }
  else {
    fabric.document = document.implementation.createHTMLDocument('');
  }
  fabric.window = window;
}
else {
  // assume we're running under node.js when document/window are not present
  var jsdom = require('jsdom');
  var virtualWindow = new jsdom.JSDOM(
    decodeURIComponent('%3C!DOCTYPE%20html%3E%3Chtml%3E%3Chead%3E%3C%2Fhead%3E%3Cbody%3E%3C%2Fbody%3E%3C%2Fhtml%3E'),
    {
      features: {
        FetchExternalResources: ['img']
      },
      resources: 'usable'
    }).window;
  fabric.document = virtualWindow.document;
  fabric.jsdomImplForWrapper = require('jsdom/lib/jsdom/living/generated/utils').implForWrapper;
  fabric.nodeCanvas = require('jsdom/lib/jsdom/utils').Canvas;
  fabric.window = virtualWindow;
  DOMParser = fabric.window.DOMParser;
}

/**
 * True when in environment that supports touch events
 * @type boolean
 */
fabric.isTouchSupported = 'ontouchstart' in fabric.window || 'ontouchstart' in fabric.document ||
  (fabric.window && fabric.window.navigator && fabric.window.navigator.maxTouchPoints > 0);

/**
 * True when in environment that's probably Node.js
 * @type boolean
 */
fabric.isLikelyNode = typeof Buffer !== 'undefined' &&
                      typeof window === 'undefined';



/**
 * Pixel per Inch as a default value set to 96. Can be changed for more realistic conversion.
 */
fabric.DPI = 96;
fabric.reNum = '(?:[-+]?(?:\\d+|\\d*\\.\\d+)(?:[eE][-+]?\\d+)?)';
fabric.commaWsp = '(?:\\s+,?\\s*|,\\s*)';
fabric.rePathCommand = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:[eE][-+]?\d+)?)/ig;
fabric.reNonWord = /[ \n\.,;!\?\-]/;
fabric.fontPaths = { };
fabric.iMatrix = [1, 0, 0, 1, 0, 0];
fabric.svgNS = 'http://www.w3.org/2000/svg';

/**
 * Pixel limit for cache canvases. 1Mpx , 4Mpx should be fine.
 * @since 1.7.14
 * @type Number
 * @default
 */
fabric.perfLimitSizeTotal = 2097152;

/**
 * Pixel limit for cache canvases width or height. IE fixes the maximum at 5000
 * @since 1.7.14
 * @type Number
 * @default
 */
fabric.maxCacheSideLimit = 4096;

/**
 * Lowest pixel limit for cache canvases, set at 256PX
 * @since 1.7.14
 * @type Number
 * @default
 */
fabric.minCacheSideLimit = 256;

/**
 * Cache Object for widths of chars in text rendering.
 */
fabric.charWidthsCache = { };

/**
 * if webgl is enabled and available, textureSize will determine the size
 * of the canvas backend
 * @since 2.0.0
 * @type Number
 * @default
 */
fabric.textureSize = 2048;

/**
 * When 'true', style information is not retained when copy/pasting text, making
 * pasted text use destination style.
 * Defaults to 'false'.
 * @type Boolean
 * @default
 */
fabric.disableStyleCopyPaste = false;

/**
 * Enable webgl for filtering picture is available
 * A filtering backend will be initialized, this will both take memory and
 * time since a default 2048x2048 canvas will be created for the gl context
 * @since 2.0.0
 * @type Boolean
 * @default
 */
fabric.enableGLFiltering = true;

/**
 * Device Pixel Ratio
 * @see https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/SettingUptheCanvas/SettingUptheCanvas.html
 */
fabric.devicePixelRatio = fabric.window.devicePixelRatio ||
                          fabric.window.webkitDevicePixelRatio ||
                          fabric.window.mozDevicePixelRatio ||
                          1;
/**
 * Browser-specific constant to adjust CanvasRenderingContext2D.shadowBlur value,
 * which is unitless and not rendered equally across browsers.
 *
 * Values that work quite well (as of October 2017) are:
 * - Chrome: 1.5
 * - Edge: 1.75
 * - Firefox: 0.9
 * - Safari: 0.95
 *
 * @since 2.0.0
 * @type Number
 * @default 1
 */
fabric.browserShadowBlurConstant = 1;

/**
 * This object contains the result of arc to bezier conversion for faster retrieving if the same arc needs to be converted again.
 * It was an internal variable, is accessible since version 2.3.4
 */
fabric.arcToSegmentsCache = { };

/**
 * This object keeps the results of the boundsOfCurve calculation mapped by the joined arguments necessary to calculate it.
 * It does speed up calculation, if you parse and add always the same paths, but in case of heavy usage of freedrawing
 * you do not get any speed benefit and you get a big object in memory.
 * The object was a private variable before, while now is appended to the lib so that you have access to it and you
 * can eventually clear it.
 * It was an internal variable, is accessible since version 2.3.4
 */
fabric.boundsOfCurveCache = { };

/**
 * If disabled boundsOfCurveCache is not used. For apps that make heavy usage of pencil drawing probably disabling it is better
 * @default true
 */
fabric.cachesBoundsOfCurve = true;

/**
 * Skip performance testing of setupGLContext and force the use of putImageData that seems to be the one that works best on
 * Chrome + old hardware. if your users are experiencing empty images after filtering you may try to force this to true
 * this has to be set before instantiating the filtering backend ( before filtering the first image )
 * @type Boolean
 * @default false
 */
fabric.forceGLPutImageData = false;

fabric.initFilterBackend = function() {
  if (fabric.enableGLFiltering && fabric.isWebglSupported && fabric.isWebglSupported(fabric.textureSize)) {
    console.log('max texture size: ' + fabric.maxTextureSize);
    return (new fabric.WebglFilterBackend({ tileSize: fabric.textureSize }));
  }
  else if (fabric.Canvas2dFilterBackend) {
    return (new fabric.Canvas2dFilterBackend());
  }
};
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // ensure globality even if entire library were function wrapped (as in Meteor.js packaging system)
  window.fabric = fabric;
}
(function() {

  /**
   * @private
   * @param {String} eventName
   * @param {Function} handler
   */
  function _removeEventListener(eventName, handler) {
    if (!this.__eventListeners[eventName]) {
      return;
    }
    var eventListener = this.__eventListeners[eventName];
    if (handler) {
      eventListener[eventListener.indexOf(handler)] = false;
    }
    else {
      fabric.util.array.fill(eventListener, false);
    }
  }

  /**
   * Observes specified event
   * @memberOf fabric.Observable
   * @alias on
   * @param {String|Object} eventName Event name (eg. 'after:render') or object with key/value pairs (eg. {'after:render': handler, 'selection:cleared': handler})
   * @param {Function} handler Function that receives a notification when an event of the specified type occurs
   * @return {Self} thisArg
   * @chainable
   */
  function on(eventName, handler) {
    if (!this.__eventListeners) {
      this.__eventListeners = { };
    }
    // one object with key/value pairs was passed
    if (arguments.length === 1) {
      for (var prop in eventName) {
        this.on(prop, eventName[prop]);
      }
    }
    else {
      if (!this.__eventListeners[eventName]) {
        this.__eventListeners[eventName] = [];
      }
      this.__eventListeners[eventName].push(handler);
    }
    return this;
  }

  function _once(eventName, handler) {
    var _handler = function () {
      handler.apply(this, arguments);
      this.off(eventName, _handler);
    }.bind(this);
    this.on(eventName, _handler);
  }

  function once(eventName, handler) {
    // one object with key/value pairs was passed
    if (arguments.length === 1) {
      for (var prop in eventName) {
        _once.call(this, prop, eventName[prop]);
      }
    }
    else {
      _once.call(this, eventName, handler);
    }
    return this;
  }

  /**
   * Stops event observing for a particular event handler. Calling this method
   * without arguments removes all handlers for all events
   * @memberOf fabric.Observable
   * @alias off
   * @param {String|Object} eventName Event name (eg. 'after:render') or object with key/value pairs (eg. {'after:render': handler, 'selection:cleared': handler})
   * @param {Function} handler Function to be deleted from EventListeners
   * @return {Self} thisArg
   * @chainable
   */
  function off(eventName, handler) {
    if (!this.__eventListeners) {
      return this;
    }

    // remove all key/value pairs (event name -> event handler)
    if (arguments.length === 0) {
      for (eventName in this.__eventListeners) {
        _removeEventListener.call(this, eventName);
      }
    }
    // one object with key/value pairs was passed
    else if (arguments.length === 1 && typeof arguments[0] === 'object') {
      for (var prop in eventName) {
        _removeEventListener.call(this, prop, eventName[prop]);
      }
    }
    else {
      _removeEventListener.call(this, eventName, handler);
    }
    return this;
  }

  /**
   * Fires event with an optional options object
   * @memberOf fabric.Observable
   * @param {String} eventName Event name to fire
   * @param {Object} [options] Options object
   * @return {Self} thisArg
   * @chainable
   */
  function fire(eventName, options) {
    if (!this.__eventListeners) {
      return this;
    }

    var listenersForEvent = this.__eventListeners[eventName];
    if (!listenersForEvent) {
      return this;
    }

    for (var i = 0, len = listenersForEvent.length; i < len; i++) {
      listenersForEvent[i] && listenersForEvent[i].call(this, options || { });
    }
    this.__eventListeners[eventName] = listenersForEvent.filter(function(value) {
      return value !== false;
    });
    return this;
  }

  /**
   * @namespace fabric.Observable
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#events}
   * @see {@link http://fabricjs.com/events|Events demo}
   */
  fabric.Observable = {
    fire: fire,
    on: on,
    once: once,
    off: off,
  };
})();
/**
 * @namespace fabric.Collection
 */
fabric.Collection = {

  _objects: [],

  /**
   * Adds objects to collection, Canvas or Group, then renders canvas
   * (if `renderOnAddRemove` is not `false`).
   * in case of Group no changes to bounding box are made.
   * Objects should be instances of (or inherit from) fabric.Object
   * Use of this function is highly discouraged for groups.
   * you can add a bunch of objects with the add method but then you NEED
   * to run a addWithUpdate call for the Group class or position/bbox will be wrong.
   * @param {...fabric.Object} object Zero or more fabric instances
   * @return {Self} thisArg
   * @chainable
   */
  add: function () {
    this._objects.push.apply(this._objects, arguments);
    if (this._onObjectAdded) {
      for (var i = 0, length = arguments.length; i < length; i++) {
        this._onObjectAdded(arguments[i]);
      }
    }
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  },

  /**
   * Inserts an object into collection at specified index, then renders canvas (if `renderOnAddRemove` is not `false`)
   * An object should be an instance of (or inherit from) fabric.Object
   * Use of this function is highly discouraged for groups.
   * you can add a bunch of objects with the insertAt method but then you NEED
   * to run a addWithUpdate call for the Group class or position/bbox will be wrong.
   * @param {Object} object Object to insert
   * @param {Number} index Index to insert object at
   * @param {Boolean} nonSplicing When `true`, no splicing (shifting) of objects occurs
   * @return {Self} thisArg
   * @chainable
   */
  insertAt: function (object, index, nonSplicing) {
    var objects = this._objects;
    if (nonSplicing) {
      objects[index] = object;
    }
    else {
      objects.splice(index, 0, object);
    }
    this._onObjectAdded && this._onObjectAdded(object);
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  },

  /**
   * Removes objects from a collection, then renders canvas (if `renderOnAddRemove` is not `false`)
   * @param {...fabric.Object} object Zero or more fabric instances
   * @return {Self} thisArg
   * @chainable
   */
  remove: function() {
    var objects = this._objects,
        index, somethingRemoved = false;

    for (var i = 0, length = arguments.length; i < length; i++) {
      index = objects.indexOf(arguments[i]);

      // only call onObjectRemoved if an object was actually removed
      if (index !== -1) {
        somethingRemoved = true;
        objects.splice(index, 1);
        this._onObjectRemoved && this._onObjectRemoved(arguments[i]);
      }
    }

    this.renderOnAddRemove && somethingRemoved && this.requestRenderAll();
    return this;
  },

  /**
   * Executes given function for each object in this group
   * @param {Function} callback
   *                   Callback invoked with current object as first argument,
   *                   index - as second and an array of all objects - as third.
   *                   Callback is invoked in a context of Global Object (e.g. `window`)
   *                   when no `context` argument is given
   *
   * @param {Object} context Context (aka thisObject)
   * @return {Self} thisArg
   * @chainable
   */
  forEachObject: function(callback, context) {
    var objects = this.getObjects();
    for (var i = 0, len = objects.length; i < len; i++) {
      callback.call(context, objects[i], i, objects);
    }
    return this;
  },

  /**
   * Returns an array of children objects of this instance
   * Type parameter introduced in 1.3.10
   * since 2.3.5 this method return always a COPY of the array;
   * @param {String} [type] When specified, only objects of this type are returned
   * @return {Array}
   */
  getObjects: function(type) {
    if (typeof type === 'undefined') {
      return this._objects.concat();
    }
    return this._objects.filter(function(o) {
      return o.type === type;
    });
  },

  /**
   * Returns object at specified index
   * @param {Number} index
   * @return {Self} thisArg
   */
  item: function (index) {
    return this._objects[index];
  },

  /**
   * Returns true if collection contains no objects
   * @return {Boolean} true if collection is empty
   */
  isEmpty: function () {
    return this._objects.length === 0;
  },

  /**
   * Returns a size of a collection (i.e: length of an array containing its objects)
   * @return {Number} Collection size
   */
  size: function() {
    return this._objects.length;
  },

  /**
   * Returns true if collection contains an object
   * @param {Object} object Object to check against
   * @param {Boolean} [deep=false] `true` to check all descendants, `false` to check only `_objects`
   * @return {Boolean} `true` if collection contains an object
   */
  contains: function (object, deep) {
    if (this._objects.indexOf(object) > -1) {
      return true;
    }
    else if (deep) {
      return this._objects.some(function (obj) {
        return typeof obj.contains === 'function' && obj.contains(object, true);
      });
    }
    return false;
  },

  /**
   * Returns number representation of a collection complexity
   * @return {Number} complexity
   */
  complexity: function () {
    return this._objects.reduce(function (memo, current) {
      memo += current.complexity ? current.complexity() : 0;
      return memo;
    }, 0);
  }
};
/**
 * @namespace fabric.CommonMethods
 */
fabric.CommonMethods = {

  /**
   * Sets object's properties from options
   * @param {Object} [options] Options object
   */
  _setOptions: function(options) {
    for (var prop in options) {
      this.set(prop, options[prop]);
    }
  },

  /**
   * @private
   * @param {Object} [filler] Options object
   * @param {String} [property] property to set the Gradient to
   */
  _initGradient: function(filler, property) {
    if (filler && filler.colorStops && !(filler instanceof fabric.Gradient)) {
      this.set(property, new fabric.Gradient(filler));
    }
  },

  /**
   * @private
   * @param {Object} [filler] Options object
   * @param {String} [property] property to set the Pattern to
   * @param {Function} [callback] callback to invoke after pattern load
   */
  _initPattern: function(filler, property, callback) {
    if (filler && filler.source && !(filler instanceof fabric.Pattern)) {
      this.set(property, new fabric.Pattern(filler, callback));
    }
    else {
      callback && callback();
    }
  },

  /**
   * @private
   */
  _setObject: function(obj) {
    for (var prop in obj) {
      this._set(prop, obj[prop]);
    }
  },

  /**
   * Sets property to a given value. When changing position/dimension -related properties (left, top, scale, angle, etc.) `set` does not update position of object's borders/controls. If you need to update those, call `setCoords()`.
   * @param {String|Object} key Property name or object (if object, iterate over the object properties)
   * @param {Object|Function} value Property value (if function, the value is passed into it and its return value is used as a new one)
   * @return {fabric.Object} thisArg
   * @chainable
   */
  set: function(key, value) {
    if (typeof key === 'object') {
      this._setObject(key);
    }
    else {
      this._set(key, value);
    }
    return this;
  },

  _set: function(key, value) {
    this[key] = value;
  },

  /**
   * Toggles specified property from `true` to `false` or from `false` to `true`
   * @param {String} property Property to toggle
   * @return {fabric.Object} thisArg
   * @chainable
   */
  toggle: function(property) {
    var value = this.get(property);
    if (typeof value === 'boolean') {
      this.set(property, !value);
    }
    return this;
  },

  /**
   * Basic getter
   * @param {String} property Property name
   * @return {*} value of a property
   */
  get: function(property) {
    return this[property];
  }
};
(function(global) {

  var sqrt = Math.sqrt,
      atan2 = Math.atan2,
      pow = Math.pow,
      PiBy180 = Math.PI / 180,
      PiBy2 = Math.PI / 2;

  /**
   * @namespace fabric.util
   */
  fabric.util = {

    /**
     * Calculate the cos of an angle, avoiding returning floats for known results
     * @static
     * @memberOf fabric.util
     * @param {Number} angle the angle in radians or in degree
     * @return {Number}
     */
    cos: function(angle) {
      if (angle === 0) { return 1; }
      if (angle < 0) {
        // cos(a) = cos(-a)
        angle = -angle;
      }
      var angleSlice = angle / PiBy2;
      switch (angleSlice) {
        case 1: case 3: return 0;
        case 2: return -1;
      }
      return Math.cos(angle);
    },

    /**
     * Calculate the sin of an angle, avoiding returning floats for known results
     * @static
     * @memberOf fabric.util
     * @param {Number} angle the angle in radians or in degree
     * @return {Number}
     */
    sin: function(angle) {
      if (angle === 0) { return 0; }
      var angleSlice = angle / PiBy2, sign = 1;
      if (angle < 0) {
        // sin(-a) = -sin(a)
        sign = -1;
      }
      switch (angleSlice) {
        case 1: return sign;
        case 2: return 0;
        case 3: return -sign;
      }
      return Math.sin(angle);
    },

    /**
     * Removes value from an array.
     * Presence of value (and its position in an array) is determined via `Array.prototype.indexOf`
     * @static
     * @memberOf fabric.util
     * @param {Array} array
     * @param {*} value
     * @return {Array} original array
     */
    removeFromArray: function(array, value) {
      var idx = array.indexOf(value);
      if (idx !== -1) {
        array.splice(idx, 1);
      }
      return array;
    },

    /**
     * Returns random number between 2 specified ones.
     * @static
     * @memberOf fabric.util
     * @param {Number} min lower limit
     * @param {Number} max upper limit
     * @return {Number} random value (between min and max)
     */
    getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Transforms degrees to radians.
     * @static
     * @memberOf fabric.util
     * @param {Number} degrees value in degrees
     * @return {Number} value in radians
     */
    degreesToRadians: function(degrees) {
      return degrees * PiBy180;
    },

    /**
     * Transforms radians to degrees.
     * @static
     * @memberOf fabric.util
     * @param {Number} radians value in radians
     * @return {Number} value in degrees
     */
    radiansToDegrees: function(radians) {
      return radians / PiBy180;
    },

    /**
     * Rotates `point` around `origin` with `radians`
     * @static
     * @memberOf fabric.util
     * @param {fabric.Point} point The point to rotate
     * @param {fabric.Point} origin The origin of the rotation
     * @param {Number} radians The radians of the angle for the rotation
     * @return {fabric.Point} The new rotated point
     */
    rotatePoint: function(point, origin, radians) {
      var newPoint = new fabric.Point(point.x - origin.x, point.y - origin.y),
          v = fabric.util.rotateVector(newPoint, radians);
      return new fabric.Point(v.x, v.y).addEquals(origin);
    },

    /**
     * Rotates `vector` with `radians`
     * @static
     * @memberOf fabric.util
     * @param {Object} vector The vector to rotate (x and y)
     * @param {Number} radians The radians of the angle for the rotation
     * @return {Object} The new rotated point
     */
    rotateVector: function(vector, radians) {
      var sin = fabric.util.sin(radians),
          cos = fabric.util.cos(radians),
          rx = vector.x * cos - vector.y * sin,
          ry = vector.x * sin + vector.y * cos;
      return {
        x: rx,
        y: ry
      };
    },

    /**
     * Creates a vetor from points represented as a point
     * @static
     * @memberOf fabric.util
     *
     * @typedef {Object} Point
     * @property {number} x
     * @property {number} y
     *
     * @param {Point} from
     * @param {Point} to
     * @returns {Point} vector
     */
    createVector: function (from, to) {
      return new fabric.Point(to.x - from.x, to.y - from.y);
    },

    /**
     * Calculates angle between 2 vectors using dot product
     * @static
     * @memberOf fabric.util
     * @param {Point} a
     * @param {Point} b
     * @returns the angle in radian between the vectors
     */
    calcAngleBetweenVectors: function (a, b) {
      return Math.acos((a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y)));
    },

    /**
     * @static
     * @memberOf fabric.util
     * @param {Point} v
     * @returns {Point} vector representing the unit vector of pointing to the direction of `v`
     */
    getHatVector: function (v) {
      return new fabric.Point(v.x, v.y).multiply(1 / Math.hypot(v.x, v.y));
    },

    /**
     * @static
     * @memberOf fabric.util
     * @param {Point} A
     * @param {Point} B
     * @param {Point} C
     * @returns {{ vector: Point, angle: number }} vector representing the bisector of A and A's angle
     */
    getBisector: function (A, B, C) {
      var AB = fabric.util.createVector(A, B), AC = fabric.util.createVector(A, C);
      var alpha = fabric.util.calcAngleBetweenVectors(AB, AC);
      //  check if alpha is relative to AB->BC
      var ro = fabric.util.calcAngleBetweenVectors(fabric.util.rotateVector(AB, alpha), AC);
      var phi = alpha * (ro === 0 ? 1 : -1) / 2;
      return {
        vector: fabric.util.getHatVector(fabric.util.rotateVector(AB, phi)),
        angle: alpha
      };
    },

    /**
     * Project stroke width on points returning 2 projections for each point as follows:
     * - `miter`: 2 points corresponding to the outer boundary and the inner boundary of stroke.
     * - `bevel`: 2 points corresponding to the bevel boundaries, tangent to the bisector.
     * - `round`: same as `bevel`
     * Used to calculate object's bounding box
     * @static
     * @memberOf fabric.util
     * @param {Point[]} points
     * @param {Object} options
     * @param {number} options.strokeWidth
     * @param {'miter'|'bevel'|'round'} options.strokeLineJoin
     * @param {number} options.strokeMiterLimit https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-miterlimit
     * @param {boolean} options.strokeUniform
     * @param {number} options.scaleX
     * @param {number} options.scaleY
     * @param {boolean} [openPath] whether the shape is open or not, affects the calculations of the first and last points
     * @returns {fabric.Point[]} array of size 2n/4n of all suspected points
     */
    projectStrokeOnPoints: function (points, options, openPath) {
      var coords = [], s = options.strokeWidth / 2,
          strokeUniformScalar = options.strokeUniform ?
            new fabric.Point(1 / options.scaleX, 1 / options.scaleY) : new fabric.Point(1, 1),
          getStrokeHatVector = function (v) {
            var scalar = s / (Math.hypot(v.x, v.y));
            return new fabric.Point(v.x * scalar * strokeUniformScalar.x, v.y * scalar * strokeUniformScalar.y);
          };
      if (points.length <= 1) {return coords;}
      points.forEach(function (p, index) {
        var A = new fabric.Point(p.x, p.y), B, C;
        if (index === 0) {
          C = points[index + 1];
          B = openPath ? getStrokeHatVector(fabric.util.createVector(C, A)).addEquals(A) : points[points.length - 1];
        }
        else if (index === points.length - 1) {
          B = points[index - 1];
          C = openPath ? getStrokeHatVector(fabric.util.createVector(B, A)).addEquals(A) : points[0];
        }
        else {
          B = points[index - 1];
          C = points[index + 1];
        }
        var bisector = fabric.util.getBisector(A, B, C),
            bisectorVector = bisector.vector,
            alpha = bisector.angle,
            scalar,
            miterVector;
        if (options.strokeLineJoin === 'miter') {
          scalar = -s / Math.sin(alpha / 2);
          miterVector = new fabric.Point(
            bisectorVector.x * scalar * strokeUniformScalar.x,
            bisectorVector.y * scalar * strokeUniformScalar.y
          );
          if (Math.hypot(miterVector.x, miterVector.y) / s <= options.strokeMiterLimit) {
            coords.push(A.add(miterVector));
            coords.push(A.subtract(miterVector));
            return;
          }
        }
        scalar = -s * Math.SQRT2;
        miterVector = new fabric.Point(
          bisectorVector.x * scalar * strokeUniformScalar.x,
          bisectorVector.y * scalar * strokeUniformScalar.y
        );
        coords.push(A.add(miterVector));
        coords.push(A.subtract(miterVector));
      });
      return coords;
    },

    /**
     * Apply transform t to point p
     * @static
     * @memberOf fabric.util
     * @param  {fabric.Point} p The point to transform
     * @param  {Array} t The transform
     * @param  {Boolean} [ignoreOffset] Indicates that the offset should not be applied
     * @return {fabric.Point} The transformed point
     */
    transformPoint: function(p, t, ignoreOffset) {
      if (ignoreOffset) {
        return new fabric.Point(
          t[0] * p.x + t[2] * p.y,
          t[1] * p.x + t[3] * p.y
        );
      }
      return new fabric.Point(
        t[0] * p.x + t[2] * p.y + t[4],
        t[1] * p.x + t[3] * p.y + t[5]
      );
    },

    /**
     * Returns coordinates of points's bounding rectangle (left, top, width, height)
     * @param {Array} points 4 points array
     * @param {Array} [transform] an array of 6 numbers representing a 2x3 transform matrix
     * @return {Object} Object with left, top, width, height properties
     */
    makeBoundingBoxFromPoints: function(points, transform) {
      if (transform) {
        for (var i = 0; i < points.length; i++) {
          points[i] = fabric.util.transformPoint(points[i], transform);
        }
      }
      var xPoints = [points[0].x, points[1].x, points[2].x, points[3].x],
          minX = fabric.util.array.min(xPoints),
          maxX = fabric.util.array.max(xPoints),
          width = maxX - minX,
          yPoints = [points[0].y, points[1].y, points[2].y, points[3].y],
          minY = fabric.util.array.min(yPoints),
          maxY = fabric.util.array.max(yPoints),
          height = maxY - minY;

      return {
        left: minX,
        top: minY,
        width: width,
        height: height
      };
    },

    /**
     * Invert transformation t
     * @static
     * @memberOf fabric.util
     * @param {Array} t The transform
     * @return {Array} The inverted transform
     */
    invertTransform: function(t) {
      var a = 1 / (t[0] * t[3] - t[1] * t[2]),
          r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
          o = fabric.util.transformPoint({ x: t[4], y: t[5] }, r, true);
      r[4] = -o.x;
      r[5] = -o.y;
      return r;
    },

    /**
     * A wrapper around Number#toFixed, which contrary to native method returns number, not string.
     * @static
     * @memberOf fabric.util
     * @param {Number|String} number number to operate on
     * @param {Number} fractionDigits number of fraction digits to "leave"
     * @return {Number}
     */
    toFixed: function(number, fractionDigits) {
      return parseFloat(Number(number).toFixed(fractionDigits));
    },

    /**
     * Converts from attribute value to pixel value if applicable.
     * Returns converted pixels or original value not converted.
     * @param {Number|String} value number to operate on
     * @param {Number} fontSize
     * @return {Number|String}
     */
    parseUnit: function(value, fontSize) {
      var unit = /\D{0,2}$/.exec(value),
          number = parseFloat(value);
      if (!fontSize) {
        fontSize = fabric.Text.DEFAULT_SVG_FONT_SIZE;
      }
      switch (unit[0]) {
        case 'mm':
          return number * fabric.DPI / 25.4;

        case 'cm':
          return number * fabric.DPI / 2.54;

        case 'in':
          return number * fabric.DPI;

        case 'pt':
          return number * fabric.DPI / 72; // or * 4 / 3

        case 'pc':
          return number * fabric.DPI / 72 * 12; // or * 16

        case 'em':
          return number * fontSize;

        default:
          return number;
      }
    },

    /**
     * Function which always returns `false`.
     * @static
     * @memberOf fabric.util
     * @return {Boolean}
     */
    falseFunction: function() {
      return false;
    },

    /**
     * Returns klass "Class" object of given namespace
     * @memberOf fabric.util
     * @param {String} type Type of object (eg. 'circle')
     * @param {String} namespace Namespace to get klass "Class" object from
     * @return {Object} klass "Class"
     */
    getKlass: function(type, namespace) {
      // capitalize first letter only
      type = fabric.util.string.camelize(type.charAt(0).toUpperCase() + type.slice(1));
      return fabric.util.resolveNamespace(namespace)[type];
    },

    /**
     * Returns array of attributes for given svg that fabric parses
     * @memberOf fabric.util
     * @param {String} type Type of svg element (eg. 'circle')
     * @return {Array} string names of supported attributes
     */
    getSvgAttributes: function(type) {
      var attributes = [
        'instantiated_by_use',
        'style',
        'id',
        'class'
      ];
      switch (type) {
        case 'linearGradient':
          attributes = attributes.concat(['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform']);
          break;
        case 'radialGradient':
          attributes = attributes.concat(['gradientUnits', 'gradientTransform', 'cx', 'cy', 'r', 'fx', 'fy', 'fr']);
          break;
        case 'stop':
          attributes = attributes.concat(['offset', 'stop-color', 'stop-opacity']);
          break;
      }
      return attributes;
    },

    /**
     * Returns object of given namespace
     * @memberOf fabric.util
     * @param {String} namespace Namespace string e.g. 'fabric.Image.filter' or 'fabric'
     * @return {Object} Object for given namespace (default fabric)
     */
    resolveNamespace: function(namespace) {
      if (!namespace) {
        return fabric;
      }

      var parts = namespace.split('.'),
          len = parts.length, i,
          obj = global || fabric.window;

      for (i = 0; i < len; ++i) {
        obj = obj[parts[i]];
      }

      return obj;
    },

    /**
     * Loads image element from given url and passes it to a callback
     * @memberOf fabric.util
     * @param {String} url URL representing an image
     * @param {Function} callback Callback; invoked with loaded image
     * @param {*} [context] Context to invoke callback in
     * @param {Object} [crossOrigin] crossOrigin value to set image element to
     */
    loadImage: function(url, callback, context, crossOrigin) {
      if (!url) {
        callback && callback.call(context, url);
        return;
      }

      var img = fabric.util.createImage();

      /** @ignore */
      var onLoadCallback = function () {
        callback && callback.call(context, img, false);
        img = img.onload = img.onerror = null;
      };

      img.onload = onLoadCallback;
      /** @ignore */
      img.onerror = function() {
        fabric.log('Error loading ' + img.src);
        callback && callback.call(context, null, true);
        img = img.onload = img.onerror = null;
      };

      // data-urls appear to be buggy with crossOrigin
      // https://github.com/kangax/fabric.js/commit/d0abb90f1cd5c5ef9d2a94d3fb21a22330da3e0a#commitcomment-4513767
      // see https://code.google.com/p/chromium/issues/detail?id=315152
      //     https://bugzilla.mozilla.org/show_bug.cgi?id=935069
      // crossOrigin null is the same as not set.
      if (url.indexOf('data') !== 0 &&
        crossOrigin !== undefined &&
        crossOrigin !== null) {
        img.crossOrigin = crossOrigin;
      }

      // IE10 / IE11-Fix: SVG contents from data: URI
      // will only be available if the IMG is present
      // in the DOM (and visible)
      if (url.substring(0,14) === 'data:image/svg') {
        img.onload = null;
        fabric.util.loadImageInDom(img, onLoadCallback);
      }

      img.src = url;
    },

    /**
     * Attaches SVG image with data: URL to the dom
     * @memberOf fabric.util
     * @param {Object} img Image object with data:image/svg src
     * @param {Function} callback Callback; invoked with loaded image
     * @return {Object} DOM element (div containing the SVG image)
     */
    loadImageInDom: function(img, onLoadCallback) {
      var div = fabric.document.createElement('div');
      div.style.width = div.style.height = '1px';
      div.style.left = div.style.top = '-100%';
      div.style.position = 'absolute';
      div.appendChild(img);
      fabric.document.querySelector('body').appendChild(div);
      /**
       * Wrap in function to:
       *   1. Call existing callback
       *   2. Cleanup DOM
       */
      img.onload = function () {
        onLoadCallback();
        div.parentNode.removeChild(div);
        div = null;
      };
    },

    /**
     * Creates corresponding fabric instances from their object representations
     * @static
     * @memberOf fabric.util
     * @param {Array} objects Objects to enliven
     * @param {Function} callback Callback to invoke when all objects are created
     * @param {String} namespace Namespace to get klass "Class" object from
     * @param {Function} reviver Method for further parsing of object elements,
     * called after each fabric object created.
     */
    enlivenObjects: function(objects, callback, namespace, reviver) {
      objects = objects || [];

      var enlivenedObjects = [],
          numLoadedObjects = 0,
          numTotalObjects = objects.length;

      function onLoaded() {
        if (++numLoadedObjects === numTotalObjects) {
          callback && callback(enlivenedObjects.filter(function(obj) {
            // filter out undefined objects (objects that gave error)
            return obj;
          }));
        }
      }

      if (!numTotalObjects) {
        callback && callback(enlivenedObjects);
        return;
      }

      objects.forEach(function (o, index) {
        // if sparse array
        if (!o || !o.type) {
          onLoaded();
          return;
        }
        var klass = fabric.util.getKlass(o.type, namespace);
        klass.fromObject(o, function (obj, error) {
          error || (enlivenedObjects[index] = obj);
          reviver && reviver(o, obj, error);
          onLoaded();
        });
      });
    },

    /**
     * Creates corresponding fabric instances residing in an object, e.g. `clipPath`
     * @see {@link fabric.Object.ENLIVEN_PROPS}
     * @param {Object} object
     * @param {Object} [context] assign enlived props to this object (pass null to skip this)
     * @param {(objects:fabric.Object[]) => void} callback
     */
    enlivenObjectEnlivables: function (object, context, callback) {
      var enlivenProps = fabric.Object.ENLIVEN_PROPS.filter(function (key) { return !!object[key]; });
      fabric.util.enlivenObjects(enlivenProps.map(function (key) { return object[key]; }), function (enlivedProps) {
        var objects = {};
        enlivenProps.forEach(function (key, index) {
          objects[key] = enlivedProps[index];
          context && (context[key] = enlivedProps[index]);
        });
        callback && callback(objects);
      });
    },

    /**
     * Create and wait for loading of patterns
     * @static
     * @memberOf fabric.util
     * @param {Array} patterns Objects to enliven
     * @param {Function} callback Callback to invoke when all objects are created
     * called after each fabric object created.
     */
    enlivenPatterns: function(patterns, callback) {
      patterns = patterns || [];

      function onLoaded() {
        if (++numLoadedPatterns === numPatterns) {
          callback && callback(enlivenedPatterns);
        }
      }

      var enlivenedPatterns = [],
          numLoadedPatterns = 0,
          numPatterns = patterns.length;

      if (!numPatterns) {
        callback && callback(enlivenedPatterns);
        return;
      }

      patterns.forEach(function (p, index) {
        if (p && p.source) {
          new fabric.Pattern(p, function(pattern) {
            enlivenedPatterns[index] = pattern;
            onLoaded();
          });
        }
        else {
          enlivenedPatterns[index] = p;
          onLoaded();
        }
      });
    },

    /**
     * Groups SVG elements (usually those retrieved from SVG document)
     * @static
     * @memberOf fabric.util
     * @param {Array} elements SVG elements to group
     * @param {Object} [options] Options object
     * @param {String} path Value to set sourcePath to
     * @return {fabric.Object|fabric.Group}
     */
    groupSVGElements: function(elements, options, path) {
      var object;
      if (elements && elements.length === 1) {
        return elements[0];
      }
      if (options) {
        if (options.width && options.height) {
          options.centerPoint = {
            x: options.width / 2,
            y: options.height / 2
          };
        }
        else {
          delete options.width;
          delete options.height;
        }
      }
      object = new fabric.Group(elements, options);
      if (typeof path !== 'undefined') {
        object.sourcePath = path;
      }
      return object;
    },

    /**
     * Populates an object with properties of another object
     * @static
     * @memberOf fabric.util
     * @param {Object} source Source object
     * @param {Object} destination Destination object
     * @return {Array} properties Properties names to include
     */
    populateWithProperties: function(source, destination, properties) {
      if (properties && Array.isArray(properties)) {
        for (var i = 0, len = properties.length; i < len; i++) {
          if (properties[i] in source) {
            destination[properties[i]] = source[properties[i]];
          }
        }
      }
    },

    /**
     * Creates canvas element
     * @static
     * @memberOf fabric.util
     * @return {CanvasElement} initialized canvas element
     */
    createCanvasElement: function() {
      return fabric.document.createElement('canvas');
    },

    /**
     * Creates a canvas element that is a copy of another and is also painted
     * @param {CanvasElement} canvas to copy size and content of
     * @static
     * @memberOf fabric.util
     * @return {CanvasElement} initialized canvas element
     */
    copyCanvasElement: function(canvas) {
      var newCanvas = fabric.util.createCanvasElement();
      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;
      newCanvas.getContext('2d').drawImage(canvas, 0, 0);
      return newCanvas;
    },

    /**
     * since 2.6.0 moved from canvas instance to utility.
     * @param {CanvasElement} canvasEl to copy size and content of
     * @param {String} format 'jpeg' or 'png', in some browsers 'webp' is ok too
     * @param {Number} quality <= 1 and > 0
     * @static
     * @memberOf fabric.util
     * @return {String} data url
     */
    toDataURL: function(canvasEl, format, quality) {
      return canvasEl.toDataURL('image/' + format, quality);
    },

    /**
     * Creates image element (works on client and node)
     * @static
     * @memberOf fabric.util
     * @return {HTMLImageElement} HTML image element
     */
    createImage: function() {
      return fabric.document.createElement('img');
    },

    /**
     * Multiply matrix A by matrix B to nest transformations
     * @static
     * @memberOf fabric.util
     * @param  {Array} a First transformMatrix
     * @param  {Array} b Second transformMatrix
     * @param  {Boolean} is2x2 flag to multiply matrices as 2x2 matrices
     * @return {Array} The product of the two transform matrices
     */
    multiplyTransformMatrices: function(a, b, is2x2) {
      // Matrix multiply a * b
      return [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4],
        is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5]
      ];
    },

    /**
     * Decomposes standard 2x3 matrix into transform components
     * @static
     * @memberOf fabric.util
     * @param  {Array} a transformMatrix
     * @return {Object} Components of transform
     */
    qrDecompose: function(a) {
      var angle = atan2(a[1], a[0]),
          denom = pow(a[0], 2) + pow(a[1], 2),
          scaleX = sqrt(denom),
          scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX,
          skewX = atan2(a[0] * a[2] + a[1] * a [3], denom);
      return {
        angle: angle / PiBy180,
        scaleX: scaleX,
        scaleY: scaleY,
        skewX: skewX / PiBy180,
        skewY: 0,
        translateX: a[4],
        translateY: a[5]
      };
    },

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enlived yet
     * @static
     * @memberOf fabric.util
     * @param  {Object} options
     * @param  {Number} [options.angle] angle in degrees
     * @return {Number[]} transform matrix
     */
    calcRotateMatrix: function(options) {
      if (!options.angle) {
        return fabric.iMatrix.concat();
      }
      var theta = fabric.util.degreesToRadians(options.angle),
          cos = fabric.util.cos(theta),
          sin = fabric.util.sin(theta);
      return [cos, sin, -sin, cos, 0, 0];
    },

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enlived yet.
     * is called DimensionsTransformMatrix because those properties are the one that influence
     * the size of the resulting box of the object.
     * @static
     * @memberOf fabric.util
     * @param  {Object} options
     * @param  {Number} [options.scaleX]
     * @param  {Number} [options.scaleY]
     * @param  {Boolean} [options.flipX]
     * @param  {Boolean} [options.flipY]
     * @param  {Number} [options.skewX]
     * @param  {Number} [options.skewY]
     * @return {Number[]} transform matrix
     */
    calcDimensionsMatrix: function(options) {
      var scaleX = typeof options.scaleX === 'undefined' ? 1 : options.scaleX,
          scaleY = typeof options.scaleY === 'undefined' ? 1 : options.scaleY,
          scaleMatrix = [
            options.flipX ? -scaleX : scaleX,
            0,
            0,
            options.flipY ? -scaleY : scaleY,
            0,
            0],
          multiply = fabric.util.multiplyTransformMatrices,
          degreesToRadians = fabric.util.degreesToRadians;
      if (options.skewX) {
        scaleMatrix = multiply(
          scaleMatrix,
          [1, 0, Math.tan(degreesToRadians(options.skewX)), 1],
          true);
      }
      if (options.skewY) {
        scaleMatrix = multiply(
          scaleMatrix,
          [1, Math.tan(degreesToRadians(options.skewY)), 0, 1],
          true);
      }
      return scaleMatrix;
    },

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enlived yet
     * @static
     * @memberOf fabric.util
     * @param  {Object} options
     * @param  {Number} [options.angle]
     * @param  {Number} [options.scaleX]
     * @param  {Number} [options.scaleY]
     * @param  {Boolean} [options.flipX]
     * @param  {Boolean} [options.flipY]
     * @param  {Number} [options.skewX]
     * @param  {Number} [options.skewX]
     * @param  {Number} [options.translateX]
     * @param  {Number} [options.translateY]
     * @return {Number[]} transform matrix
     */
    composeMatrix: function(options) {
      var matrix = [1, 0, 0, 1, options.translateX || 0, options.translateY || 0],
          multiply = fabric.util.multiplyTransformMatrices;
      if (options.angle) {
        matrix = multiply(matrix, fabric.util.calcRotateMatrix(options));
      }
      if (options.scaleX !== 1 || options.scaleY !== 1 ||
          options.skewX || options.skewY || options.flipX || options.flipY) {
        matrix = multiply(matrix, fabric.util.calcDimensionsMatrix(options));
      }
      return matrix;
    },

    /**
     * reset an object transform state to neutral. Top and left are not accounted for
     * @static
     * @memberOf fabric.util
     * @param  {fabric.Object} target object to transform
     */
    resetObjectTransform: function (target) {
      target.scaleX = 1;
      target.scaleY = 1;
      target.skewX = 0;
      target.skewY = 0;
      target.flipX = false;
      target.flipY = false;
      target.rotate(0);
    },

    /**
     * Extract Object transform values
     * @static
     * @memberOf fabric.util
     * @param  {fabric.Object} target object to read from
     * @return {Object} Components of transform
     */
    saveObjectTransform: function (target) {
      return {
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        skewX: target.skewX,
        skewY: target.skewY,
        angle: target.angle,
        left: target.left,
        flipX: target.flipX,
        flipY: target.flipY,
        top: target.top
      };
    },

    /**
     * Returns true if context has transparent pixel
     * at specified location (taking tolerance into account)
     * @param {CanvasRenderingContext2D} ctx context
     * @param {Number} x x coordinate
     * @param {Number} y y coordinate
     * @param {Number} tolerance Tolerance
     */
    isTransparent: function(ctx, x, y, tolerance) {

      // If tolerance is > 0 adjust start coords to take into account.
      // If moves off Canvas fix to 0
      if (tolerance > 0) {
        if (x > tolerance) {
          x -= tolerance;
        }
        else {
          x = 0;
        }
        if (y > tolerance) {
          y -= tolerance;
        }
        else {
          y = 0;
        }
      }

      var _isTransparent = true, i, temp,
          imageData = ctx.getImageData(x, y, (tolerance * 2) || 1, (tolerance * 2) || 1),
          l = imageData.data.length;

      // Split image data - for tolerance > 1, pixelDataSize = 4;
      for (i = 3; i < l; i += 4) {
        temp = imageData.data[i];
        _isTransparent = temp <= 0;
        if (_isTransparent === false) {
          break; // Stop if colour found
        }
      }

      imageData = null;

      return _isTransparent;
    },

    /**
     * Parse preserveAspectRatio attribute from element
     * @param {string} attribute to be parsed
     * @return {Object} an object containing align and meetOrSlice attribute
     */
    parsePreserveAspectRatioAttribute: function(attribute) {
      var meetOrSlice = 'meet', alignX = 'Mid', alignY = 'Mid',
          aspectRatioAttrs = attribute.split(' '), align;

      if (aspectRatioAttrs && aspectRatioAttrs.length) {
        meetOrSlice = aspectRatioAttrs.pop();
        if (meetOrSlice !== 'meet' && meetOrSlice !== 'slice') {
          align = meetOrSlice;
          meetOrSlice = 'meet';
        }
        else if (aspectRatioAttrs.length) {
          align = aspectRatioAttrs.pop();
        }
      }
      //divide align in alignX and alignY
      alignX = align !== 'none' ? align.slice(1, 4) : 'none';
      alignY = align !== 'none' ? align.slice(5, 8) : 'none';
      return {
        meetOrSlice: meetOrSlice,
        alignX: alignX,
        alignY: alignY
      };
    },

    /**
     * Clear char widths cache for the given font family or all the cache if no
     * fontFamily is specified.
     * Use it if you know you are loading fonts in a lazy way and you are not waiting
     * for custom fonts to load properly when adding text objects to the canvas.
     * If a text object is added when its own font is not loaded yet, you will get wrong
     * measurement and so wrong bounding boxes.
     * After the font cache is cleared, either change the textObject text content or call
     * initDimensions() to trigger a recalculation
     * @memberOf fabric.util
     * @param {String} [fontFamily] font family to clear
     */
    clearFabricFontCache: function(fontFamily) {
      fontFamily = (fontFamily || '').toLowerCase();
      if (!fontFamily) {
        fabric.charWidthsCache = { };
      }
      else if (fabric.charWidthsCache[fontFamily]) {
        delete fabric.charWidthsCache[fontFamily];
      }
    },

    /**
     * Given current aspect ratio, determines the max width and height that can
     * respect the total allowed area for the cache.
     * @memberOf fabric.util
     * @param {Number} ar aspect ratio
     * @param {Number} maximumArea Maximum area you want to achieve
     * @return {Object.x} Limited dimensions by X
     * @return {Object.y} Limited dimensions by Y
     */
    limitDimsByArea: function(ar, maximumArea) {
      var roughWidth = Math.sqrt(maximumArea * ar),
          perfLimitSizeY = Math.floor(maximumArea / roughWidth);
      return { x: Math.floor(roughWidth), y: perfLimitSizeY };
    },

    capValue: function(min, value, max) {
      return Math.max(min, Math.min(value, max));
    },

    /**
     * Finds the scale for the object source to fit inside the object destination,
     * keeping aspect ratio intact.
     * respect the total allowed area for the cache.
     * @memberOf fabric.util
     * @param {Object | fabric.Object} source
     * @param {Number} source.height natural unscaled height of the object
     * @param {Number} source.width natural unscaled width of the object
     * @param {Object | fabric.Object} destination
     * @param {Number} destination.height natural unscaled height of the object
     * @param {Number} destination.width natural unscaled width of the object
     * @return {Number} scale factor to apply to source to fit into destination
     */
    findScaleToFit: function(source, destination) {
      return Math.min(destination.width / source.width, destination.height / source.height);
    },

    /**
     * Finds the scale for the object source to cover entirely the object destination,
     * keeping aspect ratio intact.
     * respect the total allowed area for the cache.
     * @memberOf fabric.util
     * @param {Object | fabric.Object} source
     * @param {Number} source.height natural unscaled height of the object
     * @param {Number} source.width natural unscaled width of the object
     * @param {Object | fabric.Object} destination
     * @param {Number} destination.height natural unscaled height of the object
     * @param {Number} destination.width natural unscaled width of the object
     * @return {Number} scale factor to apply to source to cover destination
     */
    findScaleToCover: function(source, destination) {
      return Math.max(destination.width / source.width, destination.height / source.height);
    },

    /**
     * given an array of 6 number returns something like `"matrix(...numbers)"`
     * @memberOf fabric.util
     * @param {Array} transform an array with 6 numbers
     * @return {String} transform matrix for svg
     * @return {Object.y} Limited dimensions by Y
     */
    matrixToSVG: function(transform) {
      return 'matrix(' + transform.map(function(value) {
        return fabric.util.toFixed(value, fabric.Object.NUM_FRACTION_DIGITS);
      }).join(' ') + ')';
    },

    /**
     * given an object and a transform, apply the inverse transform to the object,
     * this is equivalent to remove from that object that transformation, so that
     * added in a space with the removed transform, the object will be the same as before.
     * Removing from an object a transform that scale by 2 is like scaling it by 1/2.
     * Removing from an object a transfrom that rotate by 30deg is like rotating by 30deg
     * in the opposite direction.
     * This util is used to add objects inside transformed groups or nested groups.
     * @memberOf fabric.util
     * @param {fabric.Object} object the object you want to transform
     * @param {Array} transform the destination transform
     */
    removeTransformFromObject: function(object, transform) {
      var inverted = fabric.util.invertTransform(transform),
          finalTransform = fabric.util.multiplyTransformMatrices(inverted, object.calcOwnMatrix());
      fabric.util.applyTransformToObject(object, finalTransform);
    },

    /**
     * given an object and a transform, apply the transform to the object.
     * this is equivalent to change the space where the object is drawn.
     * Adding to an object a transform that scale by 2 is like scaling it by 2.
     * This is used when removing an object from an active selection for example.
     * @memberOf fabric.util
     * @param {fabric.Object} object the object you want to transform
     * @param {Array} transform the destination transform
     */
    addTransformToObject: function(object, transform) {
      fabric.util.applyTransformToObject(
        object,
        fabric.util.multiplyTransformMatrices(transform, object.calcOwnMatrix())
      );
    },

    /**
     * discard an object transform state and apply the one from the matrix.
     * @memberOf fabric.util
     * @param {fabric.Object} object the object you want to transform
     * @param {Array} transform the destination transform
     */
    applyTransformToObject: function(object, transform) {
      var options = fabric.util.qrDecompose(transform),
          center = new fabric.Point(options.translateX, options.translateY);
      object.flipX = false;
      object.flipY = false;
      object.set('scaleX', options.scaleX);
      object.set('scaleY', options.scaleY);
      object.skewX = options.skewX;
      object.skewY = options.skewY;
      object.angle = options.angle;
      object.setPositionByOrigin(center, 'center', 'center');
    },

    /**
     * given a width and height, return the size of the bounding box
     * that can contains the box with width/height with applied transform
     * described in options.
     * Use to calculate the boxes around objects for controls.
     * @memberOf fabric.util
     * @param {Number} width
     * @param {Number} height
     * @param {Object} options
     * @param {Number} options.scaleX
     * @param {Number} options.scaleY
     * @param {Number} options.skewX
     * @param {Number} options.skewY
     * @return {Object.x} width of containing
     * @return {Object.y} height of containing
     */
    sizeAfterTransform: function(width, height, options) {
      var dimX = width / 2, dimY = height / 2,
          points = [
            {
              x: -dimX,
              y: -dimY
            },
            {
              x: dimX,
              y: -dimY
            },
            {
              x: -dimX,
              y: dimY
            },
            {
              x: dimX,
              y: dimY
            }],
          transformMatrix = fabric.util.calcDimensionsMatrix(options),
          bbox = fabric.util.makeBoundingBoxFromPoints(points, transformMatrix);
      return {
        x: bbox.width,
        y: bbox.height,
      };
    },

    /**
     * Merges 2 clip paths into one visually equal clip path
     *
     * **IMPORTANT**:\
     * Does **NOT** clone the arguments, clone them proir if necessary.
     *
     * Creates a wrapper (group) that contains one clip path and is clipped by the other so content is kept where both overlap.
     * Use this method if both the clip paths may have nested clip paths of their own, so assigning one to the other's clip path property is not possible.
     *
     * In order to handle the `inverted` property we follow logic described in the following cases:\
     * **(1)** both clip paths are inverted - the clip paths pass the inverted prop to the wrapper and loose it themselves.\
     * **(2)** one is inverted and the other isn't - the wrapper shouldn't become inverted and the inverted clip path must clip the non inverted one to produce an identical visual effect.\
     * **(3)** both clip paths are not inverted - wrapper and clip paths remain unchanged.
     *
     * @memberOf fabric.util
     * @param {fabric.Object} c1
     * @param {fabric.Object} c2
     * @returns {fabric.Object} merged clip path
     */
    mergeClipPaths: function (c1, c2) {
      var a = c1, b = c2;
      if (a.inverted && !b.inverted) {
        //  case (2)
        a = c2;
        b = c1;
      }
      //  `b` becomes `a`'s clip path so we transform `b` to `a` coordinate plane
      fabric.util.applyTransformToObject(
        b,
        fabric.util.multiplyTransformMatrices(
          fabric.util.invertTransform(a.calcTransformMatrix()),
          b.calcTransformMatrix()
        )
      );
      //  assign the `inverted` prop to the wrapping group
      var inverted = a.inverted && b.inverted;
      if (inverted) {
        //  case (1)
        a.inverted = b.inverted = false;
      }
      return new fabric.Group([a], { clipPath: b, inverted: inverted });
    },

    /**
     * @memberOf fabric.util
     * @param {Object} prevStyle first style to compare
     * @param {Object} thisStyle second style to compare
     * @param {boolean} forTextSpans whether to check overline, underline, and line-through properties
     * @return {boolean} true if the style changed
     */
    hasStyleChanged: function(prevStyle, thisStyle, forTextSpans) {
      forTextSpans = forTextSpans || false;
      return (prevStyle.fill !== thisStyle.fill ||
              prevStyle.stroke !== thisStyle.stroke ||
              prevStyle.strokeWidth !== thisStyle.strokeWidth ||
              prevStyle.fontSize !== thisStyle.fontSize ||
              prevStyle.fontFamily !== thisStyle.fontFamily ||
              prevStyle.fontWeight !== thisStyle.fontWeight ||
              prevStyle.fontStyle !== thisStyle.fontStyle ||
              prevStyle.deltaY !== thisStyle.deltaY) ||
              (forTextSpans &&
                (prevStyle.overline !== thisStyle.overline ||
                prevStyle.underline !== thisStyle.underline ||
                prevStyle.linethrough !== thisStyle.linethrough));
    },

    /**
     * Returns the array form of a text object's inline styles property with styles grouped in ranges
     * rather than per character. This format is less verbose, and is better suited for storage
     * so it is used in serialization (not during runtime).
     * @memberOf fabric.util
     * @param {object} styles per character styles for a text object
     * @param {String} text the text string that the styles are applied to
     * @return {{start: number, end: number, style: object}[]}
     */
    stylesToArray: function(styles, text) {
      // clone style structure to prevent mutation
      var styles = fabric.util.object.clone(styles, true),
          textLines = text.split('\n'),
          charIndex = -1, prevStyle = {}, stylesArray = [];
      //loop through each textLine
      for (var i = 0; i < textLines.length; i++) {
        if (!styles[i]) {
          //no styles exist for this line, so add the line's length to the charIndex total
          charIndex += textLines[i].length;
          continue;
        }
        //loop through each character of the current line
        for (var c = 0; c < textLines[i].length; c++) {
          charIndex++;
          var thisStyle = styles[i][c];
          //check if style exists for this character
          if (thisStyle) {
            var styleChanged = fabric.util.hasStyleChanged(prevStyle, thisStyle, true);
            if (styleChanged) {
              stylesArray.push({
                start: charIndex,
                end: charIndex + 1,
                style: thisStyle
              });
            }
            else {
              //if style is the same as previous character, increase end index
              stylesArray[stylesArray.length - 1].end++;
            }
          }
          prevStyle = thisStyle || {};
        }
      }
      return stylesArray;
    },

    /**
     * Returns the object form of the styles property with styles that are assigned per
     * character rather than grouped by range. This format is more verbose, and is
     * only used during runtime (not for serialization/storage)
     * @memberOf fabric.util
     * @param {Array} styles the serialized form of a text object's styles
     * @param {String} text the text string that the styles are applied to
     * @return {Object}
     */
    stylesFromArray: function(styles, text) {
      if (!Array.isArray(styles)) {
        return styles;
      }
      var textLines = text.split('\n'),
          charIndex = -1, styleIndex = 0, stylesObject = {};
      //loop through each textLine
      for (var i = 0; i < textLines.length; i++) {
        //loop through each character of the current line
        for (var c = 0; c < textLines[i].length; c++) {
          charIndex++;
          //check if there's a style collection that includes the current character
          if (styles[styleIndex]
            && styles[styleIndex].start <= charIndex
            && charIndex < styles[styleIndex].end) {
            //create object for line index if it doesn't exist
            stylesObject[i] = stylesObject[i] || {};
            //assign a style at this character's index
            stylesObject[i][c] = Object.assign({}, styles[styleIndex].style);
            //if character is at the end of the current style collection, move to the next
            if (charIndex === styles[styleIndex].end - 1) {
              styleIndex++;
            }
          }
        }
      }
      return stylesObject;
    }
  };
})(typeof exports !== 'undefined' ? exports : this);
(function() {
  var _join = Array.prototype.join,
      commandLengths = {
        m: 2,
        l: 2,
        h: 1,
        v: 1,
        c: 6,
        s: 4,
        q: 4,
        t: 2,
        a: 7
      },
      repeatedCommands = {
        m: 'l',
        M: 'L'
      };
  function segmentToBezier(th2, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY) {
    var costh2 = fabric.util.cos(th2),
        sinth2 = fabric.util.sin(th2),
        costh3 = fabric.util.cos(th3),
        sinth3 = fabric.util.sin(th3),
        toX = cosTh * rx * costh3 - sinTh * ry * sinth3 + cx1,
        toY = sinTh * rx * costh3 + cosTh * ry * sinth3 + cy1,
        cp1X = fromX + mT * ( -cosTh * rx * sinth2 - sinTh * ry * costh2),
        cp1Y = fromY + mT * ( -sinTh * rx * sinth2 + cosTh * ry * costh2),
        cp2X = toX + mT * ( cosTh * rx * sinth3 + sinTh * ry * costh3),
        cp2Y = toY + mT * ( sinTh * rx * sinth3 - cosTh * ry * costh3);

    return ['C',
      cp1X, cp1Y,
      cp2X, cp2Y,
      toX, toY
    ];
  }

  /* Adapted from http://dxr.mozilla.org/mozilla-central/source/content/svg/content/src/nsSVGPathDataParser.cpp
   * by Andrea Bogazzi code is under MPL. if you don't have a copy of the license you can take it here
   * http://mozilla.org/MPL/2.0/
   */
  function arcToSegments(toX, toY, rx, ry, large, sweep, rotateX) {
    var PI = Math.PI, th = rotateX * PI / 180,
        sinTh = fabric.util.sin(th),
        cosTh = fabric.util.cos(th),
        fromX = 0, fromY = 0;

    rx = Math.abs(rx);
    ry = Math.abs(ry);

    var px = -cosTh * toX * 0.5 - sinTh * toY * 0.5,
        py = -cosTh * toY * 0.5 + sinTh * toX * 0.5,
        rx2 = rx * rx, ry2 = ry * ry, py2 = py * py, px2 = px * px,
        pl = rx2 * ry2 - rx2 * py2 - ry2 * px2,
        root = 0;

    if (pl < 0) {
      var s = Math.sqrt(1 - pl / (rx2 * ry2));
      rx *= s;
      ry *= s;
    }
    else {
      root = (large === sweep ? -1.0 : 1.0) *
              Math.sqrt( pl / (rx2 * py2 + ry2 * px2));
    }

    var cx = root * rx * py / ry,
        cy = -root * ry * px / rx,
        cx1 = cosTh * cx - sinTh * cy + toX * 0.5,
        cy1 = sinTh * cx + cosTh * cy + toY * 0.5,
        mTheta = calcVectorAngle(1, 0, (px - cx) / rx, (py - cy) / ry),
        dtheta = calcVectorAngle((px - cx) / rx, (py - cy) / ry, (-px - cx) / rx, (-py - cy) / ry);

    if (sweep === 0 && dtheta > 0) {
      dtheta -= 2 * PI;
    }
    else if (sweep === 1 && dtheta < 0) {
      dtheta += 2 * PI;
    }

    // Convert into cubic bezier segments <= 90deg
    var segments = Math.ceil(Math.abs(dtheta / PI * 2)),
        result = [], mDelta = dtheta / segments,
        mT = 8 / 3 * Math.sin(mDelta / 4) * Math.sin(mDelta / 4) / Math.sin(mDelta / 2),
        th3 = mTheta + mDelta;

    for (var i = 0; i < segments; i++) {
      result[i] = segmentToBezier(mTheta, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY);
      fromX = result[i][5];
      fromY = result[i][6];
      mTheta = th3;
      th3 += mDelta;
    }
    return result;
  }

  /*
   * Private
   */
  function calcVectorAngle(ux, uy, vx, vy) {
    var ta = Math.atan2(uy, ux),
        tb = Math.atan2(vy, vx);
    if (tb >= ta) {
      return tb - ta;
    }
    else {
      return 2 * Math.PI - (ta - tb);
    }
  }

  /**
   * Calculate bounding box of a beziercurve
   * @param {Number} x0 starting point
   * @param {Number} y0
   * @param {Number} x1 first control point
   * @param {Number} y1
   * @param {Number} x2 secondo control point
   * @param {Number} y2
   * @param {Number} x3 end of bezier
   * @param {Number} y3
   */
  // taken from http://jsbin.com/ivomiq/56/edit  no credits available for that.
  // TODO: can we normalize this with the starting points set at 0 and then translated the bbox?
  function getBoundsOfCurve(x0, y0, x1, y1, x2, y2, x3, y3) {
    var argsString;
    if (fabric.cachesBoundsOfCurve) {
      argsString = _join.call(arguments);
      if (fabric.boundsOfCurveCache[argsString]) {
        return fabric.boundsOfCurveCache[argsString];
      }
    }

    var sqrt = Math.sqrt,
        min = Math.min, max = Math.max,
        abs = Math.abs, tvalues = [],
        bounds = [[], []],
        a, b, c, t, t1, t2, b2ac, sqrtb2ac;

    b = 6 * x0 - 12 * x1 + 6 * x2;
    a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
    c = 3 * x1 - 3 * x0;

    for (var i = 0; i < 2; ++i) {
      if (i > 0) {
        b = 6 * y0 - 12 * y1 + 6 * y2;
        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
        c = 3 * y1 - 3 * y0;
      }

      if (abs(a) < 1e-12) {
        if (abs(b) < 1e-12) {
          continue;
        }
        t = -c / b;
        if (0 < t && t < 1) {
          tvalues.push(t);
        }
        continue;
      }
      b2ac = b * b - 4 * c * a;
      if (b2ac < 0) {
        continue;
      }
      sqrtb2ac = sqrt(b2ac);
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
        tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
        tvalues.push(t2);
      }
    }

    var x, y, j = tvalues.length, jlen = j, mt;
    while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      x = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
      bounds[0][j] = x;

      y = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
      bounds[1][j] = y;
    }

    bounds[0][jlen] = x0;
    bounds[1][jlen] = y0;
    bounds[0][jlen + 1] = x3;
    bounds[1][jlen + 1] = y3;
    var result = [
      {
        x: min.apply(null, bounds[0]),
        y: min.apply(null, bounds[1])
      },
      {
        x: max.apply(null, bounds[0]),
        y: max.apply(null, bounds[1])
      }
    ];
    if (fabric.cachesBoundsOfCurve) {
      fabric.boundsOfCurveCache[argsString] = result;
    }
    return result;
  }

  /**
   * Converts arc to a bunch of bezier curves
   * @param {Number} fx starting point x
   * @param {Number} fy starting point y
   * @param {Array} coords Arc command
   */
  function fromArcToBeziers(fx, fy, coords) {
    var rx = coords[1],
        ry = coords[2],
        rot = coords[3],
        large = coords[4],
        sweep = coords[5],
        tx = coords[6],
        ty = coords[7],
        segsNorm = arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot);

    for (var i = 0, len = segsNorm.length; i < len; i++) {
      segsNorm[i][1] += fx;
      segsNorm[i][2] += fy;
      segsNorm[i][3] += fx;
      segsNorm[i][4] += fy;
      segsNorm[i][5] += fx;
      segsNorm[i][6] += fy;
    }
    return segsNorm;
  };

  /**
   * This function take a parsed SVG path and make it simpler for fabricJS logic.
   * simplification consist of: only UPPERCASE absolute commands ( relative converted to absolute )
   * S converted in C, T converted in Q, A converted in C.
   * @param {Array} path the array of commands of a parsed svg path for fabric.Path
   * @return {Array} the simplified array of commands of a parsed svg path for fabric.Path
   */
  function makePathSimpler(path) {
    // x and y represent the last point of the path. the previous command point.
    // we add them to each relative command to make it an absolute comment.
    // we also swap the v V h H with L, because are easier to transform.
    var x = 0, y = 0, len = path.length,
        // x1 and y1 represent the last point of the subpath. the subpath is started with
        // m or M command. When a z or Z command is drawn, x and y need to be resetted to
        // the last x1 and y1.
        x1 = 0, y1 = 0, current, i, converted,
        // previous will host the letter of the previous command, to handle S and T.
        // controlX and controlY will host the previous reflected control point
        destinationPath = [], previous, controlX, controlY;
    for (i = 0; i < len; ++i) {
      converted = false;
      current = path[i].slice(0);
      switch (current[0]) { // first letter
        case 'l': // lineto, relative
          current[0] = 'L';
          current[1] += x;
          current[2] += y;
          // falls through
        case 'L':
          x = current[1];
          y = current[2];
          break;
        case 'h': // horizontal lineto, relative
          current[1] += x;
          // falls through
        case 'H':
          current[0] = 'L';
          current[2] = y;
          x = current[1];
          break;
        case 'v': // vertical lineto, relative
          current[1] += y;
          // falls through
        case 'V':
          current[0] = 'L';
          y = current[1];
          current[1] = x;
          current[2] = y;
          break;
        case 'm': // moveTo, relative
          current[0] = 'M';
          current[1] += x;
          current[2] += y;
          // falls through
        case 'M':
          x = current[1];
          y = current[2];
          x1 = current[1];
          y1 = current[2];
          break;
        case 'c': // bezierCurveTo, relative
          current[0] = 'C';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
          current[5] += x;
          current[6] += y;
          // falls through
        case 'C':
          controlX = current[3];
          controlY = current[4];
          x = current[5];
          y = current[6];
          break;
        case 's': // shorthand cubic bezierCurveTo, relative
          current[0] = 'S';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
          // falls through
        case 'S':
          // would be sScC but since we are swapping sSc for C, we check just that.
          if (previous === 'C') {
            // calculate reflection of previous control points
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }
          else {
            // If there is no previous command or if the previous command was not a C, c, S, or s,
            // the control point is coincident with the current point
            controlX = x;
            controlY = y;
          }
          x = current[3];
          y = current[4];
          current[0] = 'C';
          current[5] = current[3];
          current[6] = current[4];
          current[3] = current[1];
          current[4] = current[2];
          current[1] = controlX;
          current[2] = controlY;
          // current[3] and current[4] are NOW the second control point.
          // we keep it for the next reflection.
          controlX = current[3];
          controlY = current[4];
          break;
        case 'q': // quadraticCurveTo, relative
          current[0] = 'Q';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
          // falls through
        case 'Q':
          controlX = current[1];
          controlY = current[2];
          x = current[3];
          y = current[4];
          break;
        case 't': // shorthand quadraticCurveTo, relative
          current[0] = 'T';
          current[1] += x;
          current[2] += y;
          // falls through
        case 'T':
          if (previous === 'Q') {
            // calculate reflection of previous control point
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }
          else {
            // If there is no previous command or if the previous command was not a Q, q, T or t,
            // assume the control point is coincident with the current point
            controlX = x;
            controlY = y;
          }
          current[0] = 'Q';
          x = current[1];
          y = current[2];
          current[1] = controlX;
          current[2] = controlY;
          current[3] = x;
          current[4] = y;
          break;
        case 'a':
          current[0] = 'A';
          current[6] += x;
          current[7] += y;
          // falls through
        case 'A':
          converted = true;
          destinationPath = destinationPath.concat(fromArcToBeziers(x, y, current));
          x = current[6];
          y = current[7];
          break;
        case 'z':
        case 'Z':
          x = x1;
          y = y1;
          break;
        default:
      }
      if (!converted) {
        destinationPath.push(current);
      }
      previous = current[0];
    }
    return destinationPath;
  };

  /**
   * Calc length from point x1,y1 to x2,y2
   * @param {Number} x1 starting point x
   * @param {Number} y1 starting point y
   * @param {Number} x2 starting point x
   * @param {Number} y2 starting point y
   * @return {Number} length of segment
   */
  function calcLineLength(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  // functions for the Cubic beizer
  // taken from: https://github.com/konvajs/konva/blob/7.0.5/src/shapes/Path.ts#L350
  function CB1(t) {
    return t * t * t;
  }
  function CB2(t) {
    return 3 * t * t * (1 - t);
  }
  function CB3(t) {
    return 3 * t * (1 - t) * (1 - t);
  }
  function CB4(t) {
    return (1 - t) * (1 - t) * (1 - t);
  }

  function getPointOnCubicBezierIterator(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
    return function(pct) {
      var c1 = CB1(pct), c2 = CB2(pct), c3 = CB3(pct), c4 = CB4(pct);
      return {
        x: p4x * c1 + p3x * c2 + p2x * c3 + p1x * c4,
        y: p4y * c1 + p3y * c2 + p2y * c3 + p1y * c4
      };
    };
  }

  function getTangentCubicIterator(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
    return function (pct) {
      var invT = 1 - pct,
          tangentX = (3 * invT * invT * (p2x - p1x)) + (6 * invT * pct * (p3x - p2x)) +
          (3 * pct * pct * (p4x - p3x)),
          tangentY = (3 * invT * invT * (p2y - p1y)) + (6 * invT * pct * (p3y - p2y)) +
          (3 * pct * pct * (p4y - p3y));
      return Math.atan2(tangentY, tangentX);
    };
  }

  function QB1(t) {
    return t * t;
  }

  function QB2(t) {
    return 2 * t * (1 - t);
  }

  function QB3(t) {
    return (1 - t) * (1 - t);
  }

  function getPointOnQuadraticBezierIterator(p1x, p1y, p2x, p2y, p3x, p3y) {
    return function(pct) {
      var c1 = QB1(pct), c2 = QB2(pct), c3 = QB3(pct);
      return {
        x: p3x * c1 + p2x * c2 + p1x * c3,
        y: p3y * c1 + p2y * c2 + p1y * c3
      };
    };
  }

  function getTangentQuadraticIterator(p1x, p1y, p2x, p2y, p3x, p3y) {
    return function (pct) {
      var invT = 1 - pct,
          tangentX = (2 * invT * (p2x - p1x)) + (2 * pct * (p3x - p2x)),
          tangentY = (2 * invT * (p2y - p1y)) + (2 * pct * (p3y - p2y));
      return Math.atan2(tangentY, tangentX);
    };
  }


  // this will run over a path segment ( a cubic or quadratic segment) and approximate it
  // with 100 segemnts. This will good enough to calculate the length of the curve
  function pathIterator(iterator, x1, y1) {
    var tempP = { x: x1, y: y1 }, p, tmpLen = 0, perc;
    for (perc = 1; perc <= 100; perc += 1) {
      p = iterator(perc / 100);
      tmpLen += calcLineLength(tempP.x, tempP.y, p.x, p.y);
      tempP = p;
    }
    return tmpLen;
  }

  /**
   * Given a pathInfo, and a distance in pixels, find the percentage from 0 to 1
   * that correspond to that pixels run over the path.
   * The percentage will be then used to find the correct point on the canvas for the path.
   * @param {Array} segInfo fabricJS collection of information on a parsed path
   * @param {Number} distance from starting point, in pixels.
   * @return {Object} info object with x and y ( the point on canvas ) and angle, the tangent on that point;
   */
  function findPercentageForDistance(segInfo, distance) {
    var perc = 0, tmpLen = 0, iterator = segInfo.iterator, tempP = { x: segInfo.x, y: segInfo.y },
        p, nextLen, nextStep = 0.01, angleFinder = segInfo.angleFinder, lastPerc;
    // nextStep > 0.0001 covers 0.00015625 that 1/64th of 1/100
    // the path
    while (tmpLen < distance && nextStep > 0.0001) {
      p = iterator(perc);
      lastPerc = perc;
      nextLen = calcLineLength(tempP.x, tempP.y, p.x, p.y);
      // compare tmpLen each cycle with distance, decide next perc to test.
      if ((nextLen + tmpLen) > distance) {
        // we discard this step and we make smaller steps.
        perc -= nextStep;
        nextStep /= 2;
      }
      else {
        tempP = p;
        perc += nextStep;
        tmpLen += nextLen;
      }
    }
    p.angle = angleFinder(lastPerc);
    return p;
  }

  /**
   * Run over a parsed and simplifed path and extrac some informations.
   * informations are length of each command and starting point
   * @param {Array} path fabricJS parsed path commands
   * @return {Array} path commands informations
   */
  function getPathSegmentsInfo(path) {
    var totalLength = 0, len = path.length, current,
        //x2 and y2 are the coords of segment start
        //x1 and y1 are the coords of the current point
        x1 = 0, y1 = 0, x2 = 0, y2 = 0, info = [], iterator, tempInfo, angleFinder;
    for (var i = 0; i < len; i++) {
      current = path[i];
      tempInfo = {
        x: x1,
        y: y1,
        command: current[0],
      };
      switch (current[0]) { //first letter
        case 'M':
          tempInfo.length = 0;
          x2 = x1 = current[1];
          y2 = y1 = current[2];
          break;
        case 'L':
          tempInfo.length = calcLineLength(x1, y1, current[1], current[2]);
          x1 = current[1];
          y1 = current[2];
          break;
        case 'C':
          iterator = getPointOnCubicBezierIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6]
          );
          angleFinder = getTangentCubicIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6]
          );
          tempInfo.iterator = iterator;
          tempInfo.angleFinder = angleFinder;
          tempInfo.length = pathIterator(iterator, x1, y1);
          x1 = current[5];
          y1 = current[6];
          break;
        case 'Q':
          iterator = getPointOnQuadraticBezierIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4]
          );
          angleFinder = getTangentQuadraticIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4]
          );
          tempInfo.iterator = iterator;
          tempInfo.angleFinder = angleFinder;
          tempInfo.length = pathIterator(iterator, x1, y1);
          x1 = current[3];
          y1 = current[4];
          break;
        case 'Z':
        case 'z':
          // we add those in order to ease calculations later
          tempInfo.destX = x2;
          tempInfo.destY = y2;
          tempInfo.length = calcLineLength(x1, y1, x2, y2);
          x1 = x2;
          y1 = y2;
          break;
      }
      totalLength += tempInfo.length;
      info.push(tempInfo);
    }
    info.push({ length: totalLength, x: x1, y: y1 });
    return info;
  }

  function getPointOnPath(path, distance, infos) {
    if (!infos) {
      infos = getPathSegmentsInfo(path);
    }
    var i = 0;
    while ((distance - infos[i].length > 0) && i < (infos.length - 2)) {
      distance -= infos[i].length;
      i++;
    }
    // var distance = infos[infos.length - 1] * perc;
    var segInfo = infos[i], segPercent = distance / segInfo.length,
        command = segInfo.command, segment = path[i], info;

    switch (command) {
      case 'M':
        return { x: segInfo.x, y: segInfo.y, angle: 0 };
      case 'Z':
      case 'z':
        info = new fabric.Point(segInfo.x, segInfo.y).lerp(
          new fabric.Point(segInfo.destX, segInfo.destY),
          segPercent
        );
        info.angle = Math.atan2(segInfo.destY - segInfo.y, segInfo.destX - segInfo.x);
        return info;
      case 'L':
        info = new fabric.Point(segInfo.x, segInfo.y).lerp(
          new fabric.Point(segment[1], segment[2]),
          segPercent
        );
        info.angle = Math.atan2(segment[2] - segInfo.y, segment[1] - segInfo.x);
        return info;
      case 'C':
        return findPercentageForDistance(segInfo, distance);
      case 'Q':
        return findPercentageForDistance(segInfo, distance);
    }
  }

  /**
   *
   * @param {string} pathString
   * @return {(string|number)[][]} An array of SVG path commands
   * @example <caption>Usage</caption>
   * parsePath('M 3 4 Q 3 5 2 1 4 0 Q 9 12 2 1 4 0') === [
   *   ['M', 3, 4],
   *   ['Q', 3, 5, 2, 1, 4, 0],
   *   ['Q', 9, 12, 2, 1, 4, 0],
   * ];
   *
   */
  function parsePath(pathString) {
    var result = [],
        coords = [],
        currentPath,
        parsed,
        re = fabric.rePathCommand,
        rNumber = '[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?\\s*',
        rNumberCommaWsp = '(' + rNumber + ')' + fabric.commaWsp,
        rFlagCommaWsp = '([01])' + fabric.commaWsp + '?',
        rArcSeq = rNumberCommaWsp + '?' + rNumberCommaWsp + '?' + rNumberCommaWsp + rFlagCommaWsp + rFlagCommaWsp +
          rNumberCommaWsp + '?(' + rNumber + ')',
        regArcArgumentSequence = new RegExp(rArcSeq, 'g'),
        match,
        coordsStr,
        // one of commands (m,M,l,L,q,Q,c,C,etc.) followed by non-command characters (i.e. command values)
        path;
    if (!pathString || !pathString.match) {
      return result;
    }
    path = pathString.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);

    for (var i = 0, coordsParsed, len = path.length; i < len; i++) {
      currentPath = path[i];

      coordsStr = currentPath.slice(1).trim();
      coords.length = 0;

      var command = currentPath.charAt(0);
      coordsParsed = [command];

      if (command.toLowerCase() === 'a') {
        // arcs have special flags that apparently don't require spaces so handle special
        for (var args; (args = regArcArgumentSequence.exec(coordsStr));) {
          for (var j = 1; j < args.length; j++) {
            coords.push(args[j]);
          }
        }
      }
      else {
        while ((match = re.exec(coordsStr))) {
          coords.push(match[0]);
        }
      }

      for (var j = 0, jlen = coords.length; j < jlen; j++) {
        parsed = parseFloat(coords[j]);
        if (!isNaN(parsed)) {
          coordsParsed.push(parsed);
        }
      }

      var commandLength = commandLengths[command.toLowerCase()],
          repeatedCommand = repeatedCommands[command] || command;

      if (coordsParsed.length - 1 > commandLength) {
        for (var k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
          result.push([command].concat(coordsParsed.slice(k, k + commandLength)));
          command = repeatedCommand;
        }
      }
      else {
        result.push(coordsParsed);
      }
    }

    return result;
  };

  /**
   *
   * Converts points to a smooth SVG path
   * @param {{ x: number,y: number }[]} points Array of points
   * @param {number} [correction] Apply a correction to the path (usually we use `width / 1000`). If value is undefined 0 is used as the correction value.
   * @return {(string|number)[][]} An array of SVG path commands
   */
  function getSmoothPathFromPoints(points, correction) {
    var path = [], i,
        p1 = new fabric.Point(points[0].x, points[0].y),
        p2 = new fabric.Point(points[1].x, points[1].y),
        len = points.length, multSignX = 1, multSignY = 0, manyPoints = len > 2;
    correction = correction || 0;

    if (manyPoints) {
      multSignX = points[2].x < p2.x ? -1 : points[2].x === p2.x ? 0 : 1;
      multSignY = points[2].y < p2.y ? -1 : points[2].y === p2.y ? 0 : 1;
    }
    path.push(['M', p1.x - multSignX * correction, p1.y - multSignY * correction]);
    for (i = 1; i < len; i++) {
      if (!p1.eq(p2)) {
        var midPoint = p1.midPointFrom(p2);
        // p1 is our bezier control point
        // midpoint is our endpoint
        // start point is p(i-1) value.
        path.push(['Q', p1.x, p1.y, midPoint.x, midPoint.y]);
      }
      p1 = points[i];
      if ((i + 1) < points.length) {
        p2 = points[i + 1];
      }
    }
    if (manyPoints) {
      multSignX = p1.x > points[i - 2].x ? 1 : p1.x === points[i - 2].x ? 0 : -1;
      multSignY = p1.y > points[i - 2].y ? 1 : p1.y === points[i - 2].y ? 0 : -1;
    }
    path.push(['L', p1.x + multSignX * correction, p1.y + multSignY * correction]);
    return path;
  }
  /**
   * Transform a path by transforming each segment.
   * it has to be a simplified path or it won't work.
   * WARNING: this depends from pathOffset for correct operation
   * @param {Array} path fabricJS parsed and simplified path commands
   * @param {Array} transform matrix that represent the transformation
   * @param {Object} [pathOffset] the fabric.Path pathOffset
   * @param {Number} pathOffset.x
   * @param {Number} pathOffset.y
   * @returns {Array} the transformed path
   */
  function transformPath(path, transform, pathOffset) {
    if (pathOffset) {
      transform = fabric.util.multiplyTransformMatrices(
        transform,
        [1, 0, 0, 1, -pathOffset.x, -pathOffset.y]
      );
    }
    return path.map(function(pathSegment) {
      var newSegment = pathSegment.slice(0), point = {};
      for (var i = 1; i < pathSegment.length - 1; i += 2) {
        point.x = pathSegment[i];
        point.y = pathSegment[i + 1];
        point = fabric.util.transformPoint(point, transform);
        newSegment[i] = point.x;
        newSegment[i + 1] = point.y;
      }
      return newSegment;
    });
  }

  /**
   * Join path commands to go back to svg format
   * @param {Array} pathData fabricJS parsed path commands
   * @return {String} joined path 'M 0 0 L 20 30'
   */
  fabric.util.joinPath = function(pathData) {
    return pathData.map(function (segment) { return segment.join(' '); }).join(' ');
  };
  fabric.util.parsePath = parsePath;
  fabric.util.makePathSimpler = makePathSimpler;
  fabric.util.getSmoothPathFromPoints = getSmoothPathFromPoints;
  fabric.util.getPathSegmentsInfo = getPathSegmentsInfo;
  fabric.util.getBoundsOfCurve = getBoundsOfCurve;
  fabric.util.getPointOnPath = getPointOnPath;
  fabric.util.transformPath = transformPath;
})();
(function() {

  var slice = Array.prototype.slice;

  /**
   * Invokes method on all items in a given array
   * @memberOf fabric.util.array
   * @param {Array} array Array to iterate over
   * @param {String} method Name of a method to invoke
   * @return {Array}
   */
  function invoke(array, method) {
    var args = slice.call(arguments, 2), result = [];
    for (var i = 0, len = array.length; i < len; i++) {
      result[i] = args.length ? array[i][method].apply(array[i], args) : array[i][method].call(array[i]);
    }
    return result;
  }

  /**
   * Finds maximum value in array (not necessarily "first" one)
   * @memberOf fabric.util.array
   * @param {Array} array Array to iterate over
   * @param {String} byProperty
   * @return {*}
   */
  function max(array, byProperty) {
    return find(array, byProperty, function(value1, value2) {
      return value1 >= value2;
    });
  }

  /**
   * Finds minimum value in array (not necessarily "first" one)
   * @memberOf fabric.util.array
   * @param {Array} array Array to iterate over
   * @param {String} byProperty
   * @return {*}
   */
  function min(array, byProperty) {
    return find(array, byProperty, function(value1, value2) {
      return value1 < value2;
    });
  }

  /**
   * @private
   */
  function fill(array, value) {
    var k = array.length;
    while (k--) {
      array[k] = value;
    }
    return array;
  }

  /**
   * @private
   */
  function find(array, byProperty, condition) {
    if (!array || array.length === 0) {
      return;
    }

    var i = array.length - 1,
        result = byProperty ? array[i][byProperty] : array[i];
    if (byProperty) {
      while (i--) {
        if (condition(array[i][byProperty], result)) {
          result = array[i][byProperty];
        }
      }
    }
    else {
      while (i--) {
        if (condition(array[i], result)) {
          result = array[i];
        }
      }
    }
    return result;
  }

  /**
   * @namespace fabric.util.array
   */
  fabric.util.array = {
    fill: fill,
    invoke: invoke,
    min: min,
    max: max
  };

})();
(function() {
  /**
   * Copies all enumerable properties of one js object to another
   * this does not and cannot compete with generic utils.
   * Does not clone or extend fabric.Object subclasses.
   * This is mostly for internal use and has extra handling for fabricJS objects
   * it skips the canvas and group properties in deep cloning.
   * @memberOf fabric.util.object
   * @param {Object} destination Where to copy to
   * @param {Object} source Where to copy from
   * @param {Boolean} [deep] Whether to extend nested objects
   * @return {Object}
   */

  function extend(destination, source, deep) {
    // JScript DontEnum bug is not taken care of
    // the deep clone is for internal use, is not meant to avoid
    // javascript traps or cloning html element or self referenced objects.
    if (deep) {
      if (!fabric.isLikelyNode && source instanceof Element) {
        // avoid cloning deep images, canvases,
        destination = source;
      }
      else if (source instanceof Array) {
        destination = [];
        for (var i = 0, len = source.length; i < len; i++) {
          destination[i] = extend({ }, source[i], deep);
        }
      }
      else if (source && typeof source === 'object') {
        for (var property in source) {
          if (property === 'canvas' || property === 'group') {
            // we do not want to clone this props at all.
            // we want to keep the keys in the copy
            destination[property] = null;
          }
          else if (source.hasOwnProperty(property)) {
            destination[property] = extend({ }, source[property], deep);
          }
        }
      }
      else {
        // this sounds odd for an extend but is ok for recursive use
        destination = source;
      }
    }
    else {
      for (var property in source) {
        destination[property] = source[property];
      }
    }
    return destination;
  }

  /**
   * Creates an empty object and copies all enumerable properties of another object to it
   * This method is mostly for internal use, and not intended for duplicating shapes in canvas. 
   * @memberOf fabric.util.object
   * @param {Object} object Object to clone
   * @param {Boolean} [deep] Whether to clone nested objects
   * @return {Object}
   */

  //TODO: this function return an empty object if you try to clone null
  function clone(object, deep) {
    return extend({ }, object, deep);
  }

  /** @namespace fabric.util.object */
  fabric.util.object = {
    extend: extend,
    clone: clone
  };
  fabric.util.object.extend(fabric.util, fabric.Observable);
})();
(function() {

  /**
   * Camelizes a string
   * @memberOf fabric.util.string
   * @param {String} string String to camelize
   * @return {String} Camelized version of a string
   */
  function camelize(string) {
    return string.replace(/-+(.)?/g, function(match, character) {
      return character ? character.toUpperCase() : '';
    });
  }

  /**
   * Capitalizes a string
   * @memberOf fabric.util.string
   * @param {String} string String to capitalize
   * @param {Boolean} [firstLetterOnly] If true only first letter is capitalized
   * and other letters stay untouched, if false first letter is capitalized
   * and other letters are converted to lowercase.
   * @return {String} Capitalized version of a string
   */
  function capitalize(string, firstLetterOnly) {
    return string.charAt(0).toUpperCase() +
      (firstLetterOnly ? string.slice(1) : string.slice(1).toLowerCase());
  }

  /**
   * Escapes XML in a string
   * @memberOf fabric.util.string
   * @param {String} string String to escape
   * @return {String} Escaped version of a string
   */
  function escapeXml(string) {
    return string.replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Divide a string in the user perceived single units
   * @memberOf fabric.util.string
   * @param {String} textstring String to escape
   * @return {Array} array containing the graphemes
   */
  function graphemeSplit(textstring) {
    var i = 0, chr, graphemes = [];
    for (i = 0, chr; i < textstring.length; i++) {
      if ((chr = getWholeChar(textstring, i)) === false) {
        continue;
      }
      graphemes.push(chr);
    }
    return graphemes;
  }

  // taken from mdn in the charAt doc page.
  function getWholeChar(str, i) {
    var code = str.charCodeAt(i);

    if (isNaN(code)) {
      return ''; // Position not found
    }
    if (code < 0xD800 || code > 0xDFFF) {
      return str.charAt(i);
    }

    // High surrogate (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xD800 <= code && code <= 0xDBFF) {
      if (str.length <= (i + 1)) {
        throw 'High surrogate without following low surrogate';
      }
      var next = str.charCodeAt(i + 1);
      if (0xDC00 > next || next > 0xDFFF) {
        throw 'High surrogate without following low surrogate';
      }
      return str.charAt(i) + str.charAt(i + 1);
    }
    // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
    if (i === 0) {
      throw 'Low surrogate without preceding high surrogate';
    }
    var prev = str.charCodeAt(i - 1);

    // (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xD800 > prev || prev > 0xDBFF) {
      throw 'Low surrogate without preceding high surrogate';
    }
    // We can pass over low surrogates now as the second component
    // in a pair which we have already processed
    return false;
  }


  /**
   * String utilities
   * @namespace fabric.util.string
   */
  fabric.util.string = {
    camelize: camelize,
    capitalize: capitalize,
    escapeXml: escapeXml,
    graphemeSplit: graphemeSplit
  };
})();
(function() {

  var slice = Array.prototype.slice, emptyFunction = function() { },

      IS_DONTENUM_BUGGY = (function() {
        for (var p in { toString: 1 }) {
          if (p === 'toString') {
            return false;
          }
        }
        return true;
      })(),

      /** @ignore */
      addMethods = function(klass, source, parent) {
        for (var property in source) {

          if (property in klass.prototype &&
              typeof klass.prototype[property] === 'function' &&
              (source[property] + '').indexOf('callSuper') > -1) {

            klass.prototype[property] = (function(property) {
              return function() {

                var superclass = this.constructor.superclass;
                this.constructor.superclass = parent;
                var returnValue = source[property].apply(this, arguments);
                this.constructor.superclass = superclass;

                if (property !== 'initialize') {
                  return returnValue;
                }
              };
            })(property);
          }
          else {
            klass.prototype[property] = source[property];
          }

          if (IS_DONTENUM_BUGGY) {
            if (source.toString !== Object.prototype.toString) {
              klass.prototype.toString = source.toString;
            }
            if (source.valueOf !== Object.prototype.valueOf) {
              klass.prototype.valueOf = source.valueOf;
            }
          }
        }
      };

  function Subclass() { }

  function callSuper(methodName) {
    var parentMethod = null,
        _this = this;

    // climb prototype chain to find method not equal to callee's method
    while (_this.constructor.superclass) {
      var superClassMethod = _this.constructor.superclass.prototype[methodName];
      if (_this[methodName] !== superClassMethod) {
        parentMethod = superClassMethod;
        break;
      }
      // eslint-disable-next-line
      _this = _this.constructor.superclass.prototype;
    }

    if (!parentMethod) {
      return console.log('tried to callSuper ' + methodName + ', method not found in prototype chain', this);
    }

    return (arguments.length > 1)
      ? parentMethod.apply(this, slice.call(arguments, 1))
      : parentMethod.call(this);
  }

  /**
   * Helper for creation of "classes".
   * @memberOf fabric.util
   * @param {Function} [parent] optional "Class" to inherit from
   * @param {Object} [properties] Properties shared by all instances of this class
   *                  (be careful modifying objects defined here as this would affect all instances)
   */
  function createClass() {
    var parent = null,
        properties = slice.call(arguments, 0);

    if (typeof properties[0] === 'function') {
      parent = properties.shift();
    }
    function klass() {
      this.initialize.apply(this, arguments);
    }

    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      Subclass.prototype = parent.prototype;
      klass.prototype = new Subclass();
      parent.subclasses.push(klass);
    }
    for (var i = 0, length = properties.length; i < length; i++) {
      addMethods(klass, properties[i], parent);
    }
    if (!klass.prototype.initialize) {
      klass.prototype.initialize = emptyFunction;
    }
    klass.prototype.constructor = klass;
    klass.prototype.callSuper = callSuper;
    return klass;
  }

  fabric.util.createClass = createClass;
})();
(function () {
  // since ie11 can use addEventListener but they do not support options, i need to check
  var couldUseAttachEvent = !!fabric.document.createElement('div').attachEvent,
      touchEvents = ['touchstart', 'touchmove', 'touchend'];
  /**
   * Adds an event listener to an element
   * @function
   * @memberOf fabric.util
   * @param {HTMLElement} element
   * @param {String} eventName
   * @param {Function} handler
   */
  fabric.util.addListener = function(element, eventName, handler, options) {
    element && element.addEventListener(eventName, handler, couldUseAttachEvent ? false : options);
  };

  /**
   * Removes an event listener from an element
   * @function
   * @memberOf fabric.util
   * @param {HTMLElement} element
   * @param {String} eventName
   * @param {Function} handler
   */
  fabric.util.removeListener = function(element, eventName, handler, options) {
    element && element.removeEventListener(eventName, handler, couldUseAttachEvent ? false : options);
  };

  function getTouchInfo(event) {
    var touchProp = event.changedTouches;
    if (touchProp && touchProp[0]) {
      return touchProp[0];
    }
    return event;
  }

  fabric.util.getPointer = function(event) {
    var element = event.target,
        scroll = fabric.util.getScrollLeftTop(element),
        _evt = getTouchInfo(event);
    return {
      x: _evt.clientX + scroll.left,
      y: _evt.clientY + scroll.top
    };
  };

  fabric.util.isTouchEvent = function(event) {
    return touchEvents.indexOf(event.type) > -1 || event.pointerType === 'touch';
  };
})();
(function () {

  /**
   * Cross-browser wrapper for setting element's style
   * @memberOf fabric.util
   * @param {HTMLElement} element
   * @param {Object} styles
   * @return {HTMLElement} Element that was passed as a first argument
   */
  function setStyle(element, styles) {
    var elementStyle = element.style;
    if (!elementStyle) {
      return element;
    }
    if (typeof styles === 'string') {
      element.style.cssText += ';' + styles;
      return styles.indexOf('opacity') > -1
        ? setOpacity(element, styles.match(/opacity:\s*(\d?\.?\d*)/)[1])
        : element;
    }
    for (var property in styles) {
      if (property === 'opacity') {
        setOpacity(element, styles[property]);
      }
      else {
        var normalizedProperty = (property === 'float' || property === 'cssFloat')
          ? (typeof elementStyle.styleFloat === 'undefined' ? 'cssFloat' : 'styleFloat')
          : property;
        elementStyle.setProperty(normalizedProperty, styles[property]);
      }
    }
    return element;
  }

  var parseEl = fabric.document.createElement('div'),
      supportsOpacity = typeof parseEl.style.opacity === 'string',
      supportsFilters = typeof parseEl.style.filter === 'string',
      reOpacity = /alpha\s*\(\s*opacity\s*=\s*([^\)]+)\)/,

      /** @ignore */
      setOpacity = function (element) { return element; };

  if (supportsOpacity) {
    /** @ignore */
    setOpacity = function(element, value) {
      element.style.opacity = value;
      return element;
    };
  }
  else if (supportsFilters) {
    /** @ignore */
    setOpacity = function(element, value) {
      var es = element.style;
      if (element.currentStyle && !element.currentStyle.hasLayout) {
        es.zoom = 1;
      }
      if (reOpacity.test(es.filter)) {
        value = value >= 0.9999 ? '' : ('alpha(opacity=' + (value * 100) + ')');
        es.filter = es.filter.replace(reOpacity, value);
      }
      else {
        es.filter += ' alpha(opacity=' + (value * 100) + ')';
      }
      return element;
    };
  }

  fabric.util.setStyle = setStyle;

})();
(function() {

  var _slice = Array.prototype.slice;

  /**
   * Takes id and returns an element with that id (if one exists in a document)
   * @memberOf fabric.util
   * @param {String|HTMLElement} id
   * @return {HTMLElement|null}
   */
  function getById(id) {
    return typeof id === 'string' ? fabric.document.getElementById(id) : id;
  }

  var sliceCanConvertNodelists,
      /**
       * Converts an array-like object (e.g. arguments or NodeList) to an array
       * @memberOf fabric.util
       * @param {Object} arrayLike
       * @return {Array}
       */
      toArray = function(arrayLike) {
        return _slice.call(arrayLike, 0);
      };

  try {
    sliceCanConvertNodelists = toArray(fabric.document.childNodes) instanceof Array;
  }
  catch (err) { }

  if (!sliceCanConvertNodelists) {
    toArray = function(arrayLike) {
      var arr = new Array(arrayLike.length), i = arrayLike.length;
      while (i--) {
        arr[i] = arrayLike[i];
      }
      return arr;
    };
  }

  /**
   * Creates specified element with specified attributes
   * @memberOf fabric.util
   * @param {String} tagName Type of an element to create
   * @param {Object} [attributes] Attributes to set on an element
   * @return {HTMLElement} Newly created element
   */
  function makeElement(tagName, attributes) {
    var el = fabric.document.createElement(tagName);
    for (var prop in attributes) {
      if (prop === 'class') {
        el.className = attributes[prop];
      }
      else if (prop === 'for') {
        el.htmlFor = attributes[prop];
      }
      else {
        el.setAttribute(prop, attributes[prop]);
      }
    }
    return el;
  }

  /**
   * Adds class to an element
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to add class to
   * @param {String} className Class to add to an element
   */
  function addClass(element, className) {
    if (element && (' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1) {
      element.className += (element.className ? ' ' : '') + className;
    }
  }

  /**
   * Wraps element with another element
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to wrap
   * @param {HTMLElement|String} wrapper Element to wrap with
   * @param {Object} [attributes] Attributes to set on a wrapper
   * @return {HTMLElement} wrapper
   */
  function wrapElement(element, wrapper, attributes) {
    if (typeof wrapper === 'string') {
      wrapper = makeElement(wrapper, attributes);
    }
    if (element.parentNode) {
      element.parentNode.replaceChild(wrapper, element);
    }
    wrapper.appendChild(element);
    return wrapper;
  }

  /**
   * Returns element scroll offsets
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to operate on
   * @return {Object} Object with left/top values
   */
  function getScrollLeftTop(element) {

    var left = 0,
        top = 0,
        docElement = fabric.document.documentElement,
        body = fabric.document.body || {
          scrollLeft: 0, scrollTop: 0
        };

    // While loop checks (and then sets element to) .parentNode OR .host
    //  to account for ShadowDOM. We still want to traverse up out of ShadowDOM,
    //  but the .parentNode of a root ShadowDOM node will always be null, instead
    //  it should be accessed through .host. See http://stackoverflow.com/a/24765528/4383938
    while (element && (element.parentNode || element.host)) {

      // Set element to element parent, or 'host' in case of ShadowDOM
      element = element.parentNode || element.host;

      if (element === fabric.document) {
        left = body.scrollLeft || docElement.scrollLeft || 0;
        top = body.scrollTop ||  docElement.scrollTop || 0;
      }
      else {
        left += element.scrollLeft || 0;
        top += element.scrollTop || 0;
      }

      if (element.nodeType === 1 && element.style.position === 'fixed') {
        break;
      }
    }

    return { left: left, top: top };
  }

  /**
   * Returns offset for a given element
   * @function
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to get offset for
   * @return {Object} Object with "left" and "top" properties
   */
  function getElementOffset(element) {
    var docElem,
        doc = element && element.ownerDocument,
        box = { left: 0, top: 0 },
        offset = { left: 0, top: 0 },
        scrollLeftTop,
        offsetAttributes = {
          borderLeftWidth: 'left',
          borderTopWidth:  'top',
          paddingLeft:     'left',
          paddingTop:      'top'
        };

    if (!doc) {
      return offset;
    }

    for (var attr in offsetAttributes) {
      offset[offsetAttributes[attr]] += parseInt(getElementStyle(element, attr), 10) || 0;
    }

    docElem = doc.documentElement;
    if ( typeof element.getBoundingClientRect !== 'undefined' ) {
      box = element.getBoundingClientRect();
    }

    scrollLeftTop = getScrollLeftTop(element);

    return {
      left: box.left + scrollLeftTop.left - (docElem.clientLeft || 0) + offset.left,
      top: box.top + scrollLeftTop.top - (docElem.clientTop || 0)  + offset.top
    };
  }

  /**
   * Returns style attribute value of a given element
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to get style attribute for
   * @param {String} attr Style attribute to get for element
   * @return {String} Style attribute value of the given element.
   */
  var getElementStyle;
  if (fabric.document.defaultView && fabric.document.defaultView.getComputedStyle) {
    getElementStyle = function(element, attr) {
      var style = fabric.document.defaultView.getComputedStyle(element, null);
      return style ? style[attr] : undefined;
    };
  }
  else {
    getElementStyle = function(element, attr) {
      var value = element.style[attr];
      if (!value && element.currentStyle) {
        value = element.currentStyle[attr];
      }
      return value;
    };
  }

  (function () {
    var style = fabric.document.documentElement.style,
        selectProp = 'userSelect' in style
          ? 'userSelect'
          : 'MozUserSelect' in style
            ? 'MozUserSelect'
            : 'WebkitUserSelect' in style
              ? 'WebkitUserSelect'
              : 'KhtmlUserSelect' in style
                ? 'KhtmlUserSelect'
                : '';

    /**
     * Makes element unselectable
     * @memberOf fabric.util
     * @param {HTMLElement} element Element to make unselectable
     * @return {HTMLElement} Element that was passed in
     */
    function makeElementUnselectable(element) {
      if (typeof element.onselectstart !== 'undefined') {
        element.onselectstart = fabric.util.falseFunction;
      }
      if (selectProp) {
        element.style[selectProp] = 'none';
      }
      else if (typeof element.unselectable === 'string') {
        element.unselectable = 'on';
      }
      return element;
    }

    /**
     * Makes element selectable
     * @memberOf fabric.util
     * @param {HTMLElement} element Element to make selectable
     * @return {HTMLElement} Element that was passed in
     */
    function makeElementSelectable(element) {
      if (typeof element.onselectstart !== 'undefined') {
        element.onselectstart = null;
      }
      if (selectProp) {
        element.style[selectProp] = '';
      }
      else if (typeof element.unselectable === 'string') {
        element.unselectable = '';
      }
      return element;
    }

    fabric.util.makeElementUnselectable = makeElementUnselectable;
    fabric.util.makeElementSelectable = makeElementSelectable;
  })();

  function getNodeCanvas(element) {
    var impl = fabric.jsdomImplForWrapper(element);
    return impl._canvas || impl._image;
  };

  function cleanUpJsdomNode(element) {
    if (!fabric.isLikelyNode) {
      return;
    }
    var impl = fabric.jsdomImplForWrapper(element);
    if (impl) {
      impl._image = null;
      impl._canvas = null;
      // unsure if necessary
      impl._currentSrc = null;
      impl._attributes = null;
      impl._classList = null;
    }
  }

  function setImageSmoothing(ctx, value) {
    ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled || ctx.webkitImageSmoothingEnabled
      || ctx.mozImageSmoothingEnabled || ctx.msImageSmoothingEnabled || ctx.oImageSmoothingEnabled;
    ctx.imageSmoothingEnabled = value;
  }

  /**
   * setImageSmoothing sets the context imageSmoothingEnabled property.
   * Used by canvas and by ImageObject.
   * @memberOf fabric.util
   * @since 4.0.0
   * @param {HTMLRenderingContext2D} ctx to set on
   * @param {Boolean} value true or false
   */
  fabric.util.setImageSmoothing = setImageSmoothing;
  fabric.util.getById = getById;
  fabric.util.toArray = toArray;
  fabric.util.addClass = addClass;
  fabric.util.makeElement = makeElement;
  fabric.util.wrapElement = wrapElement;
  fabric.util.getScrollLeftTop = getScrollLeftTop;
  fabric.util.getElementOffset = getElementOffset;
  fabric.util.getNodeCanvas = getNodeCanvas;
  fabric.util.cleanUpJsdomNode = cleanUpJsdomNode;

})();
(function() {

  function addParamToUrl(url, param) {
    return url + (/\?/.test(url) ? '&' : '?') + param;
  }

  function emptyFn() { }

  /**
   * Cross-browser abstraction for sending XMLHttpRequest
   * @memberOf fabric.util
   * @param {String} url URL to send XMLHttpRequest to
   * @param {Object} [options] Options object
   * @param {String} [options.method="GET"]
   * @param {String} [options.parameters] parameters to append to url in GET or in body
   * @param {String} [options.body] body to send with POST or PUT request
   * @param {Function} options.onComplete Callback to invoke when request is completed
   * @return {XMLHttpRequest} request
   */
  function request(url, options) {
    options || (options = { });

    var method = options.method ? options.method.toUpperCase() : 'GET',
        onComplete = options.onComplete || function() { },
        xhr = new fabric.window.XMLHttpRequest(),
        body = options.body || options.parameters;

    /** @ignore */
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        onComplete(xhr);
        xhr.onreadystatechange = emptyFn;
      }
    };

    if (method === 'GET') {
      body = null;
      if (typeof options.parameters === 'string') {
        url = addParamToUrl(url, options.parameters);
      }
    }

    xhr.open(method, url, true);

    if (method === 'POST' || method === 'PUT') {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    xhr.send(body);
    return xhr;
  }

  fabric.util.request = request;
})();
/**
 * Wrapper around `console.log` (when available)
 * @param {*} [values] Values to log
 */
fabric.log = console.log;

/**
 * Wrapper around `console.warn` (when available)
 * @param {*} [values] Values to log as a warning
 */
fabric.warn = console.warn;
(function(global) {

  'use strict';

  /* Adaptation of work of Kevin Lindsey (kevin@kevlindev.com) */

  var fabric = global.fabric || (global.fabric = { });

  if (fabric.Point) {
    fabric.warn('fabric.Point is already defined');
    return;
  }

  fabric.Point = Point;

  /**
   * Point class
   * @class fabric.Point
   * @memberOf fabric
   * @constructor
   * @param {Number} x
   * @param {Number} y
   * @return {fabric.Point} thisArg
   */
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  Point.prototype = /** @lends fabric.Point.prototype */ {

    type: 'point',

    constructor: Point,

    /**
     * Adds another point to this one and returns another one
     * @param {fabric.Point} that
     * @return {fabric.Point} new Point instance with added values
     */
    add: function (that) {
      return new Point(this.x + that.x, this.y + that.y);
    },

    /**
     * Adds another point to this one
     * @param {fabric.Point} that
     * @return {fabric.Point} thisArg
     * @chainable
     */
    addEquals: function (that) {
      this.x += that.x;
      this.y += that.y;
      return this;
    },

    /**
     * Adds value to this point and returns a new one
     * @param {Number} scalar
     * @return {fabric.Point} new Point with added value
     */
    scalarAdd: function (scalar) {
      return new Point(this.x + scalar, this.y + scalar);
    },

    /**
     * Adds value to this point
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    scalarAddEquals: function (scalar) {
      this.x += scalar;
      this.y += scalar;
      return this;
    },

    /**
     * Subtracts another point from this point and returns a new one
     * @param {fabric.Point} that
     * @return {fabric.Point} new Point object with subtracted values
     */
    subtract: function (that) {
      return new Point(this.x - that.x, this.y - that.y);
    },

    /**
     * Subtracts another point from this point
     * @param {fabric.Point} that
     * @return {fabric.Point} thisArg
     * @chainable
     */
    subtractEquals: function (that) {
      this.x -= that.x;
      this.y -= that.y;
      return this;
    },

    /**
     * Subtracts value from this point and returns a new one
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    scalarSubtract: function (scalar) {
      return new Point(this.x - scalar, this.y - scalar);
    },

    /**
     * Subtracts value from this point
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    scalarSubtractEquals: function (scalar) {
      this.x -= scalar;
      this.y -= scalar;
      return this;
    },

    /**
     * Multiplies this point by a value and returns a new one
     * TODO: rename in scalarMultiply in 2.0
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    multiply: function (scalar) {
      return new Point(this.x * scalar, this.y * scalar);
    },

    /**
     * Multiplies this point by a value
     * TODO: rename in scalarMultiplyEquals in 2.0
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    multiplyEquals: function (scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    },

    /**
     * Divides this point by a value and returns a new one
     * TODO: rename in scalarDivide in 2.0
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    divide: function (scalar) {
      return new Point(this.x / scalar, this.y / scalar);
    },

    /**
     * Divides this point by a value
     * TODO: rename in scalarDivideEquals in 2.0
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    divideEquals: function (scalar) {
      this.x /= scalar;
      this.y /= scalar;
      return this;
    },

    /**
     * Returns true if this point is equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    eq: function (that) {
      return (this.x === that.x && this.y === that.y);
    },

    /**
     * Returns true if this point is less than another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    lt: function (that) {
      return (this.x < that.x && this.y < that.y);
    },

    /**
     * Returns true if this point is less than or equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    lte: function (that) {
      return (this.x <= that.x && this.y <= that.y);
    },

    /**

     * Returns true if this point is greater another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    gt: function (that) {
      return (this.x > that.x && this.y > that.y);
    },

    /**
     * Returns true if this point is greater than or equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    gte: function (that) {
      return (this.x >= that.x && this.y >= that.y);
    },

    /**
     * Returns new point which is the result of linear interpolation with this one and another one
     * @param {fabric.Point} that
     * @param {Number} t , position of interpolation, between 0 and 1 default 0.5
     * @return {fabric.Point}
     */
    lerp: function (that, t) {
      if (typeof t === 'undefined') {
        t = 0.5;
      }
      t = Math.max(Math.min(1, t), 0);
      return new Point(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t);
    },

    /**
     * Returns distance from this point and another one
     * @param {fabric.Point} that
     * @return {Number}
     */
    distanceFrom: function (that) {
      var dx = this.x - that.x,
          dy = this.y - that.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Returns the point between this point and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    midPointFrom: function (that) {
      return this.lerp(that);
    },

    /**
     * Returns a new point which is the min of this and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    min: function (that) {
      return new Point(Math.min(this.x, that.x), Math.min(this.y, that.y));
    },

    /**
     * Returns a new point which is the max of this and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    max: function (that) {
      return new Point(Math.max(this.x, that.x), Math.max(this.y, that.y));
    },

    /**
     * Returns string representation of this point
     * @return {String}
     */
    toString: function () {
      return this.x + ',' + this.y;
    },

    /**
     * Sets x/y of this point
     * @param {Number} x
     * @param {Number} y
     * @chainable
     */
    setXY: function (x, y) {
      this.x = x;
      this.y = y;
      return this;
    },

    /**
     * Sets x of this point
     * @param {Number} x
     * @chainable
     */
    setX: function (x) {
      this.x = x;
      return this;
    },

    /**
     * Sets y of this point
     * @param {Number} y
     * @chainable
     */
    setY: function (y) {
      this.y = y;
      return this;
    },

    /**
     * Sets x/y of this point from another point
     * @param {fabric.Point} that
     * @chainable
     */
    setFromPoint: function (that) {
      this.x = that.x;
      this.y = that.y;
      return this;
    },

    /**
     * Swaps x/y of this point and another point
     * @param {fabric.Point} that
     */
    swap: function (that) {
      var x = this.x,
          y = this.y;
      this.x = that.x;
      this.y = that.y;
      that.x = x;
      that.y = y;
    },

    /**
     * return a cloned instance of the point
     * @return {fabric.Point}
     */
    clone: function () {
      return new Point(this.x, this.y);
    }
  };

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  /* Adaptation of work of Kevin Lindsey (kevin@kevlindev.com) */
  var fabric = global.fabric || (global.fabric = { });

  if (fabric.Intersection) {
    fabric.warn('fabric.Intersection is already defined');
    return;
  }

  /**
   * Intersection class
   * @class fabric.Intersection
   * @memberOf fabric
   * @constructor
   */
  function Intersection(status) {
    this.status = status;
    this.points = [];
  }

  fabric.Intersection = Intersection;

  fabric.Intersection.prototype = /** @lends fabric.Intersection.prototype */ {

    constructor: Intersection,

    /**
     * Appends a point to intersection
     * @param {fabric.Point} point
     * @return {fabric.Intersection} thisArg
     * @chainable
     */
    appendPoint: function (point) {
      this.points.push(point);
      return this;
    },

    /**
     * Appends points to intersection
     * @param {Array} points
     * @return {fabric.Intersection} thisArg
     * @chainable
     */
    appendPoints: function (points) {
      this.points = this.points.concat(points);
      return this;
    }
  };

  /**
   * Checks if one line intersects another
   * TODO: rename in intersectSegmentSegment
   * @static
   * @param {fabric.Point} a1
   * @param {fabric.Point} a2
   * @param {fabric.Point} b1
   * @param {fabric.Point} b2
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectLineLine = function (a1, a2, b1, b2) {
    var result,
        uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
        ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
        uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
    if (uB !== 0) {
      var ua = uaT / uB,
          ub = ubT / uB;
      if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        result = new Intersection('Intersection');
        result.appendPoint(new fabric.Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
      }
      else {
        result = new Intersection();
      }
    }
    else {
      if (uaT === 0 || ubT === 0) {
        result = new Intersection('Coincident');
      }
      else {
        result = new Intersection('Parallel');
      }
    }
    return result;
  };

  /**
   * Checks if line intersects polygon
   * TODO: rename in intersectSegmentPolygon
   * fix detection of coincident
   * @static
   * @param {fabric.Point} a1
   * @param {fabric.Point} a2
   * @param {Array} points
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectLinePolygon = function(a1, a2, points) {
    var result = new Intersection(),
        length = points.length,
        b1, b2, inter, i;

    for (i = 0; i < length; i++) {
      b1 = points[i];
      b2 = points[(i + 1) % length];
      inter = Intersection.intersectLineLine(a1, a2, b1, b2);

      result.appendPoints(inter.points);
    }
    if (result.points.length > 0) {
      result.status = 'Intersection';
    }
    return result;
  };

  /**
   * Checks if polygon intersects another polygon
   * @static
   * @param {Array} points1
   * @param {Array} points2
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectPolygonPolygon = function (points1, points2) {
    var result = new Intersection(),
        length = points1.length, i;

    for (i = 0; i < length; i++) {
      var a1 = points1[i],
          a2 = points1[(i + 1) % length],
          inter = Intersection.intersectLinePolygon(a1, a2, points2);

      result.appendPoints(inter.points);
    }
    if (result.points.length > 0) {
      result.status = 'Intersection';
    }
    return result;
  };

  /**
   * Checks if polygon intersects rectangle
   * @static
   * @param {Array} points
   * @param {fabric.Point} r1
   * @param {fabric.Point} r2
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectPolygonRectangle = function (points, r1, r2) {
    var min = r1.min(r2),
        max = r1.max(r2),
        topRight = new fabric.Point(max.x, min.y),
        bottomLeft = new fabric.Point(min.x, max.y),
        inter1 = Intersection.intersectLinePolygon(min, topRight, points),
        inter2 = Intersection.intersectLinePolygon(topRight, max, points),
        inter3 = Intersection.intersectLinePolygon(max, bottomLeft, points),
        inter4 = Intersection.intersectLinePolygon(bottomLeft, min, points),
        result = new Intersection();

    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);

    if (result.points.length > 0) {
      result.status = 'Intersection';
    }
    return result;
  };

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { });

  if (fabric.Color) {
    fabric.warn('fabric.Color is already defined.');
    return;
  }

  /**
   * Color class
   * The purpose of {@link fabric.Color} is to abstract and encapsulate common color operations;
   * {@link fabric.Color} is a constructor and creates instances of {@link fabric.Color} objects.
   *
   * @class fabric.Color
   * @param {String} color optional in hex or rgb(a) or hsl format or from known color list
   * @return {fabric.Color} thisArg
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-2/#colors}
   */
  function Color(color) {
    if (!color) {
      this.setSource([0, 0, 0, 1]);
    }
    else {
      this._tryParsingColor(color);
    }
  }

  fabric.Color = Color;

  fabric.Color.prototype = /** @lends fabric.Color.prototype */ {

    /**
     * @private
     * @param {String|Array} color Color value to parse
     */
    _tryParsingColor: function(color) {
      var source;

      if (color in Color.colorNameMap) {
        color = Color.colorNameMap[color];
      }

      if (color === 'transparent') {
        source = [255, 255, 255, 0];
      }

      if (!source) {
        source = Color.sourceFromHex(color);
      }
      if (!source) {
        source = Color.sourceFromRgb(color);
      }
      if (!source) {
        source = Color.sourceFromHsl(color);
      }
      if (!source) {
        //if color is not recognize let's make black as canvas does
        source = [0, 0, 0, 1];
      }
      if (source) {
        this.setSource(source);
      }
    },

    /**
     * Adapted from <a href="https://rawgithub.com/mjijackson/mjijackson.github.com/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.html">https://github.com/mjijackson</a>
     * @private
     * @param {Number} r Red color value
     * @param {Number} g Green color value
     * @param {Number} b Blue color value
     * @return {Array} Hsl color
     */
    _rgbToHsl: function(r, g, b) {
      r /= 255; g /= 255; b /= 255;

      var h, s, l,
          max = fabric.util.array.max([r, g, b]),
          min = fabric.util.array.min([r, g, b]);

      l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      }
      else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return [
        Math.round(h * 360),
        Math.round(s * 100),
        Math.round(l * 100)
      ];
    },

    /**
     * Returns source of this color (where source is an array representation; ex: [200, 200, 100, 1])
     * @return {Array}
     */
    getSource: function() {
      return this._source;
    },

    /**
     * Sets source of this color (where source is an array representation; ex: [200, 200, 100, 1])
     * @param {Array} source
     */
    setSource: function(source) {
      this._source = source;
    },

    /**
     * Returns color representation in RGB format
     * @return {String} ex: rgb(0-255,0-255,0-255)
     */
    toRgb: function() {
      var source = this.getSource();
      return 'rgb(' + source[0] + ',' + source[1] + ',' + source[2] + ')';
    },

    /**
     * Returns color representation in RGBA format
     * @return {String} ex: rgba(0-255,0-255,0-255,0-1)
     */
    toRgba: function() {
      var source = this.getSource();
      return 'rgba(' + source[0] + ',' + source[1] + ',' + source[2] + ',' + source[3] + ')';
    },

    /**
     * Returns color representation in HSL format
     * @return {String} ex: hsl(0-360,0%-100%,0%-100%)
     */
    toHsl: function() {
      var source = this.getSource(),
          hsl = this._rgbToHsl(source[0], source[1], source[2]);

      return 'hsl(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%)';
    },

    /**
     * Returns color representation in HSLA format
     * @return {String} ex: hsla(0-360,0%-100%,0%-100%,0-1)
     */
    toHsla: function() {
      var source = this.getSource(),
          hsl = this._rgbToHsl(source[0], source[1], source[2]);

      return 'hsla(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%,' + source[3] + ')';
    },

    /**
     * Returns color representation in HEX format
     * @return {String} ex: FF5555
     */
    toHex: function() {
      var source = this.getSource(), r, g, b;

      r = source[0].toString(16);
      r = (r.length === 1) ? ('0' + r) : r;

      g = source[1].toString(16);
      g = (g.length === 1) ? ('0' + g) : g;

      b = source[2].toString(16);
      b = (b.length === 1) ? ('0' + b) : b;

      return r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
    },

    /**
     * Returns color representation in HEXA format
     * @return {String} ex: FF5555CC
     */
    toHexa: function() {
      var source = this.getSource(), a;

      a = Math.round(source[3] * 255);
      a = a.toString(16);
      a = (a.length === 1) ? ('0' + a) : a;

      return this.toHex() + a.toUpperCase();
    },

    /**
     * Gets value of alpha channel for this color
     * @return {Number} 0-1
     */
    getAlpha: function() {
      return this.getSource()[3];
    },

    /**
     * Sets value of alpha channel for this color
     * @param {Number} alpha Alpha value 0-1
     * @return {fabric.Color} thisArg
     */
    setAlpha: function(alpha) {
      var source = this.getSource();
      source[3] = alpha;
      this.setSource(source);
      return this;
    },

    /**
     * Transforms color to its grayscale representation
     * @return {fabric.Color} thisArg
     */
    toGrayscale: function() {
      var source = this.getSource(),
          average = parseInt((source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0), 10),
          currentAlpha = source[3];
      this.setSource([average, average, average, currentAlpha]);
      return this;
    },

    /**
     * Transforms color to its black and white representation
     * @param {Number} threshold
     * @return {fabric.Color} thisArg
     */
    toBlackWhite: function(threshold) {
      var source = this.getSource(),
          average = (source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0),
          currentAlpha = source[3];

      threshold = threshold || 127;

      average = (Number(average) < Number(threshold)) ? 0 : 255;
      this.setSource([average, average, average, currentAlpha]);
      return this;
    },

    /**
     * Overlays color with another color
     * @param {String|fabric.Color} otherColor
     * @return {fabric.Color} thisArg
     */
    overlayWith: function(otherColor) {
      if (!(otherColor instanceof Color)) {
        otherColor = new Color(otherColor);
      }

      var result = [],
          alpha = this.getAlpha(),
          otherAlpha = 0.5,
          source = this.getSource(),
          otherSource = otherColor.getSource(), i;

      for (i = 0; i < 3; i++) {
        result.push(Math.round((source[i] * (1 - otherAlpha)) + (otherSource[i] * otherAlpha)));
      }

      result[3] = alpha;
      this.setSource(result);
      return this;
    }
  };

  /**
   * Regex matching color in RGB or RGBA formats (ex: rgb(0, 0, 0), rgba(255, 100, 10, 0.5), rgba( 255 , 100 , 10 , 0.5 ), rgb(1,1,1), rgba(100%, 60%, 10%, 0.5))
   * @static
   * @field
   * @memberOf fabric.Color
   */
  // eslint-disable-next-line max-len
  fabric.Color.reRGBa = /^rgba?\(\s*(\d{1,3}(?:\.\d+)?\%?)\s*,\s*(\d{1,3}(?:\.\d+)?\%?)\s*,\s*(\d{1,3}(?:\.\d+)?\%?)\s*(?:\s*,\s*((?:\d*\.?\d+)?)\s*)?\)$/i;

  /**
   * Regex matching color in HSL or HSLA formats (ex: hsl(200, 80%, 10%), hsla(300, 50%, 80%, 0.5), hsla( 300 , 50% , 80% , 0.5 ))
   * @static
   * @field
   * @memberOf fabric.Color
   */
  fabric.Color.reHSLa = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}\%)\s*,\s*(\d{1,3}\%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/i;

  /**
   * Regex matching color in HEX format (ex: #FF5544CC, #FF5555, 010155, aff)
   * @static
   * @field
   * @memberOf fabric.Color
   */
  fabric.Color.reHex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;

  /**
   * Map of the 148 color names with HEX code
   * @static
   * @field
   * @memberOf fabric.Color
   * @see: https://www.w3.org/TR/css3-color/#svg-color
   */
  fabric.Color.colorNameMap = {
    aliceblue:            '#F0F8FF',
    antiquewhite:         '#FAEBD7',
    aqua:                 '#00FFFF',
    aquamarine:           '#7FFFD4',
    azure:                '#F0FFFF',
    beige:                '#F5F5DC',
    bisque:               '#FFE4C4',
    black:                '#000000',
    blanchedalmond:       '#FFEBCD',
    blue:                 '#0000FF',
    blueviolet:           '#8A2BE2',
    brown:                '#A52A2A',
    burlywood:            '#DEB887',
    cadetblue:            '#5F9EA0',
    chartreuse:           '#7FFF00',
    chocolate:            '#D2691E',
    coral:                '#FF7F50',
    cornflowerblue:       '#6495ED',
    cornsilk:             '#FFF8DC',
    crimson:              '#DC143C',
    cyan:                 '#00FFFF',
    darkblue:             '#00008B',
    darkcyan:             '#008B8B',
    darkgoldenrod:        '#B8860B',
    darkgray:             '#A9A9A9',
    darkgrey:             '#A9A9A9',
    darkgreen:            '#006400',
    darkkhaki:            '#BDB76B',
    darkmagenta:          '#8B008B',
    darkolivegreen:       '#556B2F',
    darkorange:           '#FF8C00',
    darkorchid:           '#9932CC',
    darkred:              '#8B0000',
    darksalmon:           '#E9967A',
    darkseagreen:         '#8FBC8F',
    darkslateblue:        '#483D8B',
    darkslategray:        '#2F4F4F',
    darkslategrey:        '#2F4F4F',
    darkturquoise:        '#00CED1',
    darkviolet:           '#9400D3',
    deeppink:             '#FF1493',
    deepskyblue:          '#00BFFF',
    dimgray:              '#696969',
    dimgrey:              '#696969',
    dodgerblue:           '#1E90FF',
    firebrick:            '#B22222',
    floralwhite:          '#FFFAF0',
    forestgreen:          '#228B22',
    fuchsia:              '#FF00FF',
    gainsboro:            '#DCDCDC',
    ghostwhite:           '#F8F8FF',
    gold:                 '#FFD700',
    goldenrod:            '#DAA520',
    gray:                 '#808080',
    grey:                 '#808080',
    green:                '#008000',
    greenyellow:          '#ADFF2F',
    honeydew:             '#F0FFF0',
    hotpink:              '#FF69B4',
    indianred:            '#CD5C5C',
    indigo:               '#4B0082',
    ivory:                '#FFFFF0',
    khaki:                '#F0E68C',
    lavender:             '#E6E6FA',
    lavenderblush:        '#FFF0F5',
    lawngreen:            '#7CFC00',
    lemonchiffon:         '#FFFACD',
    lightblue:            '#ADD8E6',
    lightcoral:           '#F08080',
    lightcyan:            '#E0FFFF',
    lightgoldenrodyellow: '#FAFAD2',
    lightgray:            '#D3D3D3',
    lightgrey:            '#D3D3D3',
    lightgreen:           '#90EE90',
    lightpink:            '#FFB6C1',
    lightsalmon:          '#FFA07A',
    lightseagreen:        '#20B2AA',
    lightskyblue:         '#87CEFA',
    lightslategray:       '#778899',
    lightslategrey:       '#778899',
    lightsteelblue:       '#B0C4DE',
    lightyellow:          '#FFFFE0',
    lime:                 '#00FF00',
    limegreen:            '#32CD32',
    linen:                '#FAF0E6',
    magenta:              '#FF00FF',
    maroon:               '#800000',
    mediumaquamarine:     '#66CDAA',
    mediumblue:           '#0000CD',
    mediumorchid:         '#BA55D3',
    mediumpurple:         '#9370DB',
    mediumseagreen:       '#3CB371',
    mediumslateblue:      '#7B68EE',
    mediumspringgreen:    '#00FA9A',
    mediumturquoise:      '#48D1CC',
    mediumvioletred:      '#C71585',
    midnightblue:         '#191970',
    mintcream:            '#F5FFFA',
    mistyrose:            '#FFE4E1',
    moccasin:             '#FFE4B5',
    navajowhite:          '#FFDEAD',
    navy:                 '#000080',
    oldlace:              '#FDF5E6',
    olive:                '#808000',
    olivedrab:            '#6B8E23',
    orange:               '#FFA500',
    orangered:            '#FF4500',
    orchid:               '#DA70D6',
    palegoldenrod:        '#EEE8AA',
    palegreen:            '#98FB98',
    paleturquoise:        '#AFEEEE',
    palevioletred:        '#DB7093',
    papayawhip:           '#FFEFD5',
    peachpuff:            '#FFDAB9',
    peru:                 '#CD853F',
    pink:                 '#FFC0CB',
    plum:                 '#DDA0DD',
    powderblue:           '#B0E0E6',
    purple:               '#800080',
    rebeccapurple:        '#663399',
    red:                  '#FF0000',
    rosybrown:            '#BC8F8F',
    royalblue:            '#4169E1',
    saddlebrown:          '#8B4513',
    salmon:               '#FA8072',
    sandybrown:           '#F4A460',
    seagreen:             '#2E8B57',
    seashell:             '#FFF5EE',
    sienna:               '#A0522D',
    silver:               '#C0C0C0',
    skyblue:              '#87CEEB',
    slateblue:            '#6A5ACD',
    slategray:            '#708090',
    slategrey:            '#708090',
    snow:                 '#FFFAFA',
    springgreen:          '#00FF7F',
    steelblue:            '#4682B4',
    tan:                  '#D2B48C',
    teal:                 '#008080',
    thistle:              '#D8BFD8',
    tomato:               '#FF6347',
    turquoise:            '#40E0D0',
    violet:               '#EE82EE',
    wheat:                '#F5DEB3',
    white:                '#FFFFFF',
    whitesmoke:           '#F5F5F5',
    yellow:               '#FFFF00',
    yellowgreen:          '#9ACD32'
  };

  /**
   * @private
   * @param {Number} p
   * @param {Number} q
   * @param {Number} t
   * @return {Number}
   */
  function hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }

  /**
   * Returns new color object, when given a color in RGB format
   * @memberOf fabric.Color
   * @param {String} color Color value ex: rgb(0-255,0-255,0-255)
   * @return {fabric.Color}
   */
  fabric.Color.fromRgb = function(color) {
    return Color.fromSource(Color.sourceFromRgb(color));
  };

  /**
   * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in RGB or RGBA format
   * @memberOf fabric.Color
   * @param {String} color Color value ex: rgb(0-255,0-255,0-255), rgb(0%-100%,0%-100%,0%-100%)
   * @return {Array} source
   */
  fabric.Color.sourceFromRgb = function(color) {
    var match = color.match(Color.reRGBa);
    if (match) {
      var r = parseInt(match[1], 10) / (/%$/.test(match[1]) ? 100 : 1) * (/%$/.test(match[1]) ? 255 : 1),
          g = parseInt(match[2], 10) / (/%$/.test(match[2]) ? 100 : 1) * (/%$/.test(match[2]) ? 255 : 1),
          b = parseInt(match[3], 10) / (/%$/.test(match[3]) ? 100 : 1) * (/%$/.test(match[3]) ? 255 : 1);

      return [
        parseInt(r, 10),
        parseInt(g, 10),
        parseInt(b, 10),
        match[4] ? parseFloat(match[4]) : 1
      ];
    }
  };

  /**
   * Returns new color object, when given a color in RGBA format
   * @static
   * @function
   * @memberOf fabric.Color
   * @param {String} color
   * @return {fabric.Color}
   */
  fabric.Color.fromRgba = Color.fromRgb;

  /**
   * Returns new color object, when given a color in HSL format
   * @param {String} color Color value ex: hsl(0-260,0%-100%,0%-100%)
   * @memberOf fabric.Color
   * @return {fabric.Color}
   */
  fabric.Color.fromHsl = function(color) {
    return Color.fromSource(Color.sourceFromHsl(color));
  };

  /**
   * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in HSL or HSLA format.
   * Adapted from <a href="https://rawgithub.com/mjijackson/mjijackson.github.com/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.html">https://github.com/mjijackson</a>
   * @memberOf fabric.Color
   * @param {String} color Color value ex: hsl(0-360,0%-100%,0%-100%) or hsla(0-360,0%-100%,0%-100%, 0-1)
   * @return {Array} source
   * @see http://http://www.w3.org/TR/css3-color/#hsl-color
   */
  fabric.Color.sourceFromHsl = function(color) {
    var match = color.match(Color.reHSLa);
    if (!match) {
      return;
    }

    var h = (((parseFloat(match[1]) % 360) + 360) % 360) / 360,
        s = parseFloat(match[2]) / (/%$/.test(match[2]) ? 100 : 1),
        l = parseFloat(match[3]) / (/%$/.test(match[3]) ? 100 : 1),
        r, g, b;

    if (s === 0) {
      r = g = b = l;
    }
    else {
      var q = l <= 0.5 ? l * (s + 1) : l + s - l * s,
          p = l * 2 - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      match[4] ? parseFloat(match[4]) : 1
    ];
  };

  /**
   * Returns new color object, when given a color in HSLA format
   * @static
   * @function
   * @memberOf fabric.Color
   * @param {String} color
   * @return {fabric.Color}
   */
  fabric.Color.fromHsla = Color.fromHsl;

  /**
   * Returns new color object, when given a color in HEX format
   * @static
   * @memberOf fabric.Color
   * @param {String} color Color value ex: FF5555
   * @return {fabric.Color}
   */
  fabric.Color.fromHex = function(color) {
    return Color.fromSource(Color.sourceFromHex(color));
  };

  /**
   * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in HEX format
   * @static
   * @memberOf fabric.Color
   * @param {String} color ex: FF5555 or FF5544CC (RGBa)
   * @return {Array} source
   */
  fabric.Color.sourceFromHex = function(color) {
    if (color.match(Color.reHex)) {
      var value = color.slice(color.indexOf('#') + 1),
          isShortNotation = (value.length === 3 || value.length === 4),
          isRGBa = (value.length === 8 || value.length === 4),
          r = isShortNotation ? (value.charAt(0) + value.charAt(0)) : value.substring(0, 2),
          g = isShortNotation ? (value.charAt(1) + value.charAt(1)) : value.substring(2, 4),
          b = isShortNotation ? (value.charAt(2) + value.charAt(2)) : value.substring(4, 6),
          a = isRGBa ? (isShortNotation ? (value.charAt(3) + value.charAt(3)) : value.substring(6, 8)) : 'FF';

      return [
        parseInt(r, 16),
        parseInt(g, 16),
        parseInt(b, 16),
        parseFloat((parseInt(a, 16) / 255).toFixed(2))
      ];
    }
  };

  /**
   * Returns new color object, when given color in array representation (ex: [200, 100, 100, 0.5])
   * @static
   * @memberOf fabric.Color
   * @param {Array} source
   * @return {fabric.Color}
   */
  fabric.Color.fromSource = function(source) {
    var oColor = new Color();
    oColor.setSource(source);
    return oColor;
  };

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      scaleMap = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne', 'e'],
      skewMap = ['ns', 'nesw', 'ew', 'nwse'],
      controls = {},
      LEFT = 'left', TOP = 'top', RIGHT = 'right', BOTTOM = 'bottom', CENTER = 'center',
      opposite = {
        top: BOTTOM,
        bottom: TOP,
        left: RIGHT,
        right: LEFT,
        center: CENTER,
      }, radiansToDegrees = fabric.util.radiansToDegrees,
      sign = (Math.sign || function(x) { return ((x > 0) - (x < 0)) || +x; });

  /**
   * Combine control position and object angle to find the control direction compared
   * to the object center.
   * @param {fabric.Object} fabricObject the fabric object for which we are rendering controls
   * @param {fabric.Control} control the control class
   * @return {Number} 0 - 7 a quadrant number
   */
  function findCornerQuadrant(fabricObject, control) {
    var cornerAngle = fabricObject.angle + radiansToDegrees(Math.atan2(control.y, control.x)) + 360;
    return Math.round((cornerAngle % 360) / 45);
  }

  function fireEvent(eventName, options) {
    var target = options.transform.target,
        canvas = target.canvas,
        canvasOptions = fabric.util.object.clone(options);
    canvasOptions.target = target;
    canvas && canvas.fire('object:' + eventName, canvasOptions);
    target.fire(eventName, options);
  }

  /**
   * Inspect event and fabricObject properties to understand if the scaling action
   * @param {Event} eventData from the user action
   * @param {fabric.Object} fabricObject the fabric object about to scale
   * @return {Boolean} true if scale is proportional
   */
  function scaleIsProportional(eventData, fabricObject) {
    var canvas = fabricObject.canvas, uniScaleKey = canvas.uniScaleKey,
        uniformIsToggled = eventData[uniScaleKey];
    return (canvas.uniformScaling && !uniformIsToggled) ||
    (!canvas.uniformScaling && uniformIsToggled);
  }

  /**
   * Checks if transform is centered
   * @param {Object} transform transform data
   * @return {Boolean} true if transform is centered
   */
  function isTransformCentered(transform) {
    return transform.originX === CENTER && transform.originY === CENTER;
  }

  /**
   * Inspect fabricObject to understand if the current scaling action is allowed
   * @param {fabric.Object} fabricObject the fabric object about to scale
   * @param {String} by 'x' or 'y' or ''
   * @param {Boolean} scaleProportionally true if we are trying to scale proportionally
   * @return {Boolean} true if scaling is not allowed at current conditions
   */
  function scalingIsForbidden(fabricObject, by, scaleProportionally) {
    var lockX = fabricObject.lockScalingX, lockY = fabricObject.lockScalingY;
    if (lockX && lockY) {
      return true;
    }
    if (!by && (lockX || lockY) && scaleProportionally) {
      return true;
    }
    if (lockX && by === 'x') {
      return true;
    }
    if (lockY && by === 'y') {
      return true;
    }
    return false;
  }

  /**
   * return the correct cursor style for the scale action
   * @param {Event} eventData the javascript event that is causing the scale
   * @param {fabric.Control} control the control that is interested in the action
   * @param {fabric.Object} fabricObject the fabric object that is interested in the action
   * @return {String} a valid css string for the cursor
   */
  function scaleCursorStyleHandler(eventData, control, fabricObject) {
    var notAllowed = 'not-allowed',
        scaleProportionally = scaleIsProportional(eventData, fabricObject),
        by = '';
    if (control.x !== 0 && control.y === 0) {
      by = 'x';
    }
    else if (control.x === 0 && control.y !== 0) {
      by = 'y';
    }
    if (scalingIsForbidden(fabricObject, by, scaleProportionally)) {
      return notAllowed;
    }
    var n = findCornerQuadrant(fabricObject, control);
    return scaleMap[n] + '-resize';
  }

  /**
   * return the correct cursor style for the skew action
   * @param {Event} eventData the javascript event that is causing the scale
   * @param {fabric.Control} control the control that is interested in the action
   * @param {fabric.Object} fabricObject the fabric object that is interested in the action
   * @return {String} a valid css string for the cursor
   */
  function skewCursorStyleHandler(eventData, control, fabricObject) {
    var notAllowed = 'not-allowed';
    if (control.x !== 0 && fabricObject.lockSkewingY) {
      return notAllowed;
    }
    if (control.y !== 0 && fabricObject.lockSkewingX) {
      return notAllowed;
    }
    var n = findCornerQuadrant(fabricObject, control) % 4;
    return skewMap[n] + '-resize';
  }

  /**
   * Combine skew and scale style handlers to cover fabric standard use case
   * @param {Event} eventData the javascript event that is causing the scale
   * @param {fabric.Control} control the control that is interested in the action
   * @param {fabric.Object} fabricObject the fabric object that is interested in the action
   * @return {String} a valid css string for the cursor
   */
  function scaleSkewCursorStyleHandler(eventData, control, fabricObject) {
    if (eventData[fabricObject.canvas.altActionKey]) {
      return controls.skewCursorStyleHandler(eventData, control, fabricObject);
    }
    return controls.scaleCursorStyleHandler(eventData, control, fabricObject);
  }

  /**
   * Inspect event, control and fabricObject to return the correct action name
   * @param {Event} eventData the javascript event that is causing the scale
   * @param {fabric.Control} control the control that is interested in the action
   * @param {fabric.Object} fabricObject the fabric object that is interested in the action
   * @return {String} an action name
   */
  function scaleOrSkewActionName(eventData, control, fabricObject) {
    var isAlternative = eventData[fabricObject.canvas.altActionKey];
    if (control.x === 0) {
      // then is scaleY or skewX
      return isAlternative ? 'skewX' : 'scaleY';
    }
    if (control.y === 0) {
      // then is scaleY or skewX
      return isAlternative ? 'skewY' : 'scaleX';
    }
  }

  /**
   * Find the correct style for the control that is used for rotation.
   * this function is very simple and it just take care of not-allowed or standard cursor
   * @param {Event} eventData the javascript event that is causing the scale
   * @param {fabric.Control} control the control that is interested in the action
   * @param {fabric.Object} fabricObject the fabric object that is interested in the action
   * @return {String} a valid css string for the cursor
   */
  function rotationStyleHandler(eventData, control, fabricObject) {
    if (fabricObject.lockRotation) {
      return 'not-allowed';
    }
    return control.cursorStyle;
  }

  function commonEventInfo(eventData, transform, x, y) {
    return {
      e: eventData,
      transform: transform,
      pointer: {
        x: x,
        y: y,
      }
    };
  }

  /**
   * Wrap an action handler with saving/restoring object position on the transform.
   * this is the code that permits to objects to keep their position while transforming.
   * @param {Function} actionHandler the function to wrap
   * @return {Function} a function with an action handler signature
   */
  function wrapWithFixedAnchor(actionHandler) {
    return function(eventData, transform, x, y) {
      var target = transform.target, centerPoint = target.getCenterPoint(),
          constraint = target.translateToOriginPoint(centerPoint, transform.originX, transform.originY),
          actionPerformed = actionHandler(eventData, transform, x, y);
      target.setPositionByOrigin(constraint, transform.originX, transform.originY);
      return actionPerformed;
    };
  }

  /**
   * Wrap an action handler with firing an event if the action is performed
   * @param {Function} actionHandler the function to wrap
   * @return {Function} a function with an action handler signature
   */
  function wrapWithFireEvent(eventName, actionHandler) {
    return function(eventData, transform, x, y) {
      var actionPerformed = actionHandler(eventData, transform, x, y);
      if (actionPerformed) {
        fireEvent(eventName, commonEventInfo(eventData, transform, x, y));
      }
      return actionPerformed;
    };
  }

  /**
   * Transforms a point described by x and y in a distance from the top left corner of the object
   * bounding box.
   * @param {Object} transform
   * @param {String} originX
   * @param {String} originY
   * @param {number} x
   * @param {number} y
   * @return {Fabric.Point} the normalized point
   */
  function getLocalPoint(transform, originX, originY, x, y) {
    var target = transform.target,
        control = target.controls[transform.corner],
        zoom = target.canvas.getZoom(),
        padding = target.padding / zoom,
        localPoint = target.toLocalPoint(new fabric.Point(x, y), originX, originY);
    if (localPoint.x >= padding) {
      localPoint.x -= padding;
    }
    if (localPoint.x <= -padding) {
      localPoint.x += padding;
    }
    if (localPoint.y >= padding) {
      localPoint.y -= padding;
    }
    if (localPoint.y <= padding) {
      localPoint.y += padding;
    }
    localPoint.x -= control.offsetX;
    localPoint.y -= control.offsetY;
    return localPoint;
  }

  /**
   * Detect if the fabric object is flipped on one side.
   * @param {fabric.Object} target
   * @return {Boolean} true if one flip, but not two.
   */
  function targetHasOneFlip(target) {
    return target.flipX !== target.flipY;
  }

  /**
   * Utility function to compensate the scale factor when skew is applied on both axes
   * @private
   */
  function compensateScaleForSkew(target, oppositeSkew, scaleToCompensate, axis, reference) {
    if (target[oppositeSkew] !== 0) {
      var newDim = target._getTransformedDimensions()[axis];
      var newValue = reference / newDim * target[scaleToCompensate];
      target.set(scaleToCompensate, newValue);
    }
  }

  /**
   * Action handler for skewing on the X axis
   * @private
   */
  function skewObjectX(eventData, transform, x, y) {
    var target = transform.target,
        // find how big the object would be, if there was no skewX. takes in account scaling
        dimNoSkew = target._getTransformedDimensions(0, target.skewY),
        localPoint = getLocalPoint(transform, transform.originX, transform.originY, x, y),
        // the mouse is in the center of the object, and we want it to stay there.
        // so the object will grow twice as much as the mouse.
        // this makes the skew growth to localPoint * 2 - dimNoSkew.
        totalSkewSize = Math.abs(localPoint.x * 2) - dimNoSkew.x,
        currentSkew = target.skewX, newSkew;
    if (totalSkewSize < 2) {
      // let's make it easy to go back to position 0.
      newSkew = 0;
    }
    else {
      newSkew = radiansToDegrees(
        Math.atan2((totalSkewSize / target.scaleX), (dimNoSkew.y / target.scaleY))
      );
      // now we have to find the sign of the skew.
      // it mostly depend on the origin of transformation.
      if (transform.originX === LEFT && transform.originY === BOTTOM) {
        newSkew = -newSkew;
      }
      if (transform.originX === RIGHT && transform.originY === TOP) {
        newSkew = -newSkew;
      }
      if (targetHasOneFlip(target)) {
        newSkew = -newSkew;
      }
    }
    var hasSkewed = currentSkew !== newSkew;
    if (hasSkewed) {
      var dimBeforeSkewing = target._getTransformedDimensions().y;
      target.set('skewX', newSkew);
      compensateScaleForSkew(target, 'skewY', 'scaleY', 'y', dimBeforeSkewing);
    }
    return hasSkewed;
  }

  /**
   * Action handler for skewing on the Y axis
   * @private
   */
  function skewObjectY(eventData, transform, x, y) {
    var target = transform.target,
        // find how big the object would be, if there was no skewX. takes in account scaling
        dimNoSkew = target._getTransformedDimensions(target.skewX, 0),
        localPoint = getLocalPoint(transform, transform.originX, transform.originY, x, y),
        // the mouse is in the center of the object, and we want it to stay there.
        // so the object will grow twice as much as the mouse.
        // this makes the skew growth to localPoint * 2 - dimNoSkew.
        totalSkewSize = Math.abs(localPoint.y * 2) - dimNoSkew.y,
        currentSkew = target.skewY, newSkew;
    if (totalSkewSize < 2) {
      // let's make it easy to go back to position 0.
      newSkew = 0;
    }
    else {
      newSkew = radiansToDegrees(
        Math.atan2((totalSkewSize / target.scaleY), (dimNoSkew.x / target.scaleX))
      );
      // now we have to find the sign of the skew.
      // it mostly depend on the origin of transformation.
      if (transform.originX === LEFT && transform.originY === BOTTOM) {
        newSkew = -newSkew;
      }
      if (transform.originX === RIGHT && transform.originY === TOP) {
        newSkew = -newSkew;
      }
      if (targetHasOneFlip(target)) {
        newSkew = -newSkew;
      }
    }
    var hasSkewed = currentSkew !== newSkew;
    if (hasSkewed) {
      var dimBeforeSkewing = target._getTransformedDimensions().x;
      target.set('skewY', newSkew);
      compensateScaleForSkew(target, 'skewX', 'scaleX', 'x', dimBeforeSkewing);
    }
    return hasSkewed;
  }

  /**
   * Wrapped Action handler for skewing on the Y axis, takes care of the
   * skew direction and determine the correct transform origin for the anchor point
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function skewHandlerX(eventData, transform, x, y) {
    // step1 figure out and change transform origin.
    // if skewX > 0 and originY bottom we anchor on right
    // if skewX > 0 and originY top we anchor on left
    // if skewX < 0 and originY bottom we anchor on left
    // if skewX < 0 and originY top we anchor on right
    // if skewX is 0, we look for mouse position to understand where are we going.
    var target = transform.target, currentSkew = target.skewX, originX, originY = transform.originY;
    if (target.lockSkewingX) {
      return false;
    }
    if (currentSkew === 0) {
      var localPointFromCenter = getLocalPoint(transform, CENTER, CENTER, x, y);
      if (localPointFromCenter.x > 0) {
        // we are pulling right, anchor left;
        originX = LEFT;
      }
      else {
        // we are pulling right, anchor right
        originX = RIGHT;
      }
    }
    else {
      if (currentSkew > 0) {
        originX = originY === TOP ? LEFT : RIGHT;
      }
      if (currentSkew < 0) {
        originX = originY === TOP ? RIGHT : LEFT;
      }
      // is the object flipped on one side only? swap the origin.
      if (targetHasOneFlip(target)) {
        originX = originX === LEFT ? RIGHT : LEFT;
      }
    }

    // once we have the origin, we find the anchor point
    transform.originX = originX;
    var finalHandler = wrapWithFireEvent('skewing', wrapWithFixedAnchor(skewObjectX));
    return finalHandler(eventData, transform, x, y);
  }

  /**
   * Wrapped Action handler for skewing on the Y axis, takes care of the
   * skew direction and determine the correct transform origin for the anchor point
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function skewHandlerY(eventData, transform, x, y) {
    // step1 figure out and change transform origin.
    // if skewY > 0 and originX left we anchor on top
    // if skewY > 0 and originX right we anchor on bottom
    // if skewY < 0 and originX left we anchor on bottom
    // if skewY < 0 and originX right we anchor on top
    // if skewY is 0, we look for mouse position to understand where are we going.
    var target = transform.target, currentSkew = target.skewY, originY, originX = transform.originX;
    if (target.lockSkewingY) {
      return false;
    }
    if (currentSkew === 0) {
      var localPointFromCenter = getLocalPoint(transform, CENTER, CENTER, x, y);
      if (localPointFromCenter.y > 0) {
        // we are pulling down, anchor up;
        originY = TOP;
      }
      else {
        // we are pulling up, anchor down
        originY = BOTTOM;
      }
    }
    else {
      if (currentSkew > 0) {
        originY = originX === LEFT ? TOP : BOTTOM;
      }
      if (currentSkew < 0) {
        originY = originX === LEFT ? BOTTOM : TOP;
      }
      // is the object flipped on one side only? swap the origin.
      if (targetHasOneFlip(target)) {
        originY = originY === TOP ? BOTTOM : TOP;
      }
    }

    // once we have the origin, we find the anchor point
    transform.originY = originY;
    var finalHandler = wrapWithFireEvent('skewing', wrapWithFixedAnchor(skewObjectY));
    return finalHandler(eventData, transform, x, y);
  }

  /**
   * Action handler for rotation and snapping, without anchor point.
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   * @private
   */
  function rotationWithSnapping(eventData, transform, x, y) {
    var t = transform,
        target = t.target,
        pivotPoint = target.translateToOriginPoint(target.getCenterPoint(), t.originX, t.originY);

    if (target.lockRotation) {
      return false;
    }

    var lastAngle = Math.atan2(t.ey - pivotPoint.y, t.ex - pivotPoint.x),
        curAngle = Math.atan2(y - pivotPoint.y, x - pivotPoint.x),
        angle = radiansToDegrees(curAngle - lastAngle + t.theta),
        hasRotated = true;

    if (target.snapAngle > 0) {
      var snapAngle  = target.snapAngle,
          snapThreshold  = target.snapThreshold || snapAngle,
          rightAngleLocked = Math.ceil(angle / snapAngle) * snapAngle,
          leftAngleLocked = Math.floor(angle / snapAngle) * snapAngle;

      if (Math.abs(angle - leftAngleLocked) < snapThreshold) {
        angle = leftAngleLocked;
      }
      else if (Math.abs(angle - rightAngleLocked) < snapThreshold) {
        angle = rightAngleLocked;
      }
    }

    // normalize angle to positive value
    if (angle < 0) {
      angle = 360 + angle;
    }
    angle %= 360;

    hasRotated = target.angle !== angle;
    target.angle = angle;
    return hasRotated;
  }

  /**
   * Basic scaling logic, reused with different constrain for scaling X,Y, freely or equally.
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @param {Object} options additional information for scaling
   * @param {String} options.by 'x', 'y', 'equally' or '' to indicate type of scaling
   * @return {Boolean} true if some change happened
   * @private
   */
  function scaleObject(eventData, transform, x, y, options) {
    options = options || {};
    var target = transform.target,
        lockScalingX = target.lockScalingX, lockScalingY = target.lockScalingY,
        by = options.by, newPoint, scaleX, scaleY, dim,
        scaleProportionally = scaleIsProportional(eventData, target),
        forbidScaling = scalingIsForbidden(target, by, scaleProportionally),
        signX, signY, gestureScale = transform.gestureScale;

    if (forbidScaling) {
      return false;
    }
    if (gestureScale) {
      scaleX = transform.scaleX * gestureScale;
      scaleY = transform.scaleY * gestureScale;
    }
    else {
      newPoint = getLocalPoint(transform, transform.originX, transform.originY, x, y);
      // use of sign: We use sign to detect change of direction of an action. sign usually change when
      // we cross the origin point with the mouse. So a scale flip for example. There is an issue when scaling
      // by center and scaling using one middle control ( default: mr, mt, ml, mb), the mouse movement can easily
      // cross many time the origin point and flip the object. so we need a way to filter out the noise.
      // This ternary here should be ok to filter out X scaling when we want Y only and vice versa.
      signX = by !== 'y' ? sign(newPoint.x) : 1;
      signY = by !== 'x' ? sign(newPoint.y) : 1;
      if (!transform.signX) {
        transform.signX = signX;
      }
      if (!transform.signY) {
        transform.signY = signY;
      }

      if (target.lockScalingFlip &&
        (transform.signX !== signX || transform.signY !== signY)
      ) {
        return false;
      }

      dim = target._getTransformedDimensions();
      // missing detection of flip and logic to switch the origin
      if (scaleProportionally && !by) {
        // uniform scaling
        var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
            original = transform.original,
            originalDistance = Math.abs(dim.x * original.scaleX / target.scaleX) +
              Math.abs(dim.y * original.scaleY / target.scaleY),
            scale = distance / originalDistance;
        scaleX = original.scaleX * scale;
        scaleY = original.scaleY * scale;
      }
      else {
        scaleX = Math.abs(newPoint.x * target.scaleX / dim.x);
        scaleY = Math.abs(newPoint.y * target.scaleY / dim.y);
      }
      // if we are scaling by center, we need to double the scale
      if (isTransformCentered(transform)) {
        scaleX *= 2;
        scaleY *= 2;
      }
      if (transform.signX !== signX && by !== 'y') {
        transform.originX = opposite[transform.originX];
        scaleX *= -1;
        transform.signX = signX;
      }
      if (transform.signY !== signY && by !== 'x') {
        transform.originY = opposite[transform.originY];
        scaleY *= -1;
        transform.signY = signY;
      }
    }
    // minScale is taken are in the setter.
    var oldScaleX = target.scaleX, oldScaleY = target.scaleY;
    if (!by) {
      !lockScalingX && target.set('scaleX', scaleX);
      !lockScalingY && target.set('scaleY', scaleY);
    }
    else {
      // forbidden cases already handled on top here.
      by === 'x' && target.set('scaleX', scaleX);
      by === 'y' && target.set('scaleY', scaleY);
    }
    return oldScaleX !== target.scaleX || oldScaleY !== target.scaleY;
  }

  /**
   * Generic scaling logic, to scale from corners either equally or freely.
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function scaleObjectFromCorner(eventData, transform, x, y) {
    return scaleObject(eventData, transform, x, y);
  }

  /**
   * Scaling logic for the X axis.
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function scaleObjectX(eventData, transform, x, y) {
    return scaleObject(eventData, transform, x, y , { by: 'x' });
  }

  /**
   * Scaling logic for the Y axis.
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function scaleObjectY(eventData, transform, x, y) {
    return scaleObject(eventData, transform, x, y , { by: 'y' });
  }

  /**
   * Composed action handler to either scale Y or skew X
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function scalingYOrSkewingX(eventData, transform, x, y) {
    // ok some safety needed here.
    if (eventData[transform.target.canvas.altActionKey]) {
      return controls.skewHandlerX(eventData, transform, x, y);
    }
    return controls.scalingY(eventData, transform, x, y);
  }

  /**
   * Composed action handler to either scale X or skew Y
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function scalingXOrSkewingY(eventData, transform, x, y) {
    // ok some safety needed here.
    if (eventData[transform.target.canvas.altActionKey]) {
      return controls.skewHandlerY(eventData, transform, x, y);
    }
    return controls.scalingX(eventData, transform, x, y);
  }

  /**
   * Action handler to change textbox width
   * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if some change happened
   */
  function changeWidth(eventData, transform, x, y) {
    var target = transform.target, localPoint = getLocalPoint(transform, transform.originX, transform.originY, x, y),
        strokePadding = target.strokeWidth / (target.strokeUniform ? target.scaleX : 1),
        multiplier = isTransformCentered(transform) ? 2 : 1,
        oldWidth = target.width,
        newWidth = Math.abs(localPoint.x * multiplier / target.scaleX) - strokePadding;
    target.set('width', Math.max(newWidth, 0));
    return oldWidth !== newWidth;
  }

  /**
   * Action handler
   * @private
   * @param {Event} eventData javascript event that is doing the transform
   * @param {Object} transform javascript object containing a series of information around the current transform
   * @param {number} x current mouse x position, canvas normalized
   * @param {number} y current mouse y position, canvas normalized
   * @return {Boolean} true if the translation occurred
   */
  function dragHandler(eventData, transform, x, y) {
    var target = transform.target,
        newLeft = x - transform.offsetX,
        newTop = y - transform.offsetY,
        moveX = !target.get('lockMovementX') && target.left !== newLeft,
        moveY = !target.get('lockMovementY') && target.top !== newTop;
    moveX && target.set('left', newLeft);
    moveY && target.set('top', newTop);
    if (moveX || moveY) {
      fireEvent('moving', commonEventInfo(eventData, transform, x, y));
    }
    return moveX || moveY;
  }

  controls.scaleCursorStyleHandler = scaleCursorStyleHandler;
  controls.skewCursorStyleHandler = skewCursorStyleHandler;
  controls.scaleSkewCursorStyleHandler = scaleSkewCursorStyleHandler;
  controls.rotationWithSnapping = wrapWithFireEvent('rotating', wrapWithFixedAnchor(rotationWithSnapping));
  controls.scalingEqually = wrapWithFireEvent('scaling', wrapWithFixedAnchor( scaleObjectFromCorner));
  controls.scalingX = wrapWithFireEvent('scaling', wrapWithFixedAnchor(scaleObjectX));
  controls.scalingY = wrapWithFireEvent('scaling', wrapWithFixedAnchor(scaleObjectY));
  controls.scalingYOrSkewingX = scalingYOrSkewingX;
  controls.scalingXOrSkewingY = scalingXOrSkewingY;
  controls.changeWidth = wrapWithFireEvent('resizing', wrapWithFixedAnchor(changeWidth));
  controls.skewHandlerX = skewHandlerX;
  controls.skewHandlerY = skewHandlerY;
  controls.dragHandler = dragHandler;
  controls.scaleOrSkewActionName = scaleOrSkewActionName;
  controls.rotationStyleHandler = rotationStyleHandler;
  controls.fireEvent = fireEvent;
  controls.wrapWithFixedAnchor = wrapWithFixedAnchor;
  controls.wrapWithFireEvent = wrapWithFireEvent;
  controls.getLocalPoint = getLocalPoint;
  fabric.controlsUtils = controls;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      degreesToRadians = fabric.util.degreesToRadians,
      controls = fabric.controlsUtils;

  /**
   * Render a round control, as per fabric features.
   * This function is written to respect object properties like transparentCorners, cornerSize
   * cornerColor, cornerStrokeColor
   * plus the addition of offsetY and offsetX.
   * @param {CanvasRenderingContext2D} ctx context to render on
   * @param {Number} left x coordinate where the control center should be
   * @param {Number} top y coordinate where the control center should be
   * @param {Object} styleOverride override for fabric.Object controls style
   * @param {fabric.Object} fabricObject the fabric object for which we are rendering controls
   */
  function renderCircleControl (ctx, left, top, styleOverride, fabricObject) {
    styleOverride = styleOverride || {};
    var xSize = this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
        ySize = this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
        transparentCorners = typeof styleOverride.transparentCorners !== 'undefined' ?
          styleOverride.transparentCorners : fabricObject.transparentCorners,
        methodName = transparentCorners ? 'stroke' : 'fill',
        stroke = !transparentCorners && (styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor),
        myLeft = left,
        myTop = top, size;
    ctx.save();
    ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor;
    ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
    // as soon as fabric react v5, remove ie11, use proper ellipse code.
    if (xSize > ySize) {
      size = xSize;
      ctx.scale(1.0, ySize / xSize);
      myTop = top * xSize / ySize;
    }
    else if (ySize > xSize) {
      size = ySize;
      ctx.scale(xSize / ySize, 1.0);
      myLeft = left * ySize / xSize;
    }
    else {
      size = xSize;
    }
    // this is still wrong
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(myLeft, myTop, size / 2, 0, 2 * Math.PI, false);
    ctx[methodName]();
    if (stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Render a square control, as per fabric features.
   * This function is written to respect object properties like transparentCorners, cornerSize
   * cornerColor, cornerStrokeColor
   * plus the addition of offsetY and offsetX.
   * @param {CanvasRenderingContext2D} ctx context to render on
   * @param {Number} left x coordinate where the control center should be
   * @param {Number} top y coordinate where the control center should be
   * @param {Object} styleOverride override for fabric.Object controls style
   * @param {fabric.Object} fabricObject the fabric object for which we are rendering controls
   */
  function renderSquareControl(ctx, left, top, styleOverride, fabricObject) {
    styleOverride = styleOverride || {};
    var xSize = this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
        ySize = this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
        transparentCorners = typeof styleOverride.transparentCorners !== 'undefined' ?
          styleOverride.transparentCorners : fabricObject.transparentCorners,
        methodName = transparentCorners ? 'stroke' : 'fill',
        stroke = !transparentCorners && (
          styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor
        ), xSizeBy2 = xSize / 2, ySizeBy2 = ySize / 2;
    ctx.save();
    ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor;
    ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
    // this is still wrong
    ctx.lineWidth = 1;
    ctx.translate(left, top);
    ctx.rotate(degreesToRadians(fabricObject.angle));
    // this does not work, and fixed with ( && ) does not make sense.
    // to have real transparent corners we need the controls on upperCanvas
    // transparentCorners || ctx.clearRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
    ctx[methodName + 'Rect'](-xSizeBy2, -ySizeBy2, xSize, ySize);
    if (stroke) {
      ctx.strokeRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
    }
    ctx.restore();
  }

  controls.renderCircleControl = renderCircleControl;
  controls.renderSquareControl = renderSquareControl;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { });

  function Control(options) {
    for (var i in options) {
      this[i] = options[i];
    }
  }

  fabric.Control = Control;

  fabric.Control.prototype = /** @lends fabric.Control.prototype */ {

    /**
     * keep track of control visibility.
     * mainly for backward compatibility.
     * if you do not want to see a control, you can remove it
     * from the controlset.
     * @type {Boolean}
     * @default true
     */
    visible: true,

    /**
     * Name of the action that the control will likely execute.
     * This is optional. FabricJS uses to identify what the user is doing for some
     * extra optimizations. If you are writing a custom control and you want to know
     * somewhere else in the code what is going on, you can use this string here.
     * you can also provide a custom getActionName if your control run multiple actions
     * depending on some external state.
     * default to scale since is the most common, used on 4 corners by default
     * @type {String}
     * @default 'scale'
     */
    actionName: 'scale',

    /**
     * Drawing angle of the control.
     * NOT used for now, but name marked as needed for internal logic
     * example: to reuse the same drawing function for different rotated controls
     * @type {Number}
     * @default 0
     */
    angle: 0,

    /**
     * Relative position of the control. X
     * 0,0 is the center of the Object, while -0.5 (left) or 0.5 (right) are the extremities
     * of the bounding box.
     * @type {Number}
     * @default 0
     */
    x: 0,

    /**
     * Relative position of the control. Y
     * 0,0 is the center of the Object, while -0.5 (top) or 0.5 (bottom) are the extremities
     * of the bounding box.
     * @type {Number}
     * @default 0
     */
    y: 0,

    /**
     * Horizontal offset of the control from the defined position. In pixels
     * Positive offset moves the control to the right, negative to the left.
     * It used when you want to have position of control that does not scale with
     * the bounding box. Example: rotation control is placed at x:0, y: 0.5 on
     * the boundindbox, with an offset of 30 pixels vertically. Those 30 pixels will
     * stay 30 pixels no matter how the object is big. Another example is having 2
     * controls in the corner, that stay in the same position when the object scale.
     * of the bounding box.
     * @type {Number}
     * @default 0
     */
    offsetX: 0,

    /**
     * Vertical offset of the control from the defined position. In pixels
     * Positive offset moves the control to the bottom, negative to the top.
     * @type {Number}
     * @default 0
     */
    offsetY: 0,

    /**
     * Sets the length of the control. If null, defaults to object's cornerSize.
     * Expects both sizeX and sizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    sizeX: null,

    /**
     * Sets the height of the control. If null, defaults to object's cornerSize.
     * Expects both sizeX and sizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    sizeY: null,

    /**
     * Sets the length of the touch area of the control. If null, defaults to object's touchCornerSize.
     * Expects both touchSizeX and touchSizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    touchSizeX: null,

    /**
     * Sets the height of the touch area of the control. If null, defaults to object's touchCornerSize.
     * Expects both touchSizeX and touchSizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    touchSizeY: null,

    /**
     * Css cursor style to display when the control is hovered.
     * if the method `cursorStyleHandler` is provided, this property is ignored.
     * @type {String}
     * @default 'crosshair'
     */
    cursorStyle: 'crosshair',

    /**
     * If controls has an offsetY or offsetX, draw a line that connects
     * the control to the bounding box
     * @type {Boolean}
     * @default false
     */
    withConnection: false,

    /**
     * The control actionHandler, provide one to handle action ( control being moved )
     * @param {Event} eventData the native mouse event
     * @param {Object} transformData properties of the current transform
     * @param {Number} x x position of the cursor
     * @param {Number} y y position of the cursor
     * @return {Boolean} true if the action/event modified the object
     */
    actionHandler: function(/* eventData, transformData, x, y */) { },

    /**
     * The control handler for mouse down, provide one to handle mouse down on control
     * @param {Event} eventData the native mouse event
     * @param {Object} transformData properties of the current transform
     * @param {Number} x x position of the cursor
     * @param {Number} y y position of the cursor
     * @return {Boolean} true if the action/event modified the object
     */
    mouseDownHandler: function(/* eventData, transformData, x, y */) { },

    /**
     * The control mouseUpHandler, provide one to handle an effect on mouse up.
     * @param {Event} eventData the native mouse event
     * @param {Object} transformData properties of the current transform
     * @param {Number} x x position of the cursor
     * @param {Number} y y position of the cursor
     * @return {Boolean} true if the action/event modified the object
     */
    mouseUpHandler: function(/* eventData, transformData, x, y */) { },

    /**
     * Returns control actionHandler
     * @param {Event} eventData the native mouse event
     * @param {fabric.Object} fabricObject on which the control is displayed
     * @param {fabric.Control} control control for which the action handler is being asked
     * @return {Function} the action handler
     */
    getActionHandler: function(/* eventData, fabricObject, control */) {
      return this.actionHandler;
    },

    /**
     * Returns control mouseDown handler
     * @param {Event} eventData the native mouse event
     * @param {fabric.Object} fabricObject on which the control is displayed
     * @param {fabric.Control} control control for which the action handler is being asked
     * @return {Function} the action handler
     */
    getMouseDownHandler: function(/* eventData, fabricObject, control */) {
      return this.mouseDownHandler;
    },

    /**
     * Returns control mouseUp handler
     * @param {Event} eventData the native mouse event
     * @param {fabric.Object} fabricObject on which the control is displayed
     * @param {fabric.Control} control control for which the action handler is being asked
     * @return {Function} the action handler
     */
    getMouseUpHandler: function(/* eventData, fabricObject, control */) {
      return this.mouseUpHandler;
    },

    /**
     * Returns control cursorStyle for css using cursorStyle. If you need a more elaborate
     * function you can pass one in the constructor
     * the cursorStyle property
     * @param {Event} eventData the native mouse event
     * @param {fabric.Control} control the current control ( likely this)
     * @param {fabric.Object} object on which the control is displayed
     * @return {String}
     */
    cursorStyleHandler: function(eventData, control /* fabricObject */) {
      return control.cursorStyle;
    },

    /**
     * Returns the action name. The basic implementation just return the actionName property.
     * @param {Event} eventData the native mouse event
     * @param {fabric.Control} control the current control ( likely this)
     * @param {fabric.Object} object on which the control is displayed
     * @return {String}
     */
    getActionName: function(eventData, control /* fabricObject */) {
      return control.actionName;
    },

    /**
     * Returns controls visibility
     * @param {fabric.Object} object on which the control is displayed
     * @param {String} controlKey key where the control is memorized on the
     * @return {Boolean}
     */
    getVisibility: function(fabricObject, controlKey) {
      var objectVisibility = fabricObject._controlsVisibility;
      if (objectVisibility && typeof objectVisibility[controlKey] !== 'undefined') {
        return objectVisibility[controlKey];
      }
      return this.visible;
    },

    /**
     * Sets controls visibility
     * @param {Boolean} visibility for the object
     * @return {Void}
     */
    setVisibility: function(visibility /* name, fabricObject */) {
      this.visible = visibility;
    },


    positionHandler: function(dim, finalMatrix /*, fabricObject, currentControl */) {
      var point = fabric.util.transformPoint({
        x: this.x * dim.x + this.offsetX,
        y: this.y * dim.y + this.offsetY }, finalMatrix);
      return point;
    },

    /**
     * Returns the coords for this control based on object values.
     * @param {Number} objectAngle angle from the fabric object holding the control
     * @param {Number} objectCornerSize cornerSize from the fabric object holding the control (or touchCornerSize if
     *   isTouch is true)
     * @param {Number} centerX x coordinate where the control center should be
     * @param {Number} centerY y coordinate where the control center should be
     * @param {boolean} isTouch true if touch corner, false if normal corner
     */
    calcCornerCoords: function(objectAngle, objectCornerSize, centerX, centerY, isTouch) {
      var cosHalfOffset,
          sinHalfOffset,
          cosHalfOffsetComp,
          sinHalfOffsetComp,
          xSize = (isTouch) ? this.touchSizeX : this.sizeX,
          ySize = (isTouch) ? this.touchSizeY : this.sizeY;
      if (xSize && ySize && xSize !== ySize) {
        // handle rectangular corners
        var controlTriangleAngle = Math.atan2(ySize, xSize);
        var cornerHypotenuse = Math.sqrt(xSize * xSize + ySize * ySize) / 2;
        var newTheta = controlTriangleAngle - fabric.util.degreesToRadians(objectAngle);
        var newThetaComp = Math.PI / 2 - controlTriangleAngle - fabric.util.degreesToRadians(objectAngle);
        cosHalfOffset = cornerHypotenuse * fabric.util.cos(newTheta);
        sinHalfOffset = cornerHypotenuse * fabric.util.sin(newTheta);
        // use complementary angle for two corners
        cosHalfOffsetComp = cornerHypotenuse * fabric.util.cos(newThetaComp);
        sinHalfOffsetComp = cornerHypotenuse * fabric.util.sin(newThetaComp);
      }
      else {
        // handle square corners
        // use default object corner size unless size is defined
        var cornerSize = (xSize && ySize) ? xSize : objectCornerSize;
        /* 0.7071067812 stands for sqrt(2)/2 */
        cornerHypotenuse = cornerSize * 0.7071067812;
        // complementary angles are equal since they're both 45 degrees
        var newTheta = fabric.util.degreesToRadians(45 - objectAngle);
        cosHalfOffset = cosHalfOffsetComp = cornerHypotenuse * fabric.util.cos(newTheta);
        sinHalfOffset = sinHalfOffsetComp = cornerHypotenuse * fabric.util.sin(newTheta);
      }

      return {
        tl: {
          x: centerX - sinHalfOffsetComp,
          y: centerY - cosHalfOffsetComp,
        },
        tr: {
          x: centerX + cosHalfOffset,
          y: centerY - sinHalfOffset,
        },
        bl: {
          x: centerX - cosHalfOffset,
          y: centerY + sinHalfOffset,
        },
        br: {
          x: centerX + sinHalfOffsetComp,
          y: centerY + cosHalfOffsetComp,
        },
      };
    },

    /**
    * Render function for the control.
    * When this function runs the context is unscaled. unrotate. Just retina scaled.
    * all the functions will have to translate to the point left,top before starting Drawing
    * if they want to draw a control where the position is detected.
    * left and top are the result of the positionHandler function
    * @param {RenderingContext2D} ctx the context where the control will be drawn
    * @param {Number} left position of the canvas where we are about to render the control.
    * @param {Number} top position of the canvas where we are about to render the control.
    * @param {Object} styleOverride
    * @param {fabric.Object} fabricObject the object where the control is about to be rendered
    */
    render: function(ctx, left, top, styleOverride, fabricObject) {
      styleOverride = styleOverride || {};
      switch (styleOverride.cornerStyle || fabricObject.cornerStyle) {
        case 'circle':
          fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
          break;
        default:
          fabric.controlsUtils.renderSquareControl.call(this, ctx, left, top, styleOverride, fabricObject);
      }
    },
  };

})(typeof exports !== 'undefined' ? exports : this);
(function() {

  'use strict';

  var toFixed = fabric.util.toFixed;

  /**
   * Pattern class
   * @class fabric.Pattern
   * @see {@link http://fabricjs.com/patterns|Pattern demo}
   * @see {@link http://fabricjs.com/dynamic-patterns|DynamicPattern demo}
   * @see {@link fabric.Pattern#initialize} for constructor definition
   */


  fabric.Pattern = fabric.util.createClass(/** @lends fabric.Pattern.prototype */ {

    /**
     * Repeat property of a pattern (one of repeat, repeat-x, repeat-y or no-repeat)
     * @type String
     * @default
     */
    repeat: 'repeat',

    /**
     * Pattern horizontal offset from object's left/top corner
     * @type Number
     * @default
     */
    offsetX: 0,

    /**
     * Pattern vertical offset from object's left/top corner
     * @type Number
     * @default
     */
    offsetY: 0,

    /**
     * crossOrigin value (one of "", "anonymous", "use-credentials")
     * @see https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes
     * @type String
     * @default
     */
    crossOrigin: '',

    /**
     * transform matrix to change the pattern, imported from svgs.
     * @type Array
     * @default
     */
    patternTransform: null,

    /**
     * Constructor
     * @param {Object} [options] Options object
     * @param {Function} [callback] function to invoke after callback init.
     * @return {fabric.Pattern} thisArg
     */
    initialize: function(options, callback) {
      options || (options = { });

      this.id = fabric.Object.__uid++;
      this.setOptions(options);
      if (!options.source || (options.source && typeof options.source !== 'string')) {
        callback && callback(this);
        return;
      }
      else {
        // img src string
        var _this = this;
        this.source = fabric.util.createImage();
        fabric.util.loadImage(options.source, function(img, isError) {
          _this.source = img;
          callback && callback(_this, isError);
        }, null, this.crossOrigin);
      }
    },

    /**
     * Returns object representation of a pattern
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of a pattern instance
     */
    toObject: function(propertiesToInclude) {
      var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS,
          source, object;

      // <img> element
      if (typeof this.source.src === 'string') {
        source = this.source.src;
      }
      // <canvas> element
      else if (typeof this.source === 'object' && this.source.toDataURL) {
        source = this.source.toDataURL();
      }

      object = {
        type: 'pattern',
        source: source,
        repeat: this.repeat,
        crossOrigin: this.crossOrigin,
        offsetX: toFixed(this.offsetX, NUM_FRACTION_DIGITS),
        offsetY: toFixed(this.offsetY, NUM_FRACTION_DIGITS),
        patternTransform: this.patternTransform ? this.patternTransform.concat() : null
      };
      fabric.util.populateWithProperties(this, object, propertiesToInclude);

      return object;
    },

    

    setOptions: function(options) {
      for (var prop in options) {
        this[prop] = options[prop];
      }
    },

    /**
     * Returns an instance of CanvasPattern
     * @param {CanvasRenderingContext2D} ctx Context to create pattern
     * @return {CanvasPattern}
     */
    toLive: function(ctx) {
      var source = this.source;
      // if the image failed to load, return, and allow rest to continue loading
      if (!source) {
        return '';
      }

      // if an image
      if (typeof source.src !== 'undefined') {
        if (!source.complete) {
          return '';
        }
        if (source.naturalWidth === 0 || source.naturalHeight === 0) {
          return '';
        }
      }
      return ctx.createPattern(source, this.repeat);
    }
  });
})();
(function () {

  'use strict';

  if (fabric.StaticCanvas) {
    fabric.warn('fabric.StaticCanvas is already defined.');
    return;
  }

  // aliases for faster resolution
  var extend = fabric.util.object.extend,
      getElementOffset = fabric.util.getElementOffset,
      removeFromArray = fabric.util.removeFromArray,
      toFixed = fabric.util.toFixed,
      transformPoint = fabric.util.transformPoint,
      invertTransform = fabric.util.invertTransform,
      getNodeCanvas = fabric.util.getNodeCanvas,
      createCanvasElement = fabric.util.createCanvasElement,

      CANVAS_INIT_ERROR = new Error('Could not initialize `canvas` element');

  /**
   * Static canvas class
   * @class fabric.StaticCanvas
   * @mixes fabric.Collection
   * @mixes fabric.Observable
   * @see {@link http://fabricjs.com/static_canvas|StaticCanvas demo}
   * @see {@link fabric.StaticCanvas#initialize} for constructor definition
   * @fires before:render
   * @fires after:render
   * @fires canvas:cleared
   * @fires object:added
   * @fires object:removed
   */
  fabric.StaticCanvas = fabric.util.createClass(fabric.CommonMethods, /** @lends fabric.StaticCanvas.prototype */ {

    /**
     * Constructor
     * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(el, options) {
      options || (options = { });
      this.renderAndResetBound = this.renderAndReset.bind(this);
      this.requestRenderAllBound = this.requestRenderAll.bind(this);
      this._initStatic(el, options);
    },

    /**
     * Background color of canvas instance.
     * Should be set via {@link fabric.StaticCanvas#setBackgroundColor}.
     * @type {(String|fabric.Pattern)}
     * @default
     */
    backgroundColor: '',

    /**
     * Background image of canvas instance.
     * since 2.4.0 image caching is active, please when putting an image as background, add to the
     * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
     * vale. As an alternative you can disable image objectCaching
     * @type fabric.Image
     * @default
     */
    backgroundImage: null,

    /**
     * Overlay color of canvas instance.
     * Should be set via {@link fabric.StaticCanvas#setOverlayColor}
     * @since 1.3.9
     * @type {(String|fabric.Pattern)}
     * @default
     */
    overlayColor: '',

    /**
     * Overlay image of canvas instance.
     * since 2.4.0 image caching is active, please when putting an image as overlay, add to the
     * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
     * vale. As an alternative you can disable image objectCaching
     * @type fabric.Image
     * @default
     */
    overlayImage: null,

    /**
     * Indicates whether toObject/toDatalessObject should include default values
     * if set to false, takes precedence over the object value.
     * @type Boolean
     * @default
     */
    includeDefaultValues: true,

    /**
     * Indicates whether objects' state should be saved
     * @type Boolean
     * @default
     */
    stateful: false,

    /**
     * Indicates whether {@link fabric.Collection.add}, {@link fabric.Collection.insertAt} and {@link fabric.Collection.remove},
     * {@link fabric.StaticCanvas.moveTo}, {@link fabric.StaticCanvas.clear} and many more, should also re-render canvas.
     * Disabling this option will not give a performance boost when adding/removing a lot of objects to/from canvas at once
     * since the renders are quequed and executed one per frame.
     * Disabling is suggested anyway and managing the renders of the app manually is not a big effort ( canvas.requestRenderAll() )
     * Left default to true to do not break documentation and old app, fiddles.
     * @type Boolean
     * @default
     */
    renderOnAddRemove: true,

    /**
     * Indicates whether object controls (borders/controls) are rendered above overlay image
     * @type Boolean
     * @default
     */
    controlsAboveOverlay: false,

    /**
     * Indicates whether the browser can be scrolled when using a touchscreen and dragging on the canvas
     * @type Boolean
     * @default
     */
    allowTouchScrolling: false,

    /**
     * Indicates whether this canvas will use image smoothing, this is on by default in browsers
     * @type Boolean
     * @default
     */
    imageSmoothingEnabled: true,

    /**
     * The transformation (a Canvas 2D API transform matrix) which focuses the viewport
     * @type Array
     * @example <caption>Default transform</caption>
     * canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
     * @example <caption>Scale by 70% and translate toward bottom-right by 50, without skewing</caption>
     * canvas.viewportTransform = [0.7, 0, 0, 0.7, 50, 50];
     * @default
     */
    viewportTransform: fabric.iMatrix.concat(),

    /**
     * if set to false background image is not affected by viewport transform
     * @since 1.6.3
     * @type Boolean
     * @default
     */
    backgroundVpt: true,

    /**
     * if set to false overlya image is not affected by viewport transform
     * @since 1.6.3
     * @type Boolean
     * @default
     */
    overlayVpt: true,

    /**
     * When true, canvas is scaled by devicePixelRatio for better rendering on retina screens
     * @type Boolean
     * @default
     */
    enableRetinaScaling: true,

    /**
     * Describe canvas element extension over design
     * properties are tl,tr,bl,br.
     * if canvas is not zoomed/panned those points are the four corner of canvas
     * if canvas is viewportTransformed you those points indicate the extension
     * of canvas element in plain untrasformed coordinates
     * The coordinates get updated with @method calcViewportBoundaries.
     * @memberOf fabric.StaticCanvas.prototype
     */
    vptCoords: { },

    /**
     * Based on vptCoords and object.aCoords, skip rendering of objects that
     * are not included in current viewport.
     * May greatly help in applications with crowded canvas and use of zoom/pan
     * If One of the corner of the bounding box of the object is on the canvas
     * the objects get rendered.
     * @memberOf fabric.StaticCanvas.prototype
     * @type Boolean
     * @default
     */
    skipOffscreen: true,

    /**
     * a fabricObject that, without stroke define a clipping area with their shape. filled in black
     * the clipPath object gets used when the canvas has rendered, and the context is placed in the
     * top left corner of the canvas.
     * clipPath will clip away controls, if you do not want this to happen use controlsAboveOverlay = true
     * @type fabric.Object
     */
    clipPath: undefined,

    /**
     * @private
     * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
     * @param {Object} [options] Options object
     */
    _initStatic: function(el, options) {
      var cb = this.requestRenderAllBound;
      this._objects = [];
      this._createLowerCanvas(el);
      this._initOptions(options);
      // only initialize retina scaling once
      if (!this.interactive) {
        this._initRetinaScaling();
      }

      if (options.overlayImage) {
        this.setOverlayImage(options.overlayImage, cb);
      }
      if (options.backgroundImage) {
        this.setBackgroundImage(options.backgroundImage, cb);
      }
      if (options.backgroundColor) {
        this.setBackgroundColor(options.backgroundColor, cb);
      }
      if (options.overlayColor) {
        this.setOverlayColor(options.overlayColor, cb);
      }
      this.calcOffset();
    },

    /**
     * @private
     */
    _isRetinaScaling: function() {
      return (fabric.devicePixelRatio > 1 && this.enableRetinaScaling);
    },

    /**
     * @private
     * @return {Number} retinaScaling if applied, otherwise 1;
     */
    getRetinaScaling: function() {
      return this._isRetinaScaling() ? Math.max(1, fabric.devicePixelRatio) : 1;
    },

    /**
     * @private
     */
    _initRetinaScaling: function() {
      if (!this._isRetinaScaling()) {
        return;
      }
      var scaleRatio = fabric.devicePixelRatio;
      this.__initRetinaScaling(scaleRatio, this.lowerCanvasEl, this.contextContainer);
      if (this.upperCanvasEl) {
        this.__initRetinaScaling(scaleRatio, this.upperCanvasEl, this.contextTop);
      }
    },

    __initRetinaScaling: function(scaleRatio, canvas, context) {
      canvas.setAttribute('width', this.width * scaleRatio);
      canvas.setAttribute('height', this.height * scaleRatio);
      context.scale(scaleRatio, scaleRatio);
    },


    /**
     * Calculates canvas element offset relative to the document
     * This method is also attached as "resize" event handler of window
     * @return {fabric.Canvas} instance
     * @chainable
     */
    calcOffset: function () {
      this._offset = getElementOffset(this.lowerCanvasEl);
      return this;
    },

    /**
     * Sets {@link fabric.StaticCanvas#overlayImage|overlay image} for this canvas
     * @param {(fabric.Image|String)} image fabric.Image instance or URL of an image to set overlay to
     * @param {Function} callback callback to invoke when image is loaded and set as an overlay
     * @param {Object} [options] Optional options to set for the {@link fabric.Image|overlay image}.
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/fabricjs/MnzHT/|jsFiddle demo}
     * @example <caption>Normal overlayImage with left/top = 0</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   // Needed to position overlayImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>overlayImage with different properties</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>Stretched overlayImage #1 - width/height correspond to canvas width/height</caption>
     * fabric.Image.fromURL('http://fabricjs.com/assets/jail_cell_bars.png', function(img, isError) {
     *    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
     *    canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
     * });
     * @example <caption>Stretched overlayImage #2 - width/height correspond to canvas width/height</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   width: canvas.width,
     *   height: canvas.height,
     *   // Needed to position overlayImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>overlayImage loaded from cross-origin</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top',
     *   crossOrigin: 'anonymous'
     * });
     */
    setOverlayImage: function (image, callback, options) {
      return this.__setBgOverlayImage('overlayImage', image, callback, options);
    },

    /**
     * Sets {@link fabric.StaticCanvas#backgroundImage|background image} for this canvas
     * @param {(fabric.Image|String)} image fabric.Image instance or URL of an image to set background to
     * @param {Function} callback Callback to invoke when image is loaded and set as background
     * @param {Object} [options] Optional options to set for the {@link fabric.Image|background image}.
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/djnr8o7a/28/|jsFiddle demo}
     * @example <caption>Normal backgroundImage with left/top = 0</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   // Needed to position backgroundImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>backgroundImage with different properties</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>Stretched backgroundImage #1 - width/height correspond to canvas width/height</caption>
     * fabric.Image.fromURL('http://fabricjs.com/assets/honey_im_subtle.png', function(img, isError) {
     *    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
     *    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
     * });
     * @example <caption>Stretched backgroundImage #2 - width/height correspond to canvas width/height</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   width: canvas.width,
     *   height: canvas.height,
     *   // Needed to position backgroundImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>backgroundImage loaded from cross-origin</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top',
     *   crossOrigin: 'anonymous'
     * });
     */
    // TODO: fix stretched examples
    setBackgroundImage: function (image, callback, options) {
      return this.__setBgOverlayImage('backgroundImage', image, callback, options);
    },

    /**
     * Sets {@link fabric.StaticCanvas#overlayColor|foreground color} for this canvas
     * @param {(String|fabric.Pattern)} overlayColor Color or pattern to set foreground color to
     * @param {Function} callback Callback to invoke when foreground color is set
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/fabricjs/pB55h/|jsFiddle demo}
     * @example <caption>Normal overlayColor - color value</caption>
     * canvas.setOverlayColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as overlayColor</caption>
     * canvas.setOverlayColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png'
     * }, canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as overlayColor with repeat and offset</caption>
     * canvas.setOverlayColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png',
     *   repeat: 'repeat',
     *   offsetX: 200,
     *   offsetY: 100
     * }, canvas.renderAll.bind(canvas));
     */
    setOverlayColor: function(overlayColor, callback) {
      return this.__setBgOverlayColor('overlayColor', overlayColor, callback);
    },

    /**
     * Sets {@link fabric.StaticCanvas#backgroundColor|background color} for this canvas
     * @param {(String|fabric.Pattern)} backgroundColor Color or pattern to set background color to
     * @param {Function} callback Callback to invoke when background color is set
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/fabricjs/hXzvk/|jsFiddle demo}
     * @example <caption>Normal backgroundColor - color value</caption>
     * canvas.setBackgroundColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as backgroundColor</caption>
     * canvas.setBackgroundColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png'
     * }, canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as backgroundColor with repeat and offset</caption>
     * canvas.setBackgroundColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png',
     *   repeat: 'repeat',
     *   offsetX: 200,
     *   offsetY: 100
     * }, canvas.renderAll.bind(canvas));
     */
    setBackgroundColor: function(backgroundColor, callback) {
      return this.__setBgOverlayColor('backgroundColor', backgroundColor, callback);
    },

    /**
     * @private
     * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundImage|backgroundImage}
     * or {@link fabric.StaticCanvas#overlayImage|overlayImage})
     * @param {(fabric.Image|String|null)} image fabric.Image instance, URL of an image or null to set background or overlay to
     * @param {Function} callback Callback to invoke when image is loaded and set as background or overlay. The first argument is the created image, the second argument is a flag indicating whether an error occurred or not.
     * @param {Object} [options] Optional options to set for the {@link fabric.Image|image}.
     */
    __setBgOverlayImage: function(property, image, callback, options) {
      if (typeof image === 'string') {
        fabric.util.loadImage(image, function(img, isError) {
          if (img) {
            var instance = new fabric.Image(img, options);
            this[property] = instance;
            instance.canvas = this;
          }
          callback && callback(img, isError);
        }, this, options && options.crossOrigin);
      }
      else {
        options && image.setOptions(options);
        this[property] = image;
        image && (image.canvas = this);
        callback && callback(image, false);
      }

      return this;
    },

    /**
     * @private
     * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundColor|backgroundColor}
     * or {@link fabric.StaticCanvas#overlayColor|overlayColor})
     * @param {(Object|String|null)} color Object with pattern information, color value or null
     * @param {Function} [callback] Callback is invoked when color is set
     */
    __setBgOverlayColor: function(property, color, callback) {
      this[property] = color;
      this._initGradient(color, property);
      this._initPattern(color, property, callback);
      return this;
    },

    /**
     * @private
     */
    _createCanvasElement: function() {
      var element = createCanvasElement();
      if (!element) {
        throw CANVAS_INIT_ERROR;
      }
      if (!element.style) {
        element.style = { };
      }
      if (typeof element.getContext === 'undefined') {
        throw CANVAS_INIT_ERROR;
      }
      return element;
    },

    /**
     * @private
     * @param {Object} [options] Options object
     */
    _initOptions: function (options) {
      var lowerCanvasEl = this.lowerCanvasEl;
      this._setOptions(options);

      this.width = this.width || parseInt(lowerCanvasEl.width, 10) || 0;
      this.height = this.height || parseInt(lowerCanvasEl.height, 10) || 0;

      if (!this.lowerCanvasEl.style) {
        return;
      }

      lowerCanvasEl.width = this.width;
      lowerCanvasEl.height = this.height;

      lowerCanvasEl.style.width = this.width + 'px';
      lowerCanvasEl.style.height = this.height + 'px';

      this.viewportTransform = this.viewportTransform.slice();
    },

    /**
     * Creates a bottom canvas
     * @private
     * @param {HTMLElement} [canvasEl]
     */
    _createLowerCanvas: function (canvasEl) {
      // canvasEl === 'HTMLCanvasElement' does not work on jsdom/node
      if (canvasEl && canvasEl.getContext) {
        this.lowerCanvasEl = canvasEl;
      }
      else {
        this.lowerCanvasEl = fabric.util.getById(canvasEl) || this._createCanvasElement();
      }

      fabric.util.addClass(this.lowerCanvasEl, 'lower-canvas');
      this._originalCanvasStyle = this.lowerCanvasEl.style;
      if (this.interactive) {
        this._applyCanvasStyle(this.lowerCanvasEl);
      }

      this.contextContainer = this.lowerCanvasEl.getContext('2d');
    },

    /**
     * Returns canvas width (in px)
     * @return {Number}
     */
    getWidth: function () {
      return this.width;
    },

    /**
     * Returns canvas height (in px)
     * @return {Number}
     */
    getHeight: function () {
      return this.height;
    },

    /**
     * Sets width of this canvas instance
     * @param {Number|String} value                         Value to set width to
     * @param {Object}        [options]                     Options object
     * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
     * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setWidth: function (value, options) {
      return this.setDimensions({ width: value }, options);
    },

    /**
     * Sets height of this canvas instance
     * @param {Number|String} value                         Value to set height to
     * @param {Object}        [options]                     Options object
     * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
     * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setHeight: function (value, options) {
      return this.setDimensions({ height: value }, options);
    },

    /**
     * Sets dimensions (width, height) of this canvas instance. when options.cssOnly flag active you should also supply the unit of measure (px/%/em)
     * @param {Object}        dimensions                    Object with width/height properties
     * @param {Number|String} [dimensions.width]            Width of canvas element
     * @param {Number|String} [dimensions.height]           Height of canvas element
     * @param {Object}        [options]                     Options object
     * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
     * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    setDimensions: function (dimensions, options) {
      var cssValue;

      options = options || {};

      for (var prop in dimensions) {
        cssValue = dimensions[prop];

        if (!options.cssOnly) {
          this._setBackstoreDimension(prop, dimensions[prop]);
          cssValue += 'px';
          this.hasLostContext = true;
        }

        if (!options.backstoreOnly) {
          this._setCssDimension(prop, cssValue);
        }
      }
      if (this._isCurrentlyDrawing) {
        this.freeDrawingBrush && this.freeDrawingBrush._setBrushStyles(this.contextTop);
      }
      this._initRetinaScaling();
      this.calcOffset();

      if (!options.cssOnly) {
        this.requestRenderAll();
      }

      return this;
    },

    /**
     * Helper for setting width/height
     * @private
     * @param {String} prop property (width|height)
     * @param {Number} value value to set property to
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    _setBackstoreDimension: function (prop, value) {
      this.lowerCanvasEl[prop] = value;

      if (this.upperCanvasEl) {
        this.upperCanvasEl[prop] = value;
      }

      if (this.cacheCanvasEl) {
        this.cacheCanvasEl[prop] = value;
      }

      this[prop] = value;

      return this;
    },

    /**
     * Helper for setting css width/height
     * @private
     * @param {String} prop property (width|height)
     * @param {String} value value to set property to
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    _setCssDimension: function (prop, value) {
      this.lowerCanvasEl.style[prop] = value;

      if (this.upperCanvasEl) {
        this.upperCanvasEl.style[prop] = value;
      }

      if (this.wrapperEl) {
        this.wrapperEl.style[prop] = value;
      }

      return this;
    },

    /**
     * Returns canvas zoom level
     * @return {Number}
     */
    getZoom: function () {
      return this.viewportTransform[0];
    },

    /**
     * Sets viewport transformation of this canvas instance
     * @param {Array} vpt a Canvas 2D API transform matrix
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setViewportTransform: function (vpt) {
      var activeObject = this._activeObject,
          backgroundObject = this.backgroundImage,
          overlayObject = this.overlayImage,
          object, i, len;
      this.viewportTransform = vpt;
      for (i = 0, len = this._objects.length; i < len; i++) {
        object = this._objects[i];
        object.group || object.setCoords(true);
      }
      if (activeObject) {
        activeObject.setCoords();
      }
      if (backgroundObject) {
        backgroundObject.setCoords(true);
      }
      if (overlayObject) {
        overlayObject.setCoords(true);
      }
      this.calcViewportBoundaries();
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Sets zoom level of this canvas instance, the zoom centered around point
     * meaning that following zoom to point with the same point will have the visual
     * effect of the zoom originating from that point. The point won't move.
     * It has nothing to do with canvas center or visual center of the viewport.
     * @param {fabric.Point} point to zoom with respect to
     * @param {Number} value to set zoom to, less than 1 zooms out
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    zoomToPoint: function (point, value) {
      // TODO: just change the scale, preserve other transformations
      var before = point, vpt = this.viewportTransform.slice(0);
      point = transformPoint(point, invertTransform(this.viewportTransform));
      vpt[0] = value;
      vpt[3] = value;
      var after = transformPoint(point, vpt);
      vpt[4] += before.x - after.x;
      vpt[5] += before.y - after.y;
      return this.setViewportTransform(vpt);
    },

    /**
     * Sets zoom level of this canvas instance
     * @param {Number} value to set zoom to, less than 1 zooms out
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setZoom: function (value) {
      this.zoomToPoint(new fabric.Point(0, 0), value);
      return this;
    },

    /**
     * Pan viewport so as to place point at top left corner of canvas
     * @param {fabric.Point} point to move to
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    absolutePan: function (point) {
      var vpt = this.viewportTransform.slice(0);
      vpt[4] = -point.x;
      vpt[5] = -point.y;
      return this.setViewportTransform(vpt);
    },

    /**
     * Pans viewpoint relatively
     * @param {fabric.Point} point (position vector) to move by
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    relativePan: function (point) {
      return this.absolutePan(new fabric.Point(
        -point.x - this.viewportTransform[4],
        -point.y - this.viewportTransform[5]
      ));
    },

    /**
     * Returns &lt;canvas> element corresponding to this instance
     * @return {HTMLCanvasElement}
     */
    getElement: function () {
      return this.lowerCanvasEl;
    },

    /**
     * @private
     * @param {fabric.Object} obj Object that was added
     */
    _onObjectAdded: function(obj) {
      this.stateful && obj.setupState();
      obj._set('canvas', this);
      obj.setCoords();
      this.fire('object:added', { target: obj });
      obj.fire('added');
    },

    /**
     * @private
     * @param {fabric.Object} obj Object that was removed
     */
    _onObjectRemoved: function(obj) {
      this.fire('object:removed', { target: obj });
      obj.fire('removed');
      delete obj.canvas;
    },

    /**
     * Clears specified context of canvas element
     * @param {CanvasRenderingContext2D} ctx Context to clear
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    clearContext: function(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      return this;
    },

    /**
     * Returns context of canvas where objects are drawn
     * @return {CanvasRenderingContext2D}
     */
    getContext: function () {
      return this.contextContainer;
    },

    /**
     * Clears all contexts (background, main, top) of an instance
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    clear: function () {
      this.remove.apply(this, this.getObjects());
      this.backgroundImage = null;
      this.overlayImage = null;
      this.backgroundColor = '';
      this.overlayColor = '';
      if (this._hasITextHandlers) {
        this.off('mouse:up', this._mouseUpITextHandler);
        this._iTextInstances = null;
        this._hasITextHandlers = false;
      }
      this.clearContext(this.contextContainer);
      this.fire('canvas:cleared');
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Renders the canvas
     * @return {fabric.Canvas} instance
     * @chainable
     */
    renderAll: function () {
      var canvasToDrawOn = this.contextContainer;
      this.renderCanvas(canvasToDrawOn, this._objects);
      return this;
    },

    /**
     * Function created to be instance bound at initialization
     * used in requestAnimationFrame rendering
     * Let the fabricJS call it. If you call it manually you could have more
     * animationFrame stacking on to of each other
     * for an imperative rendering, use canvas.renderAll
     * @private
     * @return {fabric.Canvas} instance
     * @chainable
     */
    renderAndReset: function() {
      this.isRendering = 0;
      this.renderAll();
    },

    /**
     * Append a renderAll request to next animation frame.
     * unless one is already in progress, in that case nothing is done
     * a boolean flag will avoid appending more.
     * @return {fabric.Canvas} instance
     * @chainable
     */
    requestRenderAll: function () {
      if (!this.isRendering) {
        this.isRendering = fabric.util.requestAnimFrame(this.renderAndResetBound);
      }
      return this;
    },

    /**
     * Calculate the position of the 4 corner of canvas with current viewportTransform.
     * helps to determinate when an object is in the current rendering viewport using
     * object absolute coordinates ( aCoords )
     * @return {Object} points.tl
     * @chainable
     */
    calcViewportBoundaries: function() {
      var points = { }, width = this.width, height = this.height,
          iVpt = invertTransform(this.viewportTransform);
      points.tl = transformPoint({ x: 0, y: 0 }, iVpt);
      points.br = transformPoint({ x: width, y: height }, iVpt);
      points.tr = new fabric.Point(points.br.x, points.tl.y);
      points.bl = new fabric.Point(points.tl.x, points.br.y);
      this.vptCoords = points;
      return points;
    },

    cancelRequestedRender: function() {
      if (this.isRendering) {
        fabric.util.cancelAnimFrame(this.isRendering);
        this.isRendering = 0;
      }
    },

    /**
     * Renders background, objects, overlay and controls.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array} objects to render
     * @return {fabric.Canvas} instance
     * @chainable
     */
    renderCanvas: function(ctx, objects) {
      var v = this.viewportTransform, path = this.clipPath;
      this.cancelRequestedRender();
      this.calcViewportBoundaries();
      this.clearContext(ctx);
      fabric.util.setImageSmoothing(ctx, this.imageSmoothingEnabled);
      this.fire('before:render', { ctx: ctx, });
      this._renderBackground(ctx);

      ctx.save();
      //apply viewport transform once for all rendering process
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      this._renderObjects(ctx, objects);
      ctx.restore();
      if (!this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
      }
      if (path) {
        path.canvas = this;
        // needed to setup a couple of variables
        path.shouldCache();
        path._transformDone = true;
        path.renderCache({ forClipping: true });
        this.drawClipPathOnCanvas(ctx);
      }
      this._renderOverlay(ctx);
      if (this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
      }
      this.fire('after:render', { ctx: ctx, });
    },

    /**
     * Paint the cached clipPath on the lowerCanvasEl
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawClipPathOnCanvas: function(ctx) {
      var v = this.viewportTransform, path = this.clipPath;
      ctx.save();
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      // DEBUG: uncomment this line, comment the following
      // ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = 'destination-in';
      path.transform(ctx);
      ctx.scale(1 / path.zoomX, 1 / path.zoomY);
      ctx.drawImage(path._cacheCanvas, -path.cacheTranslationX, -path.cacheTranslationY);
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Array} objects to render
     */
    _renderObjects: function(ctx, objects) {
      var i, len;
      for (i = 0, len = objects.length; i < len; ++i) {
        objects[i] && objects[i].render(ctx);
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {string} property 'background' or 'overlay'
     */
    _renderBackgroundOrOverlay: function(ctx, property) {
      var fill = this[property + 'Color'], object = this[property + 'Image'],
          v = this.viewportTransform, needsVpt = this[property + 'Vpt'];
      if (!fill && !object) {
        return;
      }
      if (fill) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fillStyle = fill.toLive
          ? fill.toLive(ctx, this)
          : fill;
        if (needsVpt) {
          ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        }
        ctx.transform(1, 0, 0, 1, fill.offsetX || 0, fill.offsetY || 0);
        var m = fill.gradientTransform || fill.patternTransform;
        m && ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        ctx.fill();
        ctx.restore();
      }
      if (object) {
        ctx.save();
        if (needsVpt) {
          ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        }
        object.render(ctx);
        ctx.restore();
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderBackground: function(ctx) {
      this._renderBackgroundOrOverlay(ctx, 'background');
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderOverlay: function(ctx) {
      this._renderBackgroundOrOverlay(ctx, 'overlay');
    },

    /**
     * Returns coordinates of a center of canvas.
     * Returned value is an object with top and left properties
     * @return {Object} object with "top" and "left" number values
     * @deprecated migrate to `getCenterPoint`
     */
    getCenter: function () {
      return {
        top: this.height / 2,
        left: this.width / 2
      };
    },

    /**
     * Returns coordinates of a center of canvas.
     * @return {fabric.Point} 
     */
    getCenterPoint: function () {
      return new fabric.Point(this.width / 2, this.height / 2);
    },

    /**
     * Centers object horizontally in the canvas
     * @param {fabric.Object} object Object to center horizontally
     * @return {fabric.Canvas} thisArg
     */
    centerObjectH: function (object) {
      return this._centerObject(object, new fabric.Point(this.getCenterPoint().x, object.getCenterPoint().y));
    },

    /**
     * Centers object vertically in the canvas
     * @param {fabric.Object} object Object to center vertically
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    centerObjectV: function (object) {
      return this._centerObject(object, new fabric.Point(object.getCenterPoint().x, this.getCenterPoint().y));
    },

    /**
     * Centers object vertically and horizontally in the canvas
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    centerObject: function(object) {
      var center = this.getCenterPoint();
      return this._centerObject(object, center);
    },

    /**
     * Centers object vertically and horizontally in the viewport
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    viewportCenterObject: function(object) {
      var vpCenter = this.getVpCenter();
      return this._centerObject(object, vpCenter);
    },

    /**
     * Centers object horizontally in the viewport, object.top is unchanged
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    viewportCenterObjectH: function(object) {
      var vpCenter = this.getVpCenter();
      this._centerObject(object, new fabric.Point(vpCenter.x, object.getCenterPoint().y));
      return this;
    },

    /**
     * Centers object Vertically in the viewport, object.top is unchanged
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    viewportCenterObjectV: function(object) {
      var vpCenter = this.getVpCenter();

      return this._centerObject(object, new fabric.Point(object.getCenterPoint().x, vpCenter.y));
    },

    /**
     * Calculate the point in canvas that correspond to the center of actual viewport.
     * @return {fabric.Point} vpCenter, viewport center
     * @chainable
     */
    getVpCenter: function() {
      var center = this.getCenterPoint(),
          iVpt = invertTransform(this.viewportTransform);
      return transformPoint(center, iVpt);
    },

    /**
     * @private
     * @param {fabric.Object} object Object to center
     * @param {fabric.Point} center Center point
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    _centerObject: function(object, center) {
      object.setPositionByOrigin(center, 'center', 'center');
      object.setCoords();
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Returns dataless JSON representation of canvas
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {String} json string
     */
    toDatalessJSON: function (propertiesToInclude) {
      return this.toDatalessObject(propertiesToInclude);
    },

    /**
     * Returns object representation of canvas
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function (propertiesToInclude) {
      return this._toObjectMethod('toObject', propertiesToInclude);
    },

    /**
     * Returns dataless object representation of canvas
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toDatalessObject: function (propertiesToInclude) {
      return this._toObjectMethod('toDatalessObject', propertiesToInclude);
    },

    /**
     * @private
     */
    _toObjectMethod: function (methodName, propertiesToInclude) {

      var clipPath = this.clipPath, data = {
        version: fabric.version,
        objects: this._toObjects(methodName, propertiesToInclude),
      };
      if (clipPath && !clipPath.excludeFromExport) {
        data.clipPath = this._toObject(this.clipPath, methodName, propertiesToInclude);
      }
      extend(data, this.__serializeBgOverlay(methodName, propertiesToInclude));

      fabric.util.populateWithProperties(this, data, propertiesToInclude);

      return data;
    },

    /**
     * @private
     */
    _toObjects: function(methodName, propertiesToInclude) {
      return this._objects.filter(function(object) {
        return !object.excludeFromExport;
      }).map(function(instance) {
        return this._toObject(instance, methodName, propertiesToInclude);
      }, this);
    },

    /**
     * @private
     */
    _toObject: function(instance, methodName, propertiesToInclude) {
      var originalValue;

      if (!this.includeDefaultValues) {
        originalValue = instance.includeDefaultValues;
        instance.includeDefaultValues = false;
      }

      var object = instance[methodName](propertiesToInclude);
      if (!this.includeDefaultValues) {
        instance.includeDefaultValues = originalValue;
      }
      return object;
    },

    /**
     * @private
     */
    __serializeBgOverlay: function(methodName, propertiesToInclude) {
      var data = {}, bgImage = this.backgroundImage, overlayImage = this.overlayImage,
          bgColor = this.backgroundColor, overlayColor = this.overlayColor;

      if (bgColor && bgColor.toObject) {
        if (!bgColor.excludeFromExport) {
          data.background = bgColor.toObject(propertiesToInclude);
        }
      }
      else if (bgColor) {
        data.background = bgColor;
      }

      if (overlayColor && overlayColor.toObject) {
        if (!overlayColor.excludeFromExport) {
          data.overlay = overlayColor.toObject(propertiesToInclude);
        }
      }
      else if (overlayColor) {
        data.overlay = overlayColor;
      }

      if (bgImage && !bgImage.excludeFromExport) {
        data.backgroundImage = this._toObject(bgImage, methodName, propertiesToInclude);
      }
      if (overlayImage && !overlayImage.excludeFromExport) {
        data.overlayImage = this._toObject(overlayImage, methodName, propertiesToInclude);
      }

      return data;
    },

    

    /**
     * Moves an object or the objects of a multiple selection
     * to the bottom of the stack of drawn objects
     * @param {fabric.Object} object Object to send to back
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    sendToBack: function (object) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, objs;
      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = objs.length; i--;) {
          obj = objs[i];
          removeFromArray(this._objects, obj);
          this._objects.unshift(obj);
        }
      }
      else {
        removeFromArray(this._objects, object);
        this._objects.unshift(object);
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Moves an object or the objects of a multiple selection
     * to the top of the stack of drawn objects
     * @param {fabric.Object} object Object to send
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    bringToFront: function (object) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, objs;
      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = 0; i < objs.length; i++) {
          obj = objs[i];
          removeFromArray(this._objects, obj);
          this._objects.push(obj);
        }
      }
      else {
        removeFromArray(this._objects, object);
        this._objects.push(object);
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Moves an object or a selection down in stack of drawn objects
     * An optional parameter, intersecting allows to move the object in behind
     * the first intersecting object. Where intersection is calculated with
     * bounding box. If no intersection is found, there will not be change in the
     * stack.
     * @param {fabric.Object} object Object to send
     * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    sendBackwards: function (object, intersecting) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, idx, newIdx, objs, objsMoved = 0;

      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = 0; i < objs.length; i++) {
          obj = objs[i];
          idx = this._objects.indexOf(obj);
          if (idx > 0 + objsMoved) {
            newIdx = idx - 1;
            removeFromArray(this._objects, obj);
            this._objects.splice(newIdx, 0, obj);
          }
          objsMoved++;
        }
      }
      else {
        idx = this._objects.indexOf(object);
        if (idx !== 0) {
          // if object is not on the bottom of stack
          newIdx = this._findNewLowerIndex(object, idx, intersecting);
          removeFromArray(this._objects, object);
          this._objects.splice(newIdx, 0, object);
        }
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * @private
     */
    _findNewLowerIndex: function(object, idx, intersecting) {
      var newIdx, i;

      if (intersecting) {
        newIdx = idx;

        // traverse down the stack looking for the nearest intersecting object
        for (i = idx - 1; i >= 0; --i) {

          var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
                               object.isContainedWithinObject(this._objects[i]) ||
                               this._objects[i].isContainedWithinObject(object);

          if (isIntersecting) {
            newIdx = i;
            break;
          }
        }
      }
      else {
        newIdx = idx - 1;
      }

      return newIdx;
    },

    /**
     * Moves an object or a selection up in stack of drawn objects
     * An optional parameter, intersecting allows to move the object in front
     * of the first intersecting object. Where intersection is calculated with
     * bounding box. If no intersection is found, there will not be change in the
     * stack.
     * @param {fabric.Object} object Object to send
     * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    bringForward: function (object, intersecting) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, idx, newIdx, objs, objsMoved = 0;

      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = objs.length; i--;) {
          obj = objs[i];
          idx = this._objects.indexOf(obj);
          if (idx < this._objects.length - 1 - objsMoved) {
            newIdx = idx + 1;
            removeFromArray(this._objects, obj);
            this._objects.splice(newIdx, 0, obj);
          }
          objsMoved++;
        }
      }
      else {
        idx = this._objects.indexOf(object);
        if (idx !== this._objects.length - 1) {
          // if object is not on top of stack (last item in an array)
          newIdx = this._findNewUpperIndex(object, idx, intersecting);
          removeFromArray(this._objects, object);
          this._objects.splice(newIdx, 0, object);
        }
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * @private
     */
    _findNewUpperIndex: function(object, idx, intersecting) {
      var newIdx, i, len;

      if (intersecting) {
        newIdx = idx;

        // traverse up the stack looking for the nearest intersecting object
        for (i = idx + 1, len = this._objects.length; i < len; ++i) {

          var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
                               object.isContainedWithinObject(this._objects[i]) ||
                               this._objects[i].isContainedWithinObject(object);

          if (isIntersecting) {
            newIdx = i;
            break;
          }
        }
      }
      else {
        newIdx = idx + 1;
      }

      return newIdx;
    },

    /**
     * Moves an object to specified level in stack of drawn objects
     * @param {fabric.Object} object Object to send
     * @param {Number} index Position to move to
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    moveTo: function (object, index) {
      removeFromArray(this._objects, object);
      this._objects.splice(index, 0, object);
      return this.renderOnAddRemove && this.requestRenderAll();
    },

    /**
     * Clears a canvas element and dispose objects
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    dispose: function () {
      // cancel eventually ongoing renders
      if (this.isRendering) {
        fabric.util.cancelAnimFrame(this.isRendering);
        this.isRendering = 0;
      }
      this.forEachObject(function(object) {
        object.dispose && object.dispose();
      });
      this._objects = [];
      if (this.backgroundImage && this.backgroundImage.dispose) {
        this.backgroundImage.dispose();
      }
      this.backgroundImage = null;
      if (this.overlayImage && this.overlayImage.dispose) {
        this.overlayImage.dispose();
      }
      this.overlayImage = null;
      this._iTextInstances = null;
      this.contextContainer = null;
      // restore canvas style
      this.lowerCanvasEl.classList.remove('lower-canvas');
      fabric.util.setStyle(this.lowerCanvasEl, this._originalCanvasStyle);
      delete this._originalCanvasStyle;
      // restore canvas size to original size in case retina scaling was applied
      this.lowerCanvasEl.setAttribute('width', this.width);
      this.lowerCanvasEl.setAttribute('height', this.height);
      fabric.util.cleanUpJsdomNode(this.lowerCanvasEl);
      this.lowerCanvasEl = undefined;
      return this;
    },

    /**
     * Returns a string representation of an instance
     * @return {String} string representation of an instance
     */
    toString: function () {
      return '#<fabric.Canvas (' + this.complexity() + '): ' +
               '{ objects: ' + this._objects.length + ' }>';
    }
  });

  extend(fabric.StaticCanvas.prototype, fabric.Observable);
  extend(fabric.StaticCanvas.prototype, fabric.Collection);
  extend(fabric.StaticCanvas.prototype, fabric.DataURLExporter);

  extend(fabric.StaticCanvas, /** @lends fabric.StaticCanvas */ {

    /**
     * @static
     * @type String
     * @default
     */
    EMPTY_JSON: '{"objects": [], "background": "white"}',

    /**
     * Provides a way to check support of some of the canvas methods
     * (either those of HTMLCanvasElement itself, or rendering context)
     *
     * @param {String} methodName Method to check support for;
     *                            Could be one of "setLineDash"
     * @return {Boolean | null} `true` if method is supported (or at least exists),
     *                          `null` if canvas element or context can not be initialized
     */
    supports: function (methodName) {
      var el = createCanvasElement();

      if (!el || !el.getContext) {
        return null;
      }

      var ctx = el.getContext('2d');
      if (!ctx) {
        return null;
      }

      switch (methodName) {

        case 'setLineDash':
          return typeof ctx.setLineDash !== 'undefined';

        default:
          return null;
      }
    }
  });

  /**
   * Returns Object representation of canvas
   * this alias is provided because if you call JSON.stringify on an instance,
   * the toJSON object will be invoked if it exists.
   * Having a toJSON method means you can do JSON.stringify(myCanvas)
   * @function
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} JSON compatible object
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#serialization}
   * @see {@link http://jsfiddle.net/fabricjs/pec86/|jsFiddle demo}
   * @example <caption>JSON without additional properties</caption>
   * var json = canvas.toJSON();
   * @example <caption>JSON with additional properties included</caption>
   * var json = canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY']);
   * @example <caption>JSON without default values</caption>
   * canvas.includeDefaultValues = false;
   * var json = canvas.toJSON();
   */
  fabric.StaticCanvas.prototype.toJSON = fabric.StaticCanvas.prototype.toObject;

  if (fabric.isLikelyNode) {
    fabric.StaticCanvas.prototype.createPNGStream = function() {
      var impl = getNodeCanvas(this.lowerCanvasEl);
      return impl && impl.createPNGStream();
    };
    fabric.StaticCanvas.prototype.createJPEGStream = function(opts) {
      var impl = getNodeCanvas(this.lowerCanvasEl);
      return impl && impl.createJPEGStream(opts);
    };
  }
})();
/**
 * BaseBrush class
 * @class fabric.BaseBrush
 * @see {@link http://fabricjs.com/freedrawing|Freedrawing demo}
 */
fabric.BaseBrush = fabric.util.createClass(/** @lends fabric.BaseBrush.prototype */ {

  /**
   * Color of a brush
   * @type String
   * @default
   */
  color: 'rgb(0, 0, 0)',

  /**
   * Width of a brush, has to be a Number, no string literals
   * @type Number
   * @default
   */
  width: 1,

  /**
   * Shadow object representing shadow of this shape.
   * <b>Backwards incompatibility note:</b> This property replaces "shadowColor" (String), "shadowOffsetX" (Number),
   * "shadowOffsetY" (Number) and "shadowBlur" (Number) since v1.2.12
   * @type fabric.Shadow
   * @default
   */
  shadow: null,

  /**
   * Line endings style of a brush (one of "butt", "round", "square")
   * @type String
   * @default
   */
  strokeLineCap: 'round',

  /**
   * Corner style of a brush (one of "bevel", "round", "miter")
   * @type String
   * @default
   */
  strokeLineJoin: 'round',

  /**
   * Maximum miter length (used for strokeLineJoin = "miter") of a brush's
   * @type Number
   * @default
   */
  strokeMiterLimit:         10,

  /**
   * Stroke Dash Array.
   * @type Array
   * @default
   */
  strokeDashArray: null,

  /**
   * When `true`, the free drawing is limited to the whiteboard size. Default to false.
   * @type Boolean
   * @default false
  */

  limitedToCanvasSize: false,


  /**
   * Sets brush styles
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _setBrushStyles: function (ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = this.strokeLineCap;
    ctx.miterLimit = this.strokeMiterLimit;
    ctx.lineJoin = this.strokeLineJoin;
    ctx.setLineDash(this.strokeDashArray || []);
  },

  /**
   * Sets the transformation on given context
   * @param {RenderingContext2d} ctx context to render on
   * @private
   */
  _saveAndTransform: function(ctx) {
    var v = this.canvas.viewportTransform;
    ctx.save();
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
  },

  /**
   * Sets brush shadow styles
   * @private
   */
  _setShadow: function() {
    if (!this.shadow) {
      return;
    }

    var canvas = this.canvas,
        shadow = this.shadow,
        ctx = canvas.contextTop,
        zoom = canvas.getZoom();
    if (canvas && canvas._isRetinaScaling()) {
      zoom *= fabric.devicePixelRatio;
    }

    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur * zoom;
    ctx.shadowOffsetX = shadow.offsetX * zoom;
    ctx.shadowOffsetY = shadow.offsetY * zoom;
  },

  needsFullRender: function() {
    var color = new fabric.Color(this.color);
    return color.getAlpha() < 1 || !!this.shadow;
  },

  /**
   * Removes brush shadow styles
   * @private
   */
  _resetShadow: function() {
    var ctx = this.canvas.contextTop;

    ctx.shadowColor = '';
    ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
  },

  /**
   * Check is pointer is outside canvas boundaries
   * @param {Object} pointer
   * @private
  */
  _isOutSideCanvas: function(pointer) {
    return pointer.x < 0 || pointer.x > this.canvas.getWidth() || pointer.y < 0 || pointer.y > this.canvas.getHeight();
  }
});
(function() {
  /**
   * PencilBrush class
   * @class fabric.PencilBrush
   * @extends fabric.BaseBrush
   */
  fabric.PencilBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.PencilBrush.prototype */ {

    /**
     * Discard points that are less than `decimate` pixel distant from each other
     * @type Number
     * @default 0.4
     */
    decimate: 0.4,

    /**
     * Draws a straight line between last recorded point to current pointer
     * Used for `shift` functionality
     *
     * @type boolean
     * @default false
     */
    drawStraightLine: false,

    /**
     * The event modifier key that makes the brush draw a straight line.
     * If `null` or 'none' or any other string that is not a modifier key the feature is disabled.
     * @type {'altKey' | 'shiftKey' | 'ctrlKey' | 'none' | undefined | null}
     */
    straightLineKey: 'shiftKey',

    /**
     * Constructor
     * @param {fabric.Canvas} canvas
     * @return {fabric.PencilBrush} Instance of a pencil brush
     */
    initialize: function(canvas) {
      this.canvas = canvas;
      this._points = [];
    },

    needsFullRender: function () {
      return this.callSuper('needsFullRender') || this._hasStraightLine;
    },

    /**
     * Invoked inside on mouse down and mouse move
     * @param {Object} pointer
     */
    _drawSegment: function (ctx, p1, p2) {
      var midPoint = p1.midPointFrom(p2);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      return midPoint;
    },

    /**
     * Invoked on mouse down
     * @param {Object} pointer
     */
    onMouseDown: function(pointer, options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return;
      }
      this.drawStraightLine = options.e[this.straightLineKey];
      this._prepareForDrawing(pointer);
      // capture coordinates immediately
      // this allows to draw dots (when movement never occurs)
      this._captureDrawingPath(pointer);
      this._render();
    },

    /**
     * Invoked on mouse move
     * @param {Object} pointer
     */
    onMouseMove: function(pointer, options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return;
      }
      this.drawStraightLine = options.e[this.straightLineKey];
      if (this.limitedToCanvasSize === true && this._isOutSideCanvas(pointer)) {
        return;
      }
      if (this._captureDrawingPath(pointer) && this._points.length > 1) {
        if (this.needsFullRender()) {
          // redraw curve
          // clear top canvas
          this.canvas.clearContext(this.canvas.contextTop);
          this._render();
        }
        else {
          var points = this._points, length = points.length, ctx = this.canvas.contextTop;
          // draw the curve update
          this._saveAndTransform(ctx);
          if (this.oldEnd) {
            ctx.beginPath();
            ctx.moveTo(this.oldEnd.x, this.oldEnd.y);
          }
          this.oldEnd = this._drawSegment(ctx, points[length - 2], points[length - 1], true);
          ctx.stroke();
          ctx.restore();
        }
      }
    },

    /**
     * Invoked on mouse up
     */
    onMouseUp: function(options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return true;
      }
      this.drawStraightLine = false;
      this.oldEnd = undefined;
      this._finalizeAndAddPath();
      return false;
    },

    /**
     * @private
     * @param {Object} pointer Actual mouse position related to the canvas.
     */
    _prepareForDrawing: function(pointer) {

      var p = new fabric.Point(pointer.x, pointer.y);

      this._reset();
      this._addPoint(p);
      this.canvas.contextTop.moveTo(p.x, p.y);
    },

    /**
     * @private
     * @param {fabric.Point} point Point to be added to points array
     */
    _addPoint: function(point) {
      if (this._points.length > 1 && point.eq(this._points[this._points.length - 1])) {
        return false;
      }
      if (this.drawStraightLine && this._points.length > 1) {
        this._hasStraightLine = true;
        this._points.pop();
      }
      this._points.push(point);
      return true;
    },

    /**
     * Clear points array and set contextTop canvas style.
     * @private
     */
    _reset: function() {
      this._points = [];
      this._setBrushStyles(this.canvas.contextTop);
      this._setShadow();
      this._hasStraightLine = false;
    },

    /**
     * @private
     * @param {Object} pointer Actual mouse position related to the canvas.
     */
    _captureDrawingPath: function(pointer) {
      var pointerPoint = new fabric.Point(pointer.x, pointer.y);
      return this._addPoint(pointerPoint);
    },

    /**
     * Draw a smooth path on the topCanvas using quadraticCurveTo
     * @private
     * @param {CanvasRenderingContext2D} [ctx]
     */
    _render: function(ctx) {
      var i, len,
          p1 = this._points[0],
          p2 = this._points[1];
      ctx = ctx || this.canvas.contextTop;
      this._saveAndTransform(ctx);
      ctx.beginPath();
      //if we only have 2 points in the path and they are the same
      //it means that the user only clicked the canvas without moving the mouse
      //then we should be drawing a dot. A path isn't drawn between two identical dots
      //that's why we set them apart a bit
      if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
        var width = this.width / 1000;
        p1 = new fabric.Point(p1.x, p1.y);
        p2 = new fabric.Point(p2.x, p2.y);
        p1.x -= width;
        p2.x += width;
      }
      ctx.moveTo(p1.x, p1.y);

      for (i = 1, len = this._points.length; i < len; i++) {
        // we pick the point between pi + 1 & pi + 2 as the
        // end point and p1 as our control point.
        this._drawSegment(ctx, p1, p2);
        p1 = this._points[i];
        p2 = this._points[i + 1];
      }
      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.restore();
    },

    /**
     * Converts points to SVG path
     * @param {Array} points Array of points
     * @return {(string|number)[][]} SVG path commands
     */
    convertPointsToSVGPath: function (points) {
      var correction = this.width / 1000;
      return fabric.util.getSmoothPathFromPoints(points, correction);
    },

    /**
     * @private
     * @param {(string|number)[][]} pathData SVG path commands
     * @returns {boolean}
     */
    _isEmptySVGPath: function (pathData) {
      var pathString = fabric.util.joinPath(pathData);
      return pathString === 'M 0 0 Q 0 0 0 0 L 0 0';
    },

    /**
     * Creates fabric.Path object to add on canvas
     * @param {(string|number)[][]} pathData Path data
     * @return {fabric.Path} Path to add on canvas
     */
    createPath: function(pathData) {
      var path = new fabric.Path(pathData, {
        fill: null,
        stroke: this.color,
        strokeWidth: this.width,
        strokeLineCap: this.strokeLineCap,
        strokeMiterLimit: this.strokeMiterLimit,
        strokeLineJoin: this.strokeLineJoin,
        strokeDashArray: this.strokeDashArray,
      });
      if (this.shadow) {
        this.shadow.affectStroke = true;
        path.shadow = new fabric.Shadow(this.shadow);
      }

      return path;
    },

    /**
     * Decimate points array with the decimate value
     */
    decimatePoints: function(points, distance) {
      if (points.length <= 2) {
        return points;
      }
      var zoom = this.canvas.getZoom(), adjustedDistance = Math.pow(distance / zoom, 2),
          i, l = points.length - 1, lastPoint = points[0], newPoints = [lastPoint],
          cDistance;
      for (i = 1; i < l - 1; i++) {
        cDistance = Math.pow(lastPoint.x - points[i].x, 2) + Math.pow(lastPoint.y - points[i].y, 2);
        if (cDistance >= adjustedDistance) {
          lastPoint = points[i];
          newPoints.push(lastPoint);
        }
      }
      /**
       * Add the last point from the original line to the end of the array.
       * This ensures decimate doesn't delete the last point on the line, and ensures the line is > 1 point.
       */
      newPoints.push(points[l]);
      return newPoints;
    },

    /**
     * On mouseup after drawing the path on contextTop canvas
     * we use the points captured to create an new fabric path object
     * and add it to the fabric canvas.
     */
    _finalizeAndAddPath: function() {
      var ctx = this.canvas.contextTop;
      ctx.closePath();
      if (this.decimate) {
        this._points = this.decimatePoints(this._points, this.decimate);
      }
      var pathData = this.convertPointsToSVGPath(this._points);
      if (this._isEmptySVGPath(pathData)) {
        // do not create 0 width/height paths, as they are
        // rendered inconsistently across browsers
        // Firefox 4, for example, renders a dot,
        // whereas Chrome 10 renders nothing
        this.canvas.requestRenderAll();
        return;
      }

      var path = this.createPath(pathData);
      this.canvas.clearContext(this.canvas.contextTop);
      this.canvas.fire('before:path:created', { path: path });
      this.canvas.add(path);
      this.canvas.requestRenderAll();
      path.setCoords();
      this._resetShadow();


      // fire event 'path' created
      this.canvas.fire('path:created', { path: path });
    }
  });
})();
/**
 * CircleBrush class
 * @class fabric.CircleBrush
 */
fabric.CircleBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.CircleBrush.prototype */ {

  /**
   * Width of a brush
   * @type Number
   * @default
   */
  width: 10,

  /**
   * Constructor
   * @param {fabric.Canvas} canvas
   * @return {fabric.CircleBrush} Instance of a circle brush
   */
  initialize: function(canvas) {
    this.canvas = canvas;
    this.points = [];
  },

  /**
   * Invoked inside on mouse down and mouse move
   * @param {Object} pointer
   */
  drawDot: function(pointer) {
    var point = this.addPoint(pointer),
        ctx = this.canvas.contextTop;
    this._saveAndTransform(ctx);
    this.dot(ctx, point);
    ctx.restore();
  },

  dot: function(ctx, point) {
    ctx.fillStyle = point.fill;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },

  /**
   * Invoked on mouse down
   */
  onMouseDown: function(pointer) {
    this.points.length = 0;
    this.canvas.clearContext(this.canvas.contextTop);
    this._setShadow();
    this.drawDot(pointer);
  },

  /**
   * Render the full state of the brush
   * @private
   */
  _render: function() {
    var ctx  = this.canvas.contextTop, i, len,
        points = this.points;
    this._saveAndTransform(ctx);
    for (i = 0, len = points.length; i < len; i++) {
      this.dot(ctx, points[i]);
    }
    ctx.restore();
  },

  /**
   * Invoked on mouse move
   * @param {Object} pointer
   */
  onMouseMove: function(pointer) {
    if (this.limitedToCanvasSize === true && this._isOutSideCanvas(pointer)) {
      return;
    }
    if (this.needsFullRender()) {
      this.canvas.clearContext(this.canvas.contextTop);
      this.addPoint(pointer);
      this._render();
    }
    else {
      this.drawDot(pointer);
    }
  },

  /**
   * Invoked on mouse up
   */
  onMouseUp: function() {
    var originalRenderOnAddRemove = this.canvas.renderOnAddRemove, i, len;
    this.canvas.renderOnAddRemove = false;

    var circles = [];

    for (i = 0, len = this.points.length; i < len; i++) {
      var point = this.points[i],
          circle = new fabric.Circle({
            radius: point.radius,
            left: point.x,
            top: point.y,
            originX: 'center',
            originY: 'center',
            fill: point.fill
          });

      this.shadow && (circle.shadow = new fabric.Shadow(this.shadow));

      circles.push(circle);
    }
    var group = new fabric.Group(circles);
    group.canvas = this.canvas;

    this.canvas.fire('before:path:created', { path: group });
    this.canvas.add(group);
    this.canvas.fire('path:created', { path: group });

    this.canvas.clearContext(this.canvas.contextTop);
    this._resetShadow();
    this.canvas.renderOnAddRemove = originalRenderOnAddRemove;
    this.canvas.requestRenderAll();
  },

  /**
   * @param {Object} pointer
   * @return {fabric.Point} Just added pointer point
   */
  addPoint: function(pointer) {
    var pointerPoint = new fabric.Point(pointer.x, pointer.y),

        circleRadius = fabric.util.getRandomInt(
          Math.max(0, this.width - 20), this.width + 20) / 2,

        circleColor = new fabric.Color(this.color)
          .setAlpha(fabric.util.getRandomInt(0, 100) / 100)
          .toRgba();

    pointerPoint.radius = circleRadius;
    pointerPoint.fill = circleColor;

    this.points.push(pointerPoint);

    return pointerPoint;
  }
});
/**
 * SprayBrush class
 * @class fabric.SprayBrush
 */
fabric.SprayBrush = fabric.util.createClass( fabric.BaseBrush, /** @lends fabric.SprayBrush.prototype */ {

  /**
   * Width of a spray
   * @type Number
   * @default
   */
  width:              10,

  /**
   * Density of a spray (number of dots per chunk)
   * @type Number
   * @default
   */
  density:            20,

  /**
   * Width of spray dots
   * @type Number
   * @default
   */
  dotWidth:           1,

  /**
   * Width variance of spray dots
   * @type Number
   * @default
   */
  dotWidthVariance:   1,

  /**
   * Whether opacity of a dot should be random
   * @type Boolean
   * @default
   */
  randomOpacity:        false,

  /**
   * Whether overlapping dots (rectangles) should be removed (for performance reasons)
   * @type Boolean
   * @default
   */
  optimizeOverlapping:  true,

  /**
   * Constructor
   * @param {fabric.Canvas} canvas
   * @return {fabric.SprayBrush} Instance of a spray brush
   */
  initialize: function(canvas) {
    this.canvas = canvas;
    this.sprayChunks = [];
  },

  /**
   * Invoked on mouse down
   * @param {Object} pointer
   */
  onMouseDown: function(pointer) {
    this.sprayChunks.length = 0;
    this.canvas.clearContext(this.canvas.contextTop);
    this._setShadow();

    this.addSprayChunk(pointer);
    this.render(this.sprayChunkPoints);
  },

  /**
   * Invoked on mouse move
   * @param {Object} pointer
   */
  onMouseMove: function(pointer) {
    if (this.limitedToCanvasSize === true && this._isOutSideCanvas(pointer)) {
      return;
    }
    this.addSprayChunk(pointer);
    this.render(this.sprayChunkPoints);
  },

  /**
   * Invoked on mouse up
   */
  onMouseUp: function() {
    var originalRenderOnAddRemove = this.canvas.renderOnAddRemove;
    this.canvas.renderOnAddRemove = false;

    var rects = [];

    for (var i = 0, ilen = this.sprayChunks.length; i < ilen; i++) {
      var sprayChunk = this.sprayChunks[i];

      for (var j = 0, jlen = sprayChunk.length; j < jlen; j++) {

        var rect = new fabric.Rect({
          width: sprayChunk[j].width,
          height: sprayChunk[j].width,
          left: sprayChunk[j].x + 1,
          top: sprayChunk[j].y + 1,
          originX: 'center',
          originY: 'center',
          fill: this.color
        });
        rects.push(rect);
      }
    }

    if (this.optimizeOverlapping) {
      rects = this._getOptimizedRects(rects);
    }

    var group = new fabric.Group(rects);
    this.shadow && group.set('shadow', new fabric.Shadow(this.shadow));
    this.canvas.fire('before:path:created', { path: group });
    this.canvas.add(group);
    this.canvas.fire('path:created', { path: group });

    this.canvas.clearContext(this.canvas.contextTop);
    this._resetShadow();
    this.canvas.renderOnAddRemove = originalRenderOnAddRemove;
    this.canvas.requestRenderAll();
  },

  /**
   * @private
   * @param {Array} rects
   */
  _getOptimizedRects: function(rects) {

    // avoid creating duplicate rects at the same coordinates
    var uniqueRects = { }, key, i, len;

    for (i = 0, len = rects.length; i < len; i++) {
      key = rects[i].left + '' + rects[i].top;
      if (!uniqueRects[key]) {
        uniqueRects[key] = rects[i];
      }
    }
    var uniqueRectsArray = [];
    for (key in uniqueRects) {
      uniqueRectsArray.push(uniqueRects[key]);
    }

    return uniqueRectsArray;
  },

  /**
   * Render new chunk of spray brush
   */
  render: function(sprayChunk) {
    var ctx = this.canvas.contextTop, i, len;
    ctx.fillStyle = this.color;

    this._saveAndTransform(ctx);

    for (i = 0, len = sprayChunk.length; i < len; i++) {
      var point = sprayChunk[i];
      if (typeof point.opacity !== 'undefined') {
        ctx.globalAlpha = point.opacity;
      }
      ctx.fillRect(point.x, point.y, point.width, point.width);
    }
    ctx.restore();
  },

  /**
   * Render all spray chunks
   */
  _render: function() {
    var ctx = this.canvas.contextTop, i, ilen;
    ctx.fillStyle = this.color;

    this._saveAndTransform(ctx);

    for (i = 0, ilen = this.sprayChunks.length; i < ilen; i++) {
      this.render(this.sprayChunks[i]);
    }
    ctx.restore();
  },

  /**
   * @param {Object} pointer
   */
  addSprayChunk: function(pointer) {
    this.sprayChunkPoints = [];

    var x, y, width, radius = this.width / 2, i;

    for (i = 0; i < this.density; i++) {

      x = fabric.util.getRandomInt(pointer.x - radius, pointer.x + radius);
      y = fabric.util.getRandomInt(pointer.y - radius, pointer.y + radius);

      if (this.dotWidthVariance) {
        width = fabric.util.getRandomInt(
          // bottom clamp width to 1
          Math.max(1, this.dotWidth - this.dotWidthVariance),
          this.dotWidth + this.dotWidthVariance);
      }
      else {
        width = this.dotWidth;
      }

      var point = new fabric.Point(x, y);
      point.width = width;

      if (this.randomOpacity) {
        point.opacity = fabric.util.getRandomInt(0, 100) / 100;
      }

      this.sprayChunkPoints.push(point);
    }

    this.sprayChunks.push(this.sprayChunkPoints);
  }
});
/**
 * PatternBrush class
 * @class fabric.PatternBrush
 * @extends fabric.BaseBrush
 */
fabric.PatternBrush = fabric.util.createClass(fabric.PencilBrush, /** @lends fabric.PatternBrush.prototype */ {

  getPatternSrc: function() {

    var dotWidth = 20,
        dotDistance = 5,
        patternCanvas = fabric.util.createCanvasElement(),
        patternCtx = patternCanvas.getContext('2d');

    patternCanvas.width = patternCanvas.height = dotWidth + dotDistance;

    patternCtx.fillStyle = this.color;
    patternCtx.beginPath();
    patternCtx.arc(dotWidth / 2, dotWidth / 2, dotWidth / 2, 0, Math.PI * 2, false);
    patternCtx.closePath();
    patternCtx.fill();

    return patternCanvas;
  },

  getPatternSrcFunction: function() {
    return String(this.getPatternSrc).replace('this.color', '"' + this.color + '"');
  },

  /**
   * Creates "pattern" instance property
   * @param {CanvasRenderingContext2D} ctx
   */
  getPattern: function(ctx) {
    return ctx.createPattern(this.source || this.getPatternSrc(), 'repeat');
  },

  /**
   * Sets brush styles
   * @param {CanvasRenderingContext2D} ctx
   */
  _setBrushStyles: function(ctx) {
    this.callSuper('_setBrushStyles', ctx);
    ctx.strokeStyle = this.getPattern(ctx);
  },

  /**
   * Creates path
   */
  createPath: function(pathData) {
    var path = this.callSuper('createPath', pathData),
        topLeft = path._getLeftTopCoords().scalarAdd(path.strokeWidth / 2);

    path.stroke = new fabric.Pattern({
      source: this.source || this.getPatternSrcFunction(),
      offsetX: -topLeft.x,
      offsetY: -topLeft.y
    });
    return path;
  }
});
(function() {

  var getPointer = fabric.util.getPointer,
      degreesToRadians = fabric.util.degreesToRadians,
      isTouchEvent = fabric.util.isTouchEvent;

  /**
   * Canvas class
   * @class fabric.Canvas
   * @extends fabric.StaticCanvas
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-1#canvas}
   * @see {@link fabric.Canvas#initialize} for constructor definition
   *
   * @fires object:modified at the end of a transform or any change when statefull is true
   * @fires object:rotating while an object is being rotated from the control
   * @fires object:scaling while an object is being scaled by controls
   * @fires object:moving while an object is being dragged
   * @fires object:skewing while an object is being skewed from the controls
   *
   * @fires before:transform before a transform is is started
   * @fires before:selection:cleared
   * @fires selection:cleared
   * @fires selection:updated
   * @fires selection:created
   *
   * @fires path:created after a drawing operation ends and the path is added
   * @fires mouse:down
   * @fires mouse:move
   * @fires mouse:up
   * @fires mouse:down:before  on mouse down, before the inner fabric logic runs
   * @fires mouse:move:before on mouse move, before the inner fabric logic runs
   * @fires mouse:up:before on mouse up, before the inner fabric logic runs
   * @fires mouse:over
   * @fires mouse:out
   * @fires mouse:dblclick whenever a native dbl click event fires on the canvas.
   *
   * @fires dragover
   * @fires dragenter
   * @fires dragleave
   * @fires drop:before before drop event. same native event. This is added to handle edge cases
   * @fires drop
   * @fires after:render at the end of the render process, receives the context in the callback
   * @fires before:render at start the render process, receives the context in the callback
   *
   */
  fabric.Canvas = fabric.util.createClass(fabric.StaticCanvas, /** @lends fabric.Canvas.prototype */ {

    /**
     * Constructor
     * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(el, options) {
      options || (options = { });
      this.renderAndResetBound = this.renderAndReset.bind(this);
      this.requestRenderAllBound = this.requestRenderAll.bind(this);
      this._initStatic(el, options);
      this._initInteractive();
      this._createCacheCanvas();
    },

    /**
     * When true, objects can be transformed by one side (unproportionally)
     * when dragged on the corners that normally would not do that.
     * @type Boolean
     * @default
     * @since fabric 4.0 // changed name and default value
     */
    uniformScaling:      true,

    /**
     * Indicates which key switches uniform scaling.
     * values: 'altKey', 'shiftKey', 'ctrlKey'.
     * If `null` or 'none' or any other string that is not a modifier key
     * feature is disabled.
     * totally wrong named. this sounds like `uniform scaling`
     * if Canvas.uniformScaling is true, pressing this will set it to false
     * and viceversa.
     * @since 1.6.2
     * @type String
     * @default
     */
    uniScaleKey:           'shiftKey',

    /**
     * When true, objects use center point as the origin of scale transformation.
     * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredScaling:        false,

    /**
     * When true, objects use center point as the origin of rotate transformation.
     * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredRotation:       false,

    /**
     * Indicates which key enable centered Transform
     * values: 'altKey', 'shiftKey', 'ctrlKey'.
     * If `null` or 'none' or any other string that is not a modifier key
     * feature is disabled feature disabled.
     * @since 1.6.2
     * @type String
     * @default
     */
    centeredKey:           'altKey',

    /**
     * Indicates which key enable alternate action on corner
     * values: 'altKey', 'shiftKey', 'ctrlKey'.
     * If `null` or 'none' or any other string that is not a modifier key
     * feature is disabled feature disabled.
     * @since 1.6.2
     * @type String
     * @default
     */
    altActionKey:           'shiftKey',

    /**
     * Indicates that canvas is interactive. This property should not be changed.
     * @type Boolean
     * @default
     */
    interactive:            true,

    /**
     * Indicates whether group selection should be enabled
     * @type Boolean
     * @default
     */
    selection:              true,

    /**
     * Indicates which key or keys enable multiple click selection
     * Pass value as a string or array of strings
     * values: 'altKey', 'shiftKey', 'ctrlKey'.
     * If `null` or empty or containing any other string that is not a modifier key
     * feature is disabled.
     * @since 1.6.2
     * @type String|Array
     * @default
     */
    selectionKey:           'shiftKey',

    /**
     * Indicates which key enable alternative selection
     * in case of target overlapping with active object
     * values: 'altKey', 'shiftKey', 'ctrlKey'.
     * For a series of reason that come from the general expectations on how
     * things should work, this feature works only for preserveObjectStacking true.
     * If `null` or 'none' or any other string that is not a modifier key
     * feature is disabled.
     * @since 1.6.5
     * @type null|String
     * @default
     */
    altSelectionKey:           null,

    /**
     * Color of selection
     * @type String
     * @default
     */
    selectionColor:         'rgba(100, 100, 255, 0.3)', // blue

    /**
     * Default dash array pattern
     * If not empty the selection border is dashed
     * @type Array
     */
    selectionDashArray:     [],

    /**
     * Color of the border of selection (usually slightly darker than color of selection itself)
     * @type String
     * @default
     */
    selectionBorderColor:   'rgba(255, 255, 255, 0.3)',

    /**
     * Width of a line used in object/group selection
     * @type Number
     * @default
     */
    selectionLineWidth:     1,

    /**
     * Select only shapes that are fully contained in the dragged selection rectangle.
     * @type Boolean
     * @default
     */
    selectionFullyContained: false,

    /**
     * Default cursor value used when hovering over an object on canvas
     * @type String
     * @default
     */
    hoverCursor:            'move',

    /**
     * Default cursor value used when moving an object on canvas
     * @type String
     * @default
     */
    moveCursor:             'move',

    /**
     * Default cursor value used for the entire canvas
     * @type String
     * @default
     */
    defaultCursor:          'default',

    /**
     * Cursor value used during free drawing
     * @type String
     * @default
     */
    freeDrawingCursor:      'crosshair',

    /**
     * Cursor value used for disabled elements ( corners with disabled action )
     * @type String
     * @since 2.0.0
     * @default
     */
    notAllowedCursor:         'not-allowed',

    /**
     * Default element class that's given to wrapper (div) element of canvas
     * @type String
     * @default
     */
    containerClass:         'canvas-container',

    /**
     * When true, object detection happens on per-pixel basis rather than on per-bounding-box
     * @type Boolean
     * @default
     */
    perPixelTargetFind:     false,

    /**
     * Number of pixels around target pixel to tolerate (consider active) during object detection
     * @type Number
     * @default
     */
    targetFindTolerance:    0,

    /**
     * When true, target detection is skipped. Target detection will return always undefined.
     * click selection won't work anymore, events will fire with no targets.
     * if something is selected before setting it to true, it will be deselected at the first click.
     * area selection will still work. check the `selection` property too.
     * if you deactivate both, you should look into staticCanvas.
     * @type Boolean
     * @default
     */
    skipTargetFind:         false,

    /**
     * When true, mouse events on canvas (mousedown/mousemove/mouseup) result in free drawing.
     * After mousedown, mousemove creates a shape,
     * and then mouseup finalizes it and adds an instance of `fabric.Path` onto canvas.
     * @tutorial {@link http://fabricjs.com/fabric-intro-part-4#free_drawing}
     * @type Boolean
     * @default
     */
    isDrawingMode:          false,

    /**
     * Indicates whether objects should remain in current stack position when selected.
     * When false objects are brought to top and rendered as part of the selection group
     * @type Boolean
     * @default
     */
    preserveObjectStacking: false,

    /**
     * Indicates the angle that an object will lock to while rotating.
     * @type Number
     * @since 1.6.7
     * @default
     */
    snapAngle: 0,

    /**
     * Indicates the distance from the snapAngle the rotation will lock to the snapAngle.
     * When `null`, the snapThreshold will default to the snapAngle.
     * @type null|Number
     * @since 1.6.7
     * @default
     */
    snapThreshold: null,

    /**
     * Indicates if the right click on canvas can output the context menu or not
     * @type Boolean
     * @since 1.6.5
     * @default
     */
    stopContextMenu: false,

    /**
     * Indicates if the canvas can fire right click events
     * @type Boolean
     * @since 1.6.5
     * @default
     */
    fireRightClick: false,

    /**
     * Indicates if the canvas can fire middle click events
     * @type Boolean
     * @since 1.7.8
     * @default
     */
    fireMiddleClick: false,

    /**
     * Keep track of the subTargets for Mouse Events
     * @type fabric.Object[]
     */
    targets: [],

    /**
     * When the option is enabled, PointerEvent is used instead of MouseEvent.
     * @type Boolean
     * @default
     */
    enablePointerEvents: false,

    /**
     * Keep track of the hovered target
     * @type fabric.Object
     * @private
     */
    _hoveredTarget: null,

    /**
     * hold the list of nested targets hovered
     * @type fabric.Object[]
     * @private
     */
    _hoveredTargets: [],

    /**
     * @private
     */
    _initInteractive: function() {
      this._currentTransform = null;
      this._groupSelector = null;
      this._initWrapperElement();
      this._createUpperCanvas();
      this._initEventListeners();

      this._initRetinaScaling();

      this.freeDrawingBrush = fabric.PencilBrush && new fabric.PencilBrush(this);

      this.calcOffset();
    },

    /**
     * Divides objects in two groups, one to render immediately
     * and one to render as activeGroup.
     * @return {Array} objects to render immediately and pushes the other in the activeGroup.
     */
    _chooseObjectsToRender: function() {
      var activeObjects = this.getActiveObjects(),
          object, objsToRender, activeGroupObjects;

      if (activeObjects.length > 0 && !this.preserveObjectStacking) {
        objsToRender = [];
        activeGroupObjects = [];
        for (var i = 0, length = this._objects.length; i < length; i++) {
          object = this._objects[i];
          if (activeObjects.indexOf(object) === -1 ) {
            objsToRender.push(object);
          }
          else {
            activeGroupObjects.push(object);
          }
        }
        if (activeObjects.length > 1) {
          this._activeObject._objects = activeGroupObjects;
        }
        objsToRender.push.apply(objsToRender, activeGroupObjects);
      }
      else {
        objsToRender = this._objects;
      }
      return objsToRender;
    },

    /**
     * Renders both the top canvas and the secondary container canvas.
     * @return {fabric.Canvas} instance
     * @chainable
     */
    renderAll: function () {
      if (this.contextTopDirty && !this._groupSelector && !this.isDrawingMode) {
        this.clearContext(this.contextTop);
        this.contextTopDirty = false;
      }
      if (this.hasLostContext) {
        this.renderTopLayer(this.contextTop);
        this.hasLostContext = false;
      }
      var canvasToDrawOn = this.contextContainer;
      this.renderCanvas(canvasToDrawOn, this._chooseObjectsToRender());
      return this;
    },

    renderTopLayer: function(ctx) {
      ctx.save();
      if (this.isDrawingMode && this._isCurrentlyDrawing) {
        this.freeDrawingBrush && this.freeDrawingBrush._render();
        this.contextTopDirty = true;
      }
      // we render the top context - last object
      if (this.selection && this._groupSelector) {
        this._drawSelection(ctx);
        this.contextTopDirty = true;
      }
      ctx.restore();
    },

    /**
     * Method to render only the top canvas.
     * Also used to render the group selection box.
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    renderTop: function () {
      var ctx = this.contextTop;
      this.clearContext(ctx);
      this.renderTopLayer(ctx);
      this.fire('after:render');
      return this;
    },

    /**
     * @private
     */
    _normalizePointer: function (object, pointer) {
      var m = object.calcTransformMatrix(),
          invertedM = fabric.util.invertTransform(m),
          vptPointer = this.restorePointerVpt(pointer);
      return fabric.util.transformPoint(vptPointer, invertedM);
    },

    /**
     * Returns true if object is transparent at a certain location
     * @param {fabric.Object} target Object to check
     * @param {Number} x Left coordinate
     * @param {Number} y Top coordinate
     * @return {Boolean}
     */
    isTargetTransparent: function (target, x, y) {
      // in case the target is the activeObject, we cannot execute this optimization
      // because we need to draw controls too.
      if (target.shouldCache() && target._cacheCanvas && target !== this._activeObject) {
        var normalizedPointer = this._normalizePointer(target, {x: x, y: y}),
            targetRelativeX = Math.max(target.cacheTranslationX + (normalizedPointer.x * target.zoomX), 0),
            targetRelativeY = Math.max(target.cacheTranslationY + (normalizedPointer.y * target.zoomY), 0);

        var isTransparent = fabric.util.isTransparent(
          target._cacheContext, Math.round(targetRelativeX), Math.round(targetRelativeY), this.targetFindTolerance);

        return isTransparent;
      }

      var ctx = this.contextCache,
          originalColor = target.selectionBackgroundColor, v = this.viewportTransform;

      target.selectionBackgroundColor = '';

      this.clearContext(ctx);

      ctx.save();
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      target.render(ctx);
      ctx.restore();

      target.selectionBackgroundColor = originalColor;

      var isTransparent = fabric.util.isTransparent(
        ctx, x, y, this.targetFindTolerance);

      return isTransparent;
    },

    /**
     * takes an event and determines if selection key has been pressed
     * @private
     * @param {Event} e Event object
     */
    _isSelectionKeyPressed: function(e) {
      var selectionKeyPressed = false;

      if (Array.isArray(this.selectionKey)) {
        selectionKeyPressed = !!this.selectionKey.find(function(key) { return e[key] === true; });
      }
      else {
        selectionKeyPressed = e[this.selectionKey];
      }

      return selectionKeyPressed;
    },

    /**
     * @private
     * @param {Event} e Event object
     * @param {fabric.Object} target
     */
    _shouldClearSelection: function (e, target) {
      var activeObjects = this.getActiveObjects(),
          activeObject = this._activeObject;

      return (
        !target
        ||
        (target &&
          activeObject &&
          activeObjects.length > 1 &&
          activeObjects.indexOf(target) === -1 &&
          activeObject !== target &&
          !this._isSelectionKeyPressed(e))
        ||
        (target && !target.evented)
        ||
        (target &&
          !target.selectable &&
          activeObject &&
          activeObject !== target)
      );
    },

    /**
     * centeredScaling from object can't override centeredScaling from canvas.
     * this should be fixed, since object setting should take precedence over canvas.
     * also this should be something that will be migrated in the control properties.
     * as ability to define the origin of the transformation that the control provide.
     * @private
     * @param {fabric.Object} target
     * @param {String} action
     * @param {Boolean} altKey
     */
    _shouldCenterTransform: function (target, action, altKey) {
      if (!target) {
        return;
      }

      var centerTransform;

      if (action === 'scale' || action === 'scaleX' || action === 'scaleY' || action === 'resizing') {
        centerTransform = this.centeredScaling || target.centeredScaling;
      }
      else if (action === 'rotate') {
        centerTransform = this.centeredRotation || target.centeredRotation;
      }

      return centerTransform ? !altKey : altKey;
    },

    /**
     * should disappear before release 4.0
     * @private
     */
    _getOriginFromCorner: function(target, corner) {
      var origin = {
        x: target.originX,
        y: target.originY
      };

      if (corner === 'ml' || corner === 'tl' || corner === 'bl') {
        origin.x = 'right';
      }
      else if (corner === 'mr' || corner === 'tr' || corner === 'br') {
        origin.x = 'left';
      }

      if (corner === 'tl' || corner === 'mt' || corner === 'tr') {
        origin.y = 'bottom';
      }
      else if (corner === 'bl' || corner === 'mb' || corner === 'br') {
        origin.y = 'top';
      }
      return origin;
    },

    /**
     * @private
     * @param {Boolean} alreadySelected true if target is already selected
     * @param {String} corner a string representing the corner ml, mr, tl ...
     * @param {Event} e Event object
     * @param {fabric.Object} [target] inserted back to help overriding. Unused
     */
    _getActionFromCorner: function(alreadySelected, corner, e, target) {
      if (!corner || !alreadySelected) {
        return 'drag';
      }
      var control = target.controls[corner];
      return control.getActionName(e, control, target);
    },

    /**
     * @private
     * @param {Event} e Event object
     * @param {fabric.Object} target
     */
    _setupCurrentTransform: function (e, target, alreadySelected) {
      if (!target) {
        return;
      }

      var pointer = this.getPointer(e), corner = target.__corner,
          control = target.controls[corner],
          actionHandler = (alreadySelected && corner) ?
            control.getActionHandler(e, target, control) : fabric.controlsUtils.dragHandler,
          action = this._getActionFromCorner(alreadySelected, corner, e, target),
          origin = this._getOriginFromCorner(target, corner),
          altKey = e[this.centeredKey],
          transform = {
            target: target,
            action: action,
            actionHandler: actionHandler,
            corner: corner,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            skewX: target.skewX,
            skewY: target.skewY,
            // used by transation
            offsetX: pointer.x - target.left,
            offsetY: pointer.y - target.top,
            originX: origin.x,
            originY: origin.y,
            ex: pointer.x,
            ey: pointer.y,
            lastX: pointer.x,
            lastY: pointer.y,
            // unsure they are useful anymore.
            // left: target.left,
            // top: target.top,
            theta: degreesToRadians(target.angle),
            // end of unsure
            width: target.width * target.scaleX,
            shiftKey: e.shiftKey,
            altKey: altKey,
            original: fabric.util.saveObjectTransform(target),
          };

      if (this._shouldCenterTransform(target, action, altKey)) {
        transform.originX = 'center';
        transform.originY = 'center';
      }
      transform.original.originX = origin.x;
      transform.original.originY = origin.y;
      this._currentTransform = transform;
      this._beforeTransform(e);
    },

    /**
     * Set the cursor type of the canvas element
     * @param {String} value Cursor type of the canvas element.
     * @see http://www.w3.org/TR/css3-ui/#cursor
     */
    setCursor: function (value) {
      this.upperCanvasEl.style.cursor = value;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx to draw the selection on
     */
    _drawSelection: function (ctx) {
      var selector = this._groupSelector,
          viewportStart = new fabric.Point(selector.ex, selector.ey),
          start = fabric.util.transformPoint(viewportStart, this.viewportTransform),
          viewportExtent = new fabric.Point(selector.ex + selector.left, selector.ey + selector.top),
          extent = fabric.util.transformPoint(viewportExtent, this.viewportTransform),
          minX = Math.min(start.x, extent.x),
          minY = Math.min(start.y, extent.y),
          maxX = Math.max(start.x, extent.x),
          maxY = Math.max(start.y, extent.y),
          strokeOffset = this.selectionLineWidth / 2;

      if (this.selectionColor) {
        ctx.fillStyle = this.selectionColor;
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
      }

      if (!this.selectionLineWidth || !this.selectionBorderColor) {
        return;
      }
      ctx.lineWidth = this.selectionLineWidth;
      ctx.strokeStyle = this.selectionBorderColor;

      minX += strokeOffset;
      minY += strokeOffset;
      maxX -= strokeOffset;
      maxY -= strokeOffset;
      // selection border
      fabric.Object.prototype._setLineDash.call(this, ctx, this.selectionDashArray);
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    },

    /**
     * Method that determines what object we are clicking on
     * the skipGroup parameter is for internal use, is needed for shift+click action
     * 11/09/2018 TODO: would be cool if findTarget could discern between being a full target
     * or the outside part of the corner.
     * @param {Event} e mouse event
     * @param {Boolean} skipGroup when true, activeGroup is skipped and only objects are traversed through
     * @return {fabric.Object} the target found
     */
    findTarget: function (e, skipGroup) {
      if (this.skipTargetFind) {
        return;
      }

      var ignoreZoom = true,
          pointer = this.getPointer(e, ignoreZoom),
          activeObject = this._activeObject,
          aObjects = this.getActiveObjects(),
          activeTarget, activeTargetSubs,
          isTouch = isTouchEvent(e),
          shouldLookForActive = (aObjects.length > 1 && !skipGroup) || aObjects.length === 1;

      // first check current group (if one exists)
      // active group does not check sub targets like normal groups.
      // if active group just exits.
      this.targets = [];

      // if we hit the corner of an activeObject, let's return that.
      if (shouldLookForActive && activeObject._findTargetCorner(pointer, isTouch)) {
        return activeObject;
      }
      if (aObjects.length > 1 && !skipGroup && activeObject === this._searchPossibleTargets([activeObject], pointer)) {
        return activeObject;
      }
      if (aObjects.length === 1 &&
        activeObject === this._searchPossibleTargets([activeObject], pointer)) {
        if (!this.preserveObjectStacking) {
          return activeObject;
        }
        else {
          activeTarget = activeObject;
          activeTargetSubs = this.targets;
          this.targets = [];
        }
      }
      var target = this._searchPossibleTargets(this._objects, pointer);
      if (e[this.altSelectionKey] && target && activeTarget && target !== activeTarget) {
        target = activeTarget;
        this.targets = activeTargetSubs;
      }
      return target;
    },

    /**
     * Checks point is inside the object.
     * @param {Object} [pointer] x,y object of point coordinates we want to check.
     * @param {fabric.Object} obj Object to test against
     * @param {Object} [globalPointer] x,y object of point coordinates relative to canvas used to search per pixel target.
     * @return {Boolean} true if point is contained within an area of given object
     * @private
     */
    _checkTarget: function(pointer, obj, globalPointer) {
      if (obj &&
          obj.visible &&
          obj.evented &&
          // http://www.geog.ubc.ca/courses/klink/gis.notes/ncgia/u32.html
          // http://idav.ucdavis.edu/~okreylos/TAship/Spring2000/PointInPolygon.html
          obj.containsPoint(pointer)
      ) {
        if ((this.perPixelTargetFind || obj.perPixelTargetFind) && !obj.isEditing) {
          var isTransparent = this.isTargetTransparent(obj, globalPointer.x, globalPointer.y);
          if (!isTransparent) {
            return true;
          }
        }
        else {
          return true;
        }
      }
    },

    /**
     * Function used to search inside objects an object that contains pointer in bounding box or that contains pointerOnCanvas when painted
     * @param {Array} [objects] objects array to look into
     * @param {Object} [pointer] x,y object of point coordinates we want to check.
     * @return {fabric.Object} object that contains pointer
     * @private
     */
    _searchPossibleTargets: function(objects, pointer) {
      // Cache all targets where their bounding box contains point.
      var target, i = objects.length, subTarget;
      // Do not check for currently grouped objects, since we check the parent group itself.
      // until we call this function specifically to search inside the activeGroup
      while (i--) {
        var objToCheck = objects[i];
        var pointerToUse = objToCheck.group ?
          this._normalizePointer(objToCheck.group, pointer) : pointer;
        if (this._checkTarget(pointerToUse, objToCheck, pointer)) {
          target = objects[i];
          if (target.subTargetCheck && target instanceof fabric.Group) {
            subTarget = this._searchPossibleTargets(target._objects, pointer);
            subTarget && this.targets.push(subTarget);
          }
          break;
        }
      }
      return target;
    },

    /**
     * Returns pointer coordinates without the effect of the viewport
     * @param {Object} pointer with "x" and "y" number values
     * @return {Object} object with "x" and "y" number values
     */
    restorePointerVpt: function(pointer) {
      return fabric.util.transformPoint(
        pointer,
        fabric.util.invertTransform(this.viewportTransform)
      );
    },

    /**
     * Returns pointer coordinates relative to canvas.
     * Can return coordinates with or without viewportTransform.
     * ignoreZoom false gives back coordinates that represent
     * the point clicked on canvas element.
     * ignoreZoom true gives back coordinates after being processed
     * by the viewportTransform ( sort of coordinates of what is displayed
     * on the canvas where you are clicking.
     * ignoreZoom true = HTMLElement coordinates relative to top,left
     * ignoreZoom false, default = fabric space coordinates, the same used for shape position
     * To interact with your shapes top and left you want to use ignoreZoom true
     * most of the time, while ignoreZoom false will give you coordinates
     * compatible with the object.oCoords system.
     * of the time.
     * @param {Event} e
     * @param {Boolean} ignoreZoom
     * @return {Object} object with "x" and "y" number values
     */
    getPointer: function (e, ignoreZoom) {
      // return cached values if we are in the event processing chain
      if (this._absolutePointer && !ignoreZoom) {
        return this._absolutePointer;
      }
      if (this._pointer && ignoreZoom) {
        return this._pointer;
      }

      var pointer = getPointer(e),
          upperCanvasEl = this.upperCanvasEl,
          bounds = upperCanvasEl.getBoundingClientRect(),
          boundsWidth = bounds.width || 0,
          boundsHeight = bounds.height || 0,
          cssScale;

      if (!boundsWidth || !boundsHeight ) {
        if ('top' in bounds && 'bottom' in bounds) {
          boundsHeight = Math.abs( bounds.top - bounds.bottom );
        }
        if ('right' in bounds && 'left' in bounds) {
          boundsWidth = Math.abs( bounds.right - bounds.left );
        }
      }

      this.calcOffset();
      pointer.x = pointer.x - this._offset.left;
      pointer.y = pointer.y - this._offset.top;
      if (!ignoreZoom) {
        pointer = this.restorePointerVpt(pointer);
      }

      var retinaScaling = this.getRetinaScaling();
      if (retinaScaling !== 1) {
        pointer.x /= retinaScaling;
        pointer.y /= retinaScaling;
      }

      if (boundsWidth === 0 || boundsHeight === 0) {
        // If bounds are not available (i.e. not visible), do not apply scale.
        cssScale = { width: 1, height: 1 };
      }
      else {
        cssScale = {
          width: upperCanvasEl.width / boundsWidth,
          height: upperCanvasEl.height / boundsHeight
        };
      }

      return {
        x: pointer.x * cssScale.width,
        y: pointer.y * cssScale.height
      };
    },

    /**
     * @private
     * @throws {CANVAS_INIT_ERROR} If canvas can not be initialized
     */
    _createUpperCanvas: function () {
      var lowerCanvasClass = this.lowerCanvasEl.className.replace(/\s*lower-canvas\s*/, ''),
          lowerCanvasEl = this.lowerCanvasEl, upperCanvasEl = this.upperCanvasEl;

      // there is no need to create a new upperCanvas element if we have already one.
      if (upperCanvasEl) {
        upperCanvasEl.className = '';
      }
      else {
        upperCanvasEl = this._createCanvasElement();
        this.upperCanvasEl = upperCanvasEl;
      }
      fabric.util.addClass(upperCanvasEl, 'upper-canvas ' + lowerCanvasClass);

      this.wrapperEl.appendChild(upperCanvasEl);

      this._copyCanvasStyle(lowerCanvasEl, upperCanvasEl);
      this._applyCanvasStyle(upperCanvasEl);
      this.contextTop = upperCanvasEl.getContext('2d');
    },

    /**
     * Returns context of top canvas where interactions are drawn
     * @returns {CanvasRenderingContext2D}
     */
    getTopContext: function () {
      return this.contextTop;
    },

    /**
     * @private
     */
    _createCacheCanvas: function () {
      this.cacheCanvasEl = this._createCanvasElement();
      this.cacheCanvasEl.setAttribute('width', this.width);
      this.cacheCanvasEl.setAttribute('height', this.height);
      this.contextCache = this.cacheCanvasEl.getContext('2d');
    },

    /**
     * @private
     */
    _initWrapperElement: function () {
      this.wrapperEl = fabric.util.wrapElement(this.lowerCanvasEl, 'div', {
        'class': this.containerClass
      });
      fabric.util.setStyle(this.wrapperEl, {
        width: this.width + 'px',
        height: this.height + 'px',
        position: 'relative'
      });
      fabric.util.makeElementUnselectable(this.wrapperEl);
    },

    /**
     * @private
     * @param {HTMLElement} element canvas element to apply styles on
     */
    _applyCanvasStyle: function (element) {
      var width = this.width || element.width,
          height = this.height || element.height;

      fabric.util.setStyle(element, {
        position: 'absolute',
        width: width + 'px',
        height: height + 'px',
        left: 0,
        top: 0,
        'touch-action': this.allowTouchScrolling ? 'manipulation' : 'none',
        '-ms-touch-action': this.allowTouchScrolling ? 'manipulation' : 'none'
      });
      element.width = width;
      element.height = height;
      fabric.util.makeElementUnselectable(element);
    },

    /**
     * Copy the entire inline style from one element (fromEl) to another (toEl)
     * @private
     * @param {Element} fromEl Element style is copied from
     * @param {Element} toEl Element copied style is applied to
     */
    _copyCanvasStyle: function (fromEl, toEl) {
      toEl.style.cssText = fromEl.style.cssText;
    },

    /**
     * Returns context of canvas where object selection is drawn
     * @return {CanvasRenderingContext2D}
     */
    getSelectionContext: function() {
      return this.contextTop;
    },

    /**
     * Returns &lt;canvas> element on which object selection is drawn
     * @return {HTMLCanvasElement}
     */
    getSelectionElement: function () {
      return this.upperCanvasEl;
    },

    /**
     * Returns currently active object
     * @return {fabric.Object} active object
     */
    getActiveObject: function () {
      return this._activeObject;
    },

    /**
     * Returns an array with the current selected objects
     * @return {fabric.Object} active object
     */
    getActiveObjects: function () {
      var active = this._activeObject;
      if (active) {
        if (active.type === 'activeSelection' && active._objects) {
          return active._objects.slice(0);
        }
        else {
          return [active];
        }
      }
      return [];
    },

    /**
     * @private
     * @param {fabric.Object} obj Object that was removed
     */
    _onObjectRemoved: function(obj) {
      // removing active object should fire "selection:cleared" events
      if (obj === this._activeObject) {
        this.fire('before:selection:cleared', { target: obj });
        this._discardActiveObject();
        this.fire('selection:cleared', { target: obj });
        obj.fire('deselected');
      }
      if (obj === this._hoveredTarget){
        this._hoveredTarget = null;
        this._hoveredTargets = [];
      }
      this.callSuper('_onObjectRemoved', obj);
    },

    /**
     * @private
     * Compares the old activeObject with the current one and fires correct events
     * @param {fabric.Object} obj old activeObject
     */
    _fireSelectionEvents: function(oldObjects, e) {
      var somethingChanged = false, objects = this.getActiveObjects(),
          added = [], removed = [];
      oldObjects.forEach(function(oldObject) {
        if (objects.indexOf(oldObject) === -1) {
          somethingChanged = true;
          oldObject.fire('deselected', {
            e: e,
            target: oldObject
          });
          removed.push(oldObject);
        }
      });
      objects.forEach(function(object) {
        if (oldObjects.indexOf(object) === -1) {
          somethingChanged = true;
          object.fire('selected', {
            e: e,
            target: object
          });
          added.push(object);
        }
      });
      if (oldObjects.length > 0 && objects.length > 0) {
        somethingChanged && this.fire('selection:updated', {
          e: e,
          selected: added,
          deselected: removed,
        });
      }
      else if (objects.length > 0) {
        this.fire('selection:created', {
          e: e,
          selected: added,
        });
      }
      else if (oldObjects.length > 0) {
        this.fire('selection:cleared', {
          e: e,
          deselected: removed,
        });
      }
    },

    /**
     * Sets given object as the only active object on canvas
     * @param {fabric.Object} object Object to set as an active one
     * @param {Event} [e] Event (passed along when firing "object:selected")
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    setActiveObject: function (object, e) {
      var currentActives = this.getActiveObjects();
      this._setActiveObject(object, e);
      this._fireSelectionEvents(currentActives, e);
      return this;
    },

    /**
     * This is a private method for now.
     * This is supposed to be equivalent to setActiveObject but without firing
     * any event. There is commitment to have this stay this way.
     * This is the functional part of setActiveObject.
     * @private
     * @param {Object} object to set as active
     * @param {Event} [e] Event (passed along when firing "object:selected")
     * @return {Boolean} true if the selection happened
     */
    _setActiveObject: function(object, e) {
      if (this._activeObject === object) {
        return false;
      }
      if (!this._discardActiveObject(e, object)) {
        return false;
      }
      if (object.onSelect({ e: e })) {
        return false;
      }
      this._activeObject = object;
      return true;
    },

    /**
     * This is a private method for now.
     * This is supposed to be equivalent to discardActiveObject but without firing
     * any events. There is commitment to have this stay this way.
     * This is the functional part of discardActiveObject.
     * @param {Event} [e] Event (passed along when firing "object:deselected")
     * @param {Object} object to set as active
     * @return {Boolean} true if the selection happened
     * @private
     */
    _discardActiveObject: function(e, object) {
      var obj = this._activeObject;
      if (obj) {
        // onDeselect return TRUE to cancel selection;
        if (obj.onDeselect({ e: e, object: object })) {
          return false;
        }
        this._activeObject = null;
      }
      return true;
    },

    /**
     * Discards currently active object and fire events. If the function is called by fabric
     * as a consequence of a mouse event, the event is passed as a parameter and
     * sent to the fire function for the custom events. When used as a method the
     * e param does not have any application.
     * @param {event} e
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    discardActiveObject: function (e) {
      var currentActives = this.getActiveObjects(), activeObject = this.getActiveObject();
      if (currentActives.length) {
        this.fire('before:selection:cleared', { target: activeObject, e: e });
      }
      this._discardActiveObject(e);
      this._fireSelectionEvents(currentActives, e);
      return this;
    },

    /**
     * Clears a canvas element and removes all event listeners
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    dispose: function () {
      var wrapper = this.wrapperEl;
      this.removeListeners();
      wrapper.removeChild(this.upperCanvasEl);
      wrapper.removeChild(this.lowerCanvasEl);
      this.contextCache = null;
      this.contextTop = null;
      ['upperCanvasEl', 'cacheCanvasEl'].forEach((function(element) {
        fabric.util.cleanUpJsdomNode(this[element]);
        this[element] = undefined;
      }).bind(this));
      if (wrapper.parentNode) {
        wrapper.parentNode.replaceChild(this.lowerCanvasEl, this.wrapperEl);
      }
      delete this.wrapperEl;
      fabric.StaticCanvas.prototype.dispose.call(this);
      return this;
    },

    /**
     * Clears all contexts (background, main, top) of an instance
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    clear: function () {
      // this.discardActiveGroup();
      this.discardActiveObject();
      this.clearContext(this.contextTop);
      return this.callSuper('clear');
    },

    /**
     * Draws objects' controls (borders/controls)
     * @param {CanvasRenderingContext2D} ctx Context to render controls on
     */
    drawControls: function(ctx) {
      var activeObject = this._activeObject;

      if (activeObject) {
        activeObject._renderControls(ctx);
      }
    },

    /**
     * @private
     */
    _toObject: function(instance, methodName, propertiesToInclude) {
      //If the object is part of the current selection group, it should
      //be transformed appropriately
      //i.e. it should be serialised as it would appear if the selection group
      //were to be destroyed.
      var originalProperties = this._realizeGroupTransformOnObject(instance),
          object = this.callSuper('_toObject', instance, methodName, propertiesToInclude);
      //Undo the damage we did by changing all of its properties
      this._unwindGroupTransformOnObject(instance, originalProperties);
      return object;
    },

    /**
     * Realises an object's group transformation on it
     * @private
     * @param {fabric.Object} [instance] the object to transform (gets mutated)
     * @returns the original values of instance which were changed
     */
    _realizeGroupTransformOnObject: function(instance) {
      if (instance.group && instance.group.type === 'activeSelection' && this._activeObject === instance.group) {
        var layoutProps = ['angle', 'flipX', 'flipY', 'left', 'scaleX', 'scaleY', 'skewX', 'skewY', 'top'];
        //Copy all the positionally relevant properties across now
        var originalValues = {};
        layoutProps.forEach(function(prop) {
          originalValues[prop] = instance[prop];
        });
        fabric.util.addTransformToObject(instance, this._activeObject.calcOwnMatrix());
        return originalValues;
      }
      else {
        return null;
      }
    },

    /**
     * Restores the changed properties of instance
     * @private
     * @param {fabric.Object} [instance] the object to un-transform (gets mutated)
     * @param {Object} [originalValues] the original values of instance, as returned by _realizeGroupTransformOnObject
     */
    _unwindGroupTransformOnObject: function(instance, originalValues) {
      if (originalValues) {
        instance.set(originalValues);
      }
    },

    /**
     * @private
     */
    _setSVGObject: function(markup, instance, reviver) {
      //If the object is in a selection group, simulate what would happen to that
      //object when the group is deselected
      var originalProperties = this._realizeGroupTransformOnObject(instance);
      this.callSuper('_setSVGObject', markup, instance, reviver);
      this._unwindGroupTransformOnObject(instance, originalProperties);
    },

    setViewportTransform: function (vpt) {
      if (this.renderOnAddRemove && this._activeObject && this._activeObject.isEditing) {
        this._activeObject.clearContextTop();
      }
      fabric.StaticCanvas.prototype.setViewportTransform.call(this, vpt);
    }
  });

  // copying static properties manually to work around Opera's bug,
  // where "prototype" property is enumerable and overrides existing prototype
  for (var prop in fabric.StaticCanvas) {
    if (prop !== 'prototype') {
      fabric.Canvas[prop] = fabric.StaticCanvas[prop];
    }
  }
})();
(function() {

  var addListener = fabric.util.addListener,
      removeListener = fabric.util.removeListener,
      RIGHT_CLICK = 3, MIDDLE_CLICK = 2, LEFT_CLICK = 1,
      addEventOptions = { passive: false };

  function checkClick(e, value) {
    return e.button && (e.button === value - 1);
  }

  fabric.util.object.extend(fabric.Canvas.prototype, /** @lends fabric.Canvas.prototype */ {

    /**
     * Contains the id of the touch event that owns the fabric transform
     * @type Number
     * @private
     */
    mainTouchId: null,

    /**
     * Adds mouse listeners to canvas
     * @private
     */
    _initEventListeners: function () {
      // in case we initialized the class twice. This should not happen normally
      // but in some kind of applications where the canvas element may be changed
      // this is a workaround to having double listeners.
      this.removeListeners();
      this._bindEvents();
      this.addOrRemove(addListener, 'add');
    },

    /**
     * return an event prefix pointer or mouse.
     * @private
     */
    _getEventPrefix: function () {
      return this.enablePointerEvents ? 'pointer' : 'mouse';
    },

    addOrRemove: function(functor, eventjsFunctor) {
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      functor(fabric.window, 'resize', this._onResize);
      functor(canvasElement, eventTypePrefix + 'down', this._onMouseDown);
      functor(canvasElement, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      functor(canvasElement, eventTypePrefix + 'out', this._onMouseOut);
      functor(canvasElement, eventTypePrefix + 'enter', this._onMouseEnter);
      functor(canvasElement, 'wheel', this._onMouseWheel);
      functor(canvasElement, 'contextmenu', this._onContextMenu);
      functor(canvasElement, 'dblclick', this._onDoubleClick);
      functor(canvasElement, 'dragover', this._onDragOver);
      functor(canvasElement, 'dragenter', this._onDragEnter);
      functor(canvasElement, 'dragleave', this._onDragLeave);
      functor(canvasElement, 'drop', this._onDrop);
      if (!this.enablePointerEvents) {
        functor(canvasElement, 'touchstart', this._onTouchStart, addEventOptions);
      }
      if (typeof eventjs !== 'undefined' && eventjsFunctor in eventjs) {
        eventjs[eventjsFunctor](canvasElement, 'gesture', this._onGesture);
        eventjs[eventjsFunctor](canvasElement, 'drag', this._onDrag);
        eventjs[eventjsFunctor](canvasElement, 'orientation', this._onOrientationChange);
        eventjs[eventjsFunctor](canvasElement, 'shake', this._onShake);
        eventjs[eventjsFunctor](canvasElement, 'longpress', this._onLongPress);
      }
    },

    /**
     * Removes all event listeners
     */
    removeListeners: function() {
      this.addOrRemove(removeListener, 'remove');
      // if you dispose on a mouseDown, before mouse up, you need to clean document to...
      var eventTypePrefix = this._getEventPrefix();
      removeListener(fabric.document, eventTypePrefix + 'up', this._onMouseUp);
      removeListener(fabric.document, 'touchend', this._onTouchEnd, addEventOptions);
      removeListener(fabric.document, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      removeListener(fabric.document, 'touchmove', this._onMouseMove, addEventOptions);
    },

    /**
     * @private
     */
    _bindEvents: function() {
      if (this.eventsBound) {
        // for any reason we pass here twice we do not want to bind events twice.
        return;
      }
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onTouchStart = this._onTouchStart.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onGesture = this._onGesture.bind(this);
      this._onDrag = this._onDrag.bind(this);
      this._onShake = this._onShake.bind(this);
      this._onLongPress = this._onLongPress.bind(this);
      this._onOrientationChange = this._onOrientationChange.bind(this);
      this._onMouseWheel = this._onMouseWheel.bind(this);
      this._onMouseOut = this._onMouseOut.bind(this);
      this._onMouseEnter = this._onMouseEnter.bind(this);
      this._onContextMenu = this._onContextMenu.bind(this);
      this._onDoubleClick = this._onDoubleClick.bind(this);
      this._onDragOver = this._onDragOver.bind(this);
      this._onDragEnter = this._simpleEventHandler.bind(this, 'dragenter');
      this._onDragLeave = this._simpleEventHandler.bind(this, 'dragleave');
      this._onDrop = this._onDrop.bind(this);
      this.eventsBound = true;
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js gesture
     * @param {Event} [self] Inner Event object
     */
    _onGesture: function(e, self) {
      this.__onTransformGesture && this.__onTransformGesture(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js drag
     * @param {Event} [self] Inner Event object
     */
    _onDrag: function(e, self) {
      this.__onDrag && this.__onDrag(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on wheel event
     */
    _onMouseWheel: function(e) {
      this.__onMouseWheel(e);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onMouseOut: function(e) {
      var target = this._hoveredTarget;
      this.fire('mouse:out', { target: target, e: e });
      this._hoveredTarget = null;
      target && target.fire('mouseout', { e: e });

      var _this = this;
      this._hoveredTargets.forEach(function(_target){
        _this.fire('mouse:out', { target: target, e: e });
        _target && target.fire('mouseout', { e: e });
      });
      this._hoveredTargets = [];

      if (this._iTextInstances) {
        this._iTextInstances.forEach(function(obj) {
          if (obj.isEditing) {
            obj.hiddenTextarea.focus();
          }
        });
      }
    },

    /**
     * @private
     * @param {Event} e Event object fired on mouseenter
     */
    _onMouseEnter: function(e) {
      // This find target and consequent 'mouse:over' is used to
      // clear old instances on hovered target.
      // calling findTarget has the side effect of killing target.__corner.
      // as a short term fix we are not firing this if we are currently transforming.
      // as a long term fix we need to separate the action of finding a target with the
      // side effects we added to it.
      if (!this._currentTransform && !this.findTarget(e)) {
        this.fire('mouse:over', { target: null, e: e });
        this._hoveredTarget = null;
        this._hoveredTargets = [];
      }
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js orientation change
     * @param {Event} [self] Inner Event object
     */
    _onOrientationChange: function(e, self) {
      this.__onOrientationChange && this.__onOrientationChange(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js shake
     * @param {Event} [self] Inner Event object
     */
    _onShake: function(e, self) {
      this.__onShake && this.__onShake(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js shake
     * @param {Event} [self] Inner Event object
     */
    _onLongPress: function(e, self) {
      this.__onLongPress && this.__onLongPress(e, self);
    },

    /**
     * prevent default to allow drop event to be fired
     * @private
     * @param {Event} [e] Event object fired on Event.js shake
     */
    _onDragOver: function(e) {
      e.preventDefault();
      var target = this._simpleEventHandler('dragover', e);
      this._fireEnterLeaveEvents(target, e);
    },

    /**
     * `drop:before` is a an event that allow you to schedule logic
     * before the `drop` event. Prefer `drop` event always, but if you need
     * to run some drop-disabling logic on an event, since there is no way
     * to handle event handlers ordering, use `drop:before`
     * @param {Event} e
     */
    _onDrop: function (e) {
      this._simpleEventHandler('drop:before', e);
      return this._simpleEventHandler('drop', e);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onContextMenu: function (e) {
      if (this.stopContextMenu) {
        e.stopPropagation();
        e.preventDefault();
      }
      return false;
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onDoubleClick: function (e) {
      this._cacheTransformEventData(e);
      this._handleEvent(e, 'dblclick');
      this._resetTransformEventData(e);
    },

    /**
     * Return a the id of an event.
     * returns either the pointerId or the identifier or 0 for the mouse event
     * @private
     * @param {Event} evt Event object
     */
    getPointerId: function(evt) {
      var changedTouches = evt.changedTouches;

      if (changedTouches) {
        return changedTouches[0] && changedTouches[0].identifier;
      }

      if (this.enablePointerEvents) {
        return evt.pointerId;
      }

      return -1;
    },

    /**
     * Determines if an event has the id of the event that is considered main
     * @private
     * @param {evt} event Event object
     */
    _isMainEvent: function(evt) {
      if (evt.isPrimary === true) {
        return true;
      }
      if (evt.isPrimary === false) {
        return false;
      }
      if (evt.type === 'touchend' && evt.touches.length === 0) {
        return true;
      }
      if (evt.changedTouches) {
        return evt.changedTouches[0].identifier === this.mainTouchId;
      }
      return true;
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onTouchStart: function(e) {
      e.preventDefault();
      if (this.mainTouchId === null) {
        this.mainTouchId = this.getPointerId(e);
      }
      this.__onMouseDown(e);
      this._resetTransformEventData();
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      addListener(fabric.document, 'touchend', this._onTouchEnd, addEventOptions);
      addListener(fabric.document, 'touchmove', this._onMouseMove, addEventOptions);
      // Unbind mousedown to prevent double triggers from touch devices
      removeListener(canvasElement, eventTypePrefix + 'down', this._onMouseDown);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onMouseDown: function (e) {
      this.__onMouseDown(e);
      this._resetTransformEventData();
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      removeListener(canvasElement, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      addListener(fabric.document, eventTypePrefix + 'up', this._onMouseUp);
      addListener(fabric.document, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onTouchEnd: function(e) {
      if (e.touches.length > 0) {
        // if there are still touches stop here
        return;
      }
      this.__onMouseUp(e);
      this._resetTransformEventData();
      this.mainTouchId = null;
      var eventTypePrefix = this._getEventPrefix();
      removeListener(fabric.document, 'touchend', this._onTouchEnd, addEventOptions);
      removeListener(fabric.document, 'touchmove', this._onMouseMove, addEventOptions);
      var _this = this;
      if (this._willAddMouseDown) {
        clearTimeout(this._willAddMouseDown);
      }
      this._willAddMouseDown = setTimeout(function() {
        // Wait 400ms before rebinding mousedown to prevent double triggers
        // from touch devices
        addListener(_this.upperCanvasEl, eventTypePrefix + 'down', _this._onMouseDown);
        _this._willAddMouseDown = 0;
      }, 400);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mouseup
     */
    _onMouseUp: function (e) {
      this.__onMouseUp(e);
      this._resetTransformEventData();
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      if (this._isMainEvent(e)) {
        removeListener(fabric.document, eventTypePrefix + 'up', this._onMouseUp);
        removeListener(fabric.document, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
        addListener(canvasElement, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      }
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousemove
     */
    _onMouseMove: function (e) {
      !this.allowTouchScrolling && e.preventDefault && e.preventDefault();
      this.__onMouseMove(e);
    },

    /**
     * @private
     */
    _onResize: function () {
      this.calcOffset();
    },

    /**
     * Decides whether the canvas should be redrawn in mouseup and mousedown events.
     * @private
     * @param {Object} target
     */
    _shouldRender: function(target) {
      var activeObject = this._activeObject;

      if (
        !!activeObject !== !!target ||
        (activeObject && target && (activeObject !== target))
      ) {
        // this covers: switch of target, from target to no target, selection of target
        // multiSelection with key and mouse
        return true;
      }
      else if (activeObject && activeObject.isEditing) {
        // if we mouse up/down over a editing textbox a cursor change,
        // there is no need to re render
        return false;
      }
      return false;
    },

    /**
     * Method that defines the actions when mouse is released on canvas.
     * The method resets the currentTransform parameters, store the image corner
     * position in the image object and render the canvas on top.
     * @private
     * @param {Event} e Event object fired on mouseup
     */
    __onMouseUp: function (e) {
      var target, transform = this._currentTransform,
          groupSelector = this._groupSelector, shouldRender = false,
          isClick = (!groupSelector || (groupSelector.left === 0 && groupSelector.top === 0));
      this._cacheTransformEventData(e);
      target = this._target;
      this._handleEvent(e, 'up:before');
      // if right/middle click just fire events and return
      // target undefined will make the _handleEvent search the target
      if (checkClick(e, RIGHT_CLICK)) {
        if (this.fireRightClick) {
          this._handleEvent(e, 'up', RIGHT_CLICK, isClick);
        }
        return;
      }

      if (checkClick(e, MIDDLE_CLICK)) {
        if (this.fireMiddleClick) {
          this._handleEvent(e, 'up', MIDDLE_CLICK, isClick);
        }
        this._resetTransformEventData();
        return;
      }

      if (this.isDrawingMode && this._isCurrentlyDrawing) {
        this._onMouseUpInDrawingMode(e);
        return;
      }

      if (!this._isMainEvent(e)) {
        return;
      }
      if (transform) {
        this._finalizeCurrentTransform(e);
        shouldRender = transform.actionPerformed;
      }
      if (!isClick) {
        var targetWasActive = target === this._activeObject;
        this._maybeGroupObjects(e);
        if (!shouldRender) {
          shouldRender = (
            this._shouldRender(target) ||
            (!targetWasActive && target === this._activeObject)
          );
        }
      }
      var corner, pointer;
      if (target) {
        corner = target._findTargetCorner(
          this.getPointer(e, true),
          fabric.util.isTouchEvent(e)
        );
        if (target.selectable && target !== this._activeObject && target.activeOn === 'up') {
          this.setActiveObject(target, e);
          shouldRender = true;
        }
        else {
          var control = target.controls[corner],
              mouseUpHandler = control && control.getMouseUpHandler(e, target, control);
          if (mouseUpHandler) {
            pointer = this.getPointer(e);
            mouseUpHandler(e, transform, pointer.x, pointer.y);
          }
        }
        target.isMoving = false;
      }
      // if we are ending up a transform on a different control or a new object
      // fire the original mouse up from the corner that started the transform
      if (transform && (transform.target !== target || transform.corner !== corner)) {
        var originalControl = transform.target && transform.target.controls[transform.corner],
            originalMouseUpHandler = originalControl && originalControl.getMouseUpHandler(e, target, control);
        pointer = pointer || this.getPointer(e);
        originalMouseUpHandler && originalMouseUpHandler(e, transform, pointer.x, pointer.y);
      }
      this._setCursorFromEvent(e, target);
      this._handleEvent(e, 'up', LEFT_CLICK, isClick);
      this._groupSelector = null;
      this._currentTransform = null;
      // reset the target information about which corner is selected
      target && (target.__corner = 0);
      if (shouldRender) {
        this.requestRenderAll();
      }
      else if (!isClick) {
        this.renderTop();
      }
    },

    /**
     * @private
     * Handle event firing for target and subtargets
     * @param {Event} e event from mouse
     * @param {String} eventType event to fire (up, down or move)
     * @return {Fabric.Object} target return the the target found, for internal reasons.
     */
    _simpleEventHandler: function(eventType, e) {
      var target = this.findTarget(e),
          targets = this.targets,
          options = {
            e: e,
            target: target,
            subTargets: targets,
          };
      this.fire(eventType, options);
      target && target.fire(eventType, options);
      if (!targets) {
        return target;
      }
      for (var i = 0; i < targets.length; i++) {
        targets[i].fire(eventType, options);
      }
      return target;
    },

    /**
     * @private
     * Handle event firing for target and subtargets
     * @param {Event} e event from mouse
     * @param {String} eventType event to fire (up, down or move)
     * @param {fabric.Object} targetObj receiving event
     * @param {Number} [button] button used in the event 1 = left, 2 = middle, 3 = right
     * @param {Boolean} isClick for left button only, indicates that the mouse up happened without move.
     */
    _handleEvent: function(e, eventType, button, isClick) {
      var target = this._target,
          targets = this.targets || [],
          options = {
            e: e,
            target: target,
            subTargets: targets,
            button: button || LEFT_CLICK,
            isClick: isClick || false,
            pointer: this._pointer,
            absolutePointer: this._absolutePointer,
            transform: this._currentTransform
          };
      if (eventType === 'up') {
        options.currentTarget = this.findTarget(e);
        options.currentSubTargets = this.targets;
      }
      this.fire('mouse:' + eventType, options);
      target && target.fire('mouse' + eventType, options);
      for (var i = 0; i < targets.length; i++) {
        targets[i].fire('mouse' + eventType, options);
      }
    },

    /**
     * @private
     * @param {Event} e send the mouse event that generate the finalize down, so it can be used in the event
     */
    _finalizeCurrentTransform: function(e) {

      var transform = this._currentTransform,
          target = transform.target,
          options = {
            e: e,
            target: target,
            transform: transform,
            action: transform.action,
          };

      if (target._scaling) {
        target._scaling = false;
      }

      target.setCoords();

      if (transform.actionPerformed || (this.stateful && target.hasStateChanged())) {
        this._fire('modified', options);
      }
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onMouseDownInDrawingMode: function(e) {
      this._isCurrentlyDrawing = true;
      if (this.getActiveObject()) {
        this.discardActiveObject(e).requestRenderAll();
      }
      var pointer = this.getPointer(e);
      this.freeDrawingBrush.onMouseDown(pointer, { e: e, pointer: pointer });
      this._handleEvent(e, 'down');
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousemove
     */
    _onMouseMoveInDrawingMode: function(e) {
      if (this._isCurrentlyDrawing) {
        var pointer = this.getPointer(e);
        this.freeDrawingBrush.onMouseMove(pointer, { e: e, pointer: pointer });
      }
      this.setCursor(this.freeDrawingCursor);
      this._handleEvent(e, 'move');
    },

    /**
     * @private
     * @param {Event} e Event object fired on mouseup
     */
    _onMouseUpInDrawingMode: function(e) {
      var pointer = this.getPointer(e);
      this._isCurrentlyDrawing = this.freeDrawingBrush.onMouseUp({ e: e, pointer: pointer });
      this._handleEvent(e, 'up');
    },

    /**
     * Method that defines the actions when mouse is clicked on canvas.
     * The method inits the currentTransform parameters and renders all the
     * canvas so the current image can be placed on the top canvas and the rest
     * in on the container one.
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    __onMouseDown: function (e) {
      this._cacheTransformEventData(e);
      this._handleEvent(e, 'down:before');
      var target = this._target;
      // if right click just fire events
      if (checkClick(e, RIGHT_CLICK)) {
        if (this.fireRightClick) {
          this._handleEvent(e, 'down', RIGHT_CLICK);
        }
        return;
      }

      if (checkClick(e, MIDDLE_CLICK)) {
        if (this.fireMiddleClick) {
          this._handleEvent(e, 'down', MIDDLE_CLICK);
        }
        return;
      }

      if (this.isDrawingMode) {
        this._onMouseDownInDrawingMode(e);
        return;
      }

      if (!this._isMainEvent(e)) {
        return;
      }

      // ignore if some object is being transformed at this moment
      if (this._currentTransform) {
        return;
      }

      var pointer = this._pointer;
      // save pointer for check in __onMouseUp event
      this._previousPointer = pointer;
      var shouldRender = this._shouldRender(target),
          shouldGroup = this._shouldGroup(e, target);
      if (this._shouldClearSelection(e, target)) {
        this.discardActiveObject(e);
      }
      else if (shouldGroup) {
        this._handleGrouping(e, target);
        target = this._activeObject;
      }

      if (this.selection && (!target ||
        (!target.selectable && !target.isEditing && target !== this._activeObject))) {
        this._groupSelector = {
          ex: this._absolutePointer.x,
          ey: this._absolutePointer.y,
          top: 0,
          left: 0
        };
      }

      if (target) {
        var alreadySelected = target === this._activeObject;
        if (target.selectable && target.activeOn === 'down') {
          this.setActiveObject(target, e);
        }
        var corner = target._findTargetCorner(
          this.getPointer(e, true),
          fabric.util.isTouchEvent(e)
        );
        target.__corner = corner;
        if (target === this._activeObject && (corner || !shouldGroup)) {
          this._setupCurrentTransform(e, target, alreadySelected);
          var control = target.controls[corner],
              pointer = this.getPointer(e),
              mouseDownHandler = control && control.getMouseDownHandler(e, target, control);
          if (mouseDownHandler) {
            mouseDownHandler(e, this._currentTransform, pointer.x, pointer.y);
          }
        }
      }
      this._handleEvent(e, 'down');
      // we must renderAll so that we update the visuals
      (shouldRender || shouldGroup) && this.requestRenderAll();
    },

    /**
     * reset cache form common information needed during event processing
     * @private
     */
    _resetTransformEventData: function() {
      this._target = null;
      this._pointer = null;
      this._absolutePointer = null;
    },

    /**
     * Cache common information needed during event processing
     * @private
     * @param {Event} e Event object fired on event
     */
    _cacheTransformEventData: function(e) {
      // reset in order to avoid stale caching
      this._resetTransformEventData();
      this._pointer = this.getPointer(e, true);
      this._absolutePointer = this.restorePointerVpt(this._pointer);
      this._target = this._currentTransform ? this._currentTransform.target : this.findTarget(e) || null;
    },

    /**
     * @private
     */
    _beforeTransform: function(e) {
      var t = this._currentTransform;
      this.stateful && t.target.saveState();
      this.fire('before:transform', {
        e: e,
        transform: t,
      });
    },

    /**
     * Method that defines the actions when mouse is hovering the canvas.
     * The currentTransform parameter will define whether the user is rotating/scaling/translating
     * an image or neither of them (only hovering). A group selection is also possible and would cancel
     * all any other type of action.
     * In case of an image transformation only the top canvas will be rendered.
     * @private
     * @param {Event} e Event object fired on mousemove
     */
    __onMouseMove: function (e) {
      this._handleEvent(e, 'move:before');
      this._cacheTransformEventData(e);
      var target, pointer;

      if (this.isDrawingMode) {
        this._onMouseMoveInDrawingMode(e);
        return;
      }

      if (!this._isMainEvent(e)) {
        return;
      }

      var groupSelector = this._groupSelector;

      // We initially clicked in an empty area, so we draw a box for multiple selection
      if (groupSelector) {
        pointer = this._absolutePointer;

        groupSelector.left = pointer.x - groupSelector.ex;
        groupSelector.top = pointer.y - groupSelector.ey;

        this.renderTop();
      }
      else if (!this._currentTransform) {
        target = this.findTarget(e) || null;
        this._setCursorFromEvent(e, target);
        this._fireOverOutEvents(target, e);
      }
      else {
        this._transformObject(e);
      }
      this._handleEvent(e, 'move');
      this._resetTransformEventData();
    },

    /**
     * Manage the mouseout, mouseover events for the fabric object on the canvas
     * @param {Fabric.Object} target the target where the target from the mousemove event
     * @param {Event} e Event object fired on mousemove
     * @private
     */
    _fireOverOutEvents: function(target, e) {
      var _hoveredTarget = this._hoveredTarget,
          _hoveredTargets = this._hoveredTargets, targets = this.targets,
          length = Math.max(_hoveredTargets.length, targets.length);

      this.fireSyntheticInOutEvents(target, e, {
        oldTarget: _hoveredTarget,
        evtOut: 'mouseout',
        canvasEvtOut: 'mouse:out',
        evtIn: 'mouseover',
        canvasEvtIn: 'mouse:over',
      });
      for (var i = 0; i < length; i++){
        this.fireSyntheticInOutEvents(targets[i], e, {
          oldTarget: _hoveredTargets[i],
          evtOut: 'mouseout',
          evtIn: 'mouseover',
        });
      }
      this._hoveredTarget = target;
      this._hoveredTargets = this.targets.concat();
    },

    /**
     * Manage the dragEnter, dragLeave events for the fabric objects on the canvas
     * @param {Fabric.Object} target the target where the target from the onDrag event
     * @param {Event} e Event object fired on ondrag
     * @private
     */
    _fireEnterLeaveEvents: function(target, e) {
      var _draggedoverTarget = this._draggedoverTarget,
          _hoveredTargets = this._hoveredTargets, targets = this.targets,
          length = Math.max(_hoveredTargets.length, targets.length);

      this.fireSyntheticInOutEvents(target, e, {
        oldTarget: _draggedoverTarget,
        evtOut: 'dragleave',
        evtIn: 'dragenter',
      });
      for (var i = 0; i < length; i++) {
        this.fireSyntheticInOutEvents(targets[i], e, {
          oldTarget: _hoveredTargets[i],
          evtOut: 'dragleave',
          evtIn: 'dragenter',
        });
      }
      this._draggedoverTarget = target;
    },

    /**
     * Manage the synthetic in/out events for the fabric objects on the canvas
     * @param {Fabric.Object} target the target where the target from the supported events
     * @param {Event} e Event object fired
     * @param {Object} config configuration for the function to work
     * @param {String} config.targetName property on the canvas where the old target is stored
     * @param {String} [config.canvasEvtOut] name of the event to fire at canvas level for out
     * @param {String} config.evtOut name of the event to fire for out
     * @param {String} [config.canvasEvtIn] name of the event to fire at canvas level for in
     * @param {String} config.evtIn name of the event to fire for in
     * @private
     */
    fireSyntheticInOutEvents: function(target, e, config) {
      var inOpt, outOpt, oldTarget = config.oldTarget, outFires, inFires,
          targetChanged = oldTarget !== target, canvasEvtIn = config.canvasEvtIn, canvasEvtOut = config.canvasEvtOut;
      if (targetChanged) {
        inOpt = { e: e, target: target, previousTarget: oldTarget };
        outOpt = { e: e, target: oldTarget, nextTarget: target };
      }
      inFires = target && targetChanged;
      outFires = oldTarget && targetChanged;
      if (outFires) {
        canvasEvtOut && this.fire(canvasEvtOut, outOpt);
        oldTarget.fire(config.evtOut, outOpt);
      }
      if (inFires) {
        canvasEvtIn && this.fire(canvasEvtIn, inOpt);
        target.fire(config.evtIn, inOpt);
      }
    },

    /**
     * Method that defines actions when an Event Mouse Wheel
     * @param {Event} e Event object fired on mouseup
     */
    __onMouseWheel: function(e) {
      this._cacheTransformEventData(e);
      this._handleEvent(e, 'wheel');
      this._resetTransformEventData();
    },

    /**
     * @private
     * @param {Event} e Event fired on mousemove
     */
    _transformObject: function(e) {
      var pointer = this.getPointer(e),
          transform = this._currentTransform;

      transform.reset = false;
      transform.shiftKey = e.shiftKey;
      transform.altKey = e[this.centeredKey];

      this._performTransformAction(e, transform, pointer);
      transform.actionPerformed && this.requestRenderAll();
    },

    /**
     * @private
     */
    _performTransformAction: function(e, transform, pointer) {
      var x = pointer.x,
          y = pointer.y,
          action = transform.action,
          actionPerformed = false,
          actionHandler = transform.actionHandler;
          // this object could be created from the function in the control handlers


      if (actionHandler) {
        actionPerformed = actionHandler(e, transform, x, y);
      }
      if (action === 'drag' && actionPerformed) {
        transform.target.isMoving = true;
        this.setCursor(transform.target.moveCursor || this.moveCursor);
      }
      transform.actionPerformed = transform.actionPerformed || actionPerformed;
    },

    /**
     * @private
     */
    _fire: fabric.controlsUtils.fireEvent,

    /**
     * Sets the cursor depending on where the canvas is being hovered.
     * Note: very buggy in Opera
     * @param {Event} e Event object
     * @param {Object} target Object that the mouse is hovering, if so.
     */
    _setCursorFromEvent: function (e, target) {
      if (!target) {
        this.setCursor(this.defaultCursor);
        return false;
      }
      var hoverCursor = target.hoverCursor || this.hoverCursor,
          activeSelection = this._activeObject && this._activeObject.type === 'activeSelection' ?
            this._activeObject : null,
          // only show proper corner when group selection is not active
          corner = (!activeSelection || !activeSelection.contains(target))
          // here we call findTargetCorner always with undefined for the touch parameter.
          // we assume that if you are using a cursor you do not need to interact with
          // the bigger touch area.
                    && target._findTargetCorner(this.getPointer(e, true));

      if (!corner) {
        if (target.subTargetCheck){
          // hoverCursor should come from top-most subTarget,
          // so we walk the array backwards
          this.targets.concat().reverse().map(function(_target){
            hoverCursor = _target.hoverCursor || hoverCursor;
          });
        }
        this.setCursor(hoverCursor);
      }
      else {
        this.setCursor(this.getCornerCursor(corner, target, e));
      }
    },

    /**
     * @private
     */
    getCornerCursor: function(corner, target, e) {
      var control = target.controls[corner];
      return control.cursorStyleHandler(e, control, target);
    }
  });
})();
(function() {

  var min = Math.min,
      max = Math.max;

  fabric.util.object.extend(fabric.Canvas.prototype, /** @lends fabric.Canvas.prototype */ {

    /**
     * @private
     * @param {Event} e Event object
     * @param {fabric.Object} target
     * @return {Boolean}
     */
    _shouldGroup: function(e, target) {
      var activeObject = this._activeObject;
      return activeObject && this._isSelectionKeyPressed(e) && target && target.selectable && this.selection &&
            (activeObject !== target || activeObject.type === 'activeSelection') && !target.onSelect({ e: e });
    },

    /**
     * @private
     * @param {Event} e Event object
     * @param {fabric.Object} target
     */
    _handleGrouping: function (e, target) {
      var activeObject = this._activeObject;
      // avoid multi select when shift click on a corner
      if (activeObject.__corner) {
        return;
      }
      if (target === activeObject) {
        // if it's a group, find target again, using activeGroup objects
        target = this.findTarget(e, true);
        // if even object is not found or we are on activeObjectCorner, bail out
        if (!target || !target.selectable) {
          return;
        }
      }
      if (activeObject && activeObject.type === 'activeSelection') {
        this._updateActiveSelection(target, e);
      }
      else {
        this._createActiveSelection(target, e);
      }
    },

    /**
     * @private
     */
    _updateActiveSelection: function(target, e) {
      var activeSelection = this._activeObject,
          currentActiveObjects = activeSelection._objects.slice(0);
      if (activeSelection.contains(target)) {
        activeSelection.removeWithUpdate(target);
        this._hoveredTarget = target;
        this._hoveredTargets = this.targets.concat();
        if (activeSelection.size() === 1) {
          // activate last remaining object
          this._setActiveObject(activeSelection.item(0), e);
        }
      }
      else {
        activeSelection.addWithUpdate(target);
        this._hoveredTarget = activeSelection;
        this._hoveredTargets = this.targets.concat();
      }
      this._fireSelectionEvents(currentActiveObjects, e);
    },

    /**
     * @private
     */
    _createActiveSelection: function(target, e) {
      var currentActives = this.getActiveObjects(), group = this._createGroup(target);
      this._hoveredTarget = group;
      // ISSUE 4115: should we consider subTargets here?
      // this._hoveredTargets = [];
      // this._hoveredTargets = this.targets.concat();
      this._setActiveObject(group, e);
      this._fireSelectionEvents(currentActives, e);
    },

    /**
     * @private
     * @param {Object} target
     */
    _createGroup: function(target) {
      var objects = this._objects,
          isActiveLower = objects.indexOf(this._activeObject) < objects.indexOf(target),
          groupObjects = isActiveLower
            ? [this._activeObject, target]
            : [target, this._activeObject];
      this._activeObject.isEditing && this._activeObject.exitEditing();
      return new fabric.ActiveSelection(groupObjects, {
        canvas: this
      });
    },

    /**
     * @private
     * @param {Event} e mouse event
     */
    _groupSelectedObjects: function (e) {

      var group = this._collectObjects(e),
          aGroup;

      // do not create group for 1 element only
      if (group.length === 1) {
        this.setActiveObject(group[0], e);
      }
      else if (group.length > 1) {
        aGroup = new fabric.ActiveSelection(group.reverse(), {
          canvas: this
        });
        this.setActiveObject(aGroup, e);
      }
    },

    /**
     * @private
     */
    _collectObjects: function(e) {
      var group = [],
          currentObject,
          x1 = this._groupSelector.ex,
          y1 = this._groupSelector.ey,
          x2 = x1 + this._groupSelector.left,
          y2 = y1 + this._groupSelector.top,
          selectionX1Y1 = new fabric.Point(min(x1, x2), min(y1, y2)),
          selectionX2Y2 = new fabric.Point(max(x1, x2), max(y1, y2)),
          allowIntersect = !this.selectionFullyContained,
          isClick = x1 === x2 && y1 === y2;
      // we iterate reverse order to collect top first in case of click.
      for (var i = this._objects.length; i--; ) {
        currentObject = this._objects[i];

        if (!currentObject || !currentObject.selectable || !currentObject.visible) {
          continue;
        }

        if ((allowIntersect && currentObject.intersectsWithRect(selectionX1Y1, selectionX2Y2, true)) ||
            currentObject.isContainedWithinRect(selectionX1Y1, selectionX2Y2, true) ||
            (allowIntersect && currentObject.containsPoint(selectionX1Y1, null, true)) ||
            (allowIntersect && currentObject.containsPoint(selectionX2Y2, null, true))
        ) {
          group.push(currentObject);
          // only add one object if it's a click
          if (isClick) {
            break;
          }
        }
      }

      if (group.length > 1) {
        group = group.filter(function(object) {
          return !object.onSelect({ e: e });
        });
      }

      return group;
    },

    /**
     * @private
     */
    _maybeGroupObjects: function(e) {
      if (this.selection && this._groupSelector) {
        this._groupSelectedObjects(e);
      }
      this.setCursor(this.defaultCursor);
      // clear selection and current transformation
      this._groupSelector = null;
    }
  });

})();
(function () {
  fabric.util.object.extend(fabric.StaticCanvas.prototype, /** @lends fabric.StaticCanvas.prototype */ {

    /**
     * Exports canvas element to a dataurl image. Note that when multiplier is used, cropping is scaled appropriately
     * @param {Object} [options] Options object
     * @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
     * @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
     * @param {Number} [options.multiplier=1] Multiplier to scale by, to have consistent
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 2.0.0
     * @return {String} Returns a data: URL containing a representation of the object in the format specified by options.format
     * @see {@link http://jsfiddle.net/fabricjs/NfZVb/|jsFiddle demo}
     * @example <caption>Generate jpeg dataURL with lower quality</caption>
     * var dataURL = canvas.toDataURL({
     *   format: 'jpeg',
     *   quality: 0.8
     * });
     * @example <caption>Generate cropped png dataURL (clipping of canvas)</caption>
     * var dataURL = canvas.toDataURL({
     *   format: 'png',
     *   left: 100,
     *   top: 100,
     *   width: 200,
     *   height: 200
     * });
     * @example <caption>Generate double scaled png dataURL</caption>
     * var dataURL = canvas.toDataURL({
     *   format: 'png',
     *   multiplier: 2
     * });
     */
    toDataURL: function (options) {
      options || (options = { });

      var format = options.format || 'png',
          quality = options.quality || 1,
          multiplier = (options.multiplier || 1) * (options.enableRetinaScaling ? this.getRetinaScaling() : 1),
          canvasEl = this.toCanvasElement(multiplier, options);
      return fabric.util.toDataURL(canvasEl, format, quality);
    },

    /**
     * Create a new HTMLCanvas element painted with the current canvas content.
     * No need to resize the actual one or repaint it.
     * Will transfer object ownership to a new canvas, paint it, and set everything back.
     * This is an intermediary step used to get to a dataUrl but also it is useful to
     * create quick image copies of a canvas without passing for the dataUrl string
     * @param {Number} [multiplier] a zoom factor.
     * @param {Object} [cropping] Cropping informations
     * @param {Number} [cropping.left] Cropping left offset.
     * @param {Number} [cropping.top] Cropping top offset.
     * @param {Number} [cropping.width] Cropping width.
     * @param {Number} [cropping.height] Cropping height.
     */
    toCanvasElement: function(multiplier, cropping) {
      multiplier = multiplier || 1;
      cropping = cropping || { };
      var scaledWidth = (cropping.width || this.width) * multiplier,
          scaledHeight = (cropping.height || this.height) * multiplier,
          zoom = this.getZoom(),
          originalWidth = this.width,
          originalHeight = this.height,
          newZoom = zoom * multiplier,
          vp = this.viewportTransform,
          translateX = (vp[4] - (cropping.left || 0)) * multiplier,
          translateY = (vp[5] - (cropping.top || 0)) * multiplier,
          originalInteractive = this.interactive,
          newVp = [newZoom, 0, 0, newZoom, translateX, translateY],
          originalRetina = this.enableRetinaScaling,
          canvasEl = fabric.util.createCanvasElement(),
          originalContextTop = this.contextTop;
      canvasEl.width = scaledWidth;
      canvasEl.height = scaledHeight;
      this.contextTop = null;
      this.enableRetinaScaling = false;
      this.interactive = false;
      this.viewportTransform = newVp;
      this.width = scaledWidth;
      this.height = scaledHeight;
      this.calcViewportBoundaries();
      this.renderCanvas(canvasEl.getContext('2d'), this._objects);
      this.viewportTransform = vp;
      this.width = originalWidth;
      this.height = originalHeight;
      this.calcViewportBoundaries();
      this.interactive = originalInteractive;
      this.enableRetinaScaling = originalRetina;
      this.contextTop = originalContextTop;
      return canvasEl;
    },
  });

})();
fabric.util.object.extend(fabric.StaticCanvas.prototype, /** @lends fabric.StaticCanvas.prototype */ {
  /**
   * Populates canvas with data from the specified JSON.
   * JSON format must conform to the one of {@link fabric.Canvas#toJSON}
   * @param {String|Object} json JSON string or object
   * @param {Function} callback Callback, invoked when json is parsed
   *                            and corresponding objects (e.g: {@link fabric.Image})
   *                            are initialized
   * @param {Function} [reviver] Method for further parsing of JSON elements, called after each fabric object created.
   * @return {fabric.Canvas} instance
   * @chainable
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#deserialization}
   * @see {@link http://jsfiddle.net/fabricjs/fmgXt/|jsFiddle demo}
   * @example <caption>loadFromJSON</caption>
   * canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
   * @example <caption>loadFromJSON with reviver</caption>
   * canvas.loadFromJSON(json, canvas.renderAll.bind(canvas), function(o, object) {
   *   // `o` = json object
   *   // `object` = fabric.Object instance
   *   // ... do some stuff ...
   * });
   */
  loadFromJSON: function (json, callback, reviver) {
    if (!json) {
      return;
    }

    // serialize if it wasn't already
    var serialized = (typeof json === 'string')
      ? JSON.parse(json)
      : fabric.util.object.clone(json);

    var _this = this,
        clipPath = serialized.clipPath,
        renderOnAddRemove = this.renderOnAddRemove;

    this.renderOnAddRemove = false;

    delete serialized.clipPath;

    this._enlivenObjects(serialized.objects, function (enlivenedObjects) {
      _this.clear();
      _this._setBgOverlay(serialized, function () {
        if (clipPath) {
          _this._enlivenObjects([clipPath], function (enlivenedCanvasClip) {
            _this.clipPath = enlivenedCanvasClip[0];
            _this.__setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove, callback);
          });
        }
        else {
          _this.__setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove, callback);
        }
      });
    }, reviver);
    return this;
  },

  /**
   * @private
   * @param {Object} serialized Object with background and overlay information
   * @param {Array} restored canvas objects
   * @param {Function} cached renderOnAddRemove callback
   * @param {Function} callback Invoked after all background and overlay images/patterns loaded
   */
  __setupCanvas: function(serialized, enlivenedObjects, renderOnAddRemove, callback) {
    var _this = this;
    enlivenedObjects.forEach(function(obj, index) {
      // we splice the array just in case some custom classes restored from JSON
      // will add more object to canvas at canvas init.
      _this.insertAt(obj, index);
    });
    this.renderOnAddRemove = renderOnAddRemove;
    // remove parts i cannot set as options
    delete serialized.objects;
    delete serialized.backgroundImage;
    delete serialized.overlayImage;
    delete serialized.background;
    delete serialized.overlay;
    // this._initOptions does too many things to just
    // call it. Normally loading an Object from JSON
    // create the Object instance. Here the Canvas is
    // already an instance and we are just loading things over it
    this._setOptions(serialized);
    this.renderAll();
    callback && callback();
  },

  /**
   * @private
   * @param {Object} serialized Object with background and overlay information
   * @param {Function} callback Invoked after all background and overlay images/patterns loaded
   */
  _setBgOverlay: function(serialized, callback) {
    var loaded = {
      backgroundColor: false,
      overlayColor: false,
      backgroundImage: false,
      overlayImage: false
    };

    if (!serialized.backgroundImage && !serialized.overlayImage && !serialized.background && !serialized.overlay) {
      callback && callback();
      return;
    }

    var cbIfLoaded = function () {
      if (loaded.backgroundImage && loaded.overlayImage && loaded.backgroundColor && loaded.overlayColor) {
        callback && callback();
      }
    };

    this.__setBgOverlay('backgroundImage', serialized.backgroundImage, loaded, cbIfLoaded);
    this.__setBgOverlay('overlayImage', serialized.overlayImage, loaded, cbIfLoaded);
    this.__setBgOverlay('backgroundColor', serialized.background, loaded, cbIfLoaded);
    this.__setBgOverlay('overlayColor', serialized.overlay, loaded, cbIfLoaded);
  },

  /**
   * @private
   * @param {String} property Property to set (backgroundImage, overlayImage, backgroundColor, overlayColor)
   * @param {(Object|String)} value Value to set
   * @param {Object} loaded Set loaded property to true if property is set
   * @param {Object} callback Callback function to invoke after property is set
   */
  __setBgOverlay: function(property, value, loaded, callback) {
    var _this = this;

    if (!value) {
      loaded[property] = true;
      callback && callback();
      return;
    }

    if (property === 'backgroundImage' || property === 'overlayImage') {
      fabric.util.enlivenObjects([value], function(enlivedObject){
        _this[property] = enlivedObject[0];
        loaded[property] = true;
        callback && callback();
      });
    }
    else {
      this['set' + fabric.util.string.capitalize(property, true)](value, function() {
        loaded[property] = true;
        callback && callback();
      });
    }
  },

  /**
   * @private
   * @param {Array} objects
   * @param {Function} callback
   * @param {Function} [reviver]
   */
  _enlivenObjects: function (objects, callback, reviver) {
    if (!objects || objects.length === 0) {
      callback && callback([]);
      return;
    }

    fabric.util.enlivenObjects(objects, function(enlivenedObjects) {
      callback && callback(enlivenedObjects);
    }, null, reviver);
  },

  /**
   * @private
   * @param {String} format
   * @param {Function} callback
   */
  _toDataURL: function (format, callback) {
    this.clone(function (clone) {
      callback(clone.toDataURL(format));
    });
  },

  /**
   * @private
   * @param {String} format
   * @param {Number} multiplier
   * @param {Function} callback
   */
  _toDataURLWithMultiplier: function (format, multiplier, callback) {
    this.clone(function (clone) {
      callback(clone.toDataURLWithMultiplier(format, multiplier));
    });
  },

  /**
   * Clones canvas instance
   * @param {Object} [callback] Receives cloned instance as a first argument
   * @param {Array} [properties] Array of properties to include in the cloned canvas and children
   */
  clone: function (callback, properties) {
    var data = JSON.stringify(this.toJSON(properties));
    this.cloneWithoutData(function(clone) {
      clone.loadFromJSON(data, function() {
        callback && callback(clone);
      });
    });
  },

  /**
   * Clones canvas instance without cloning existing data.
   * This essentially copies canvas dimensions, clipping properties, etc.
   * but leaves data empty (so that you can populate it with your own)
   * @param {Object} [callback] Receives cloned instance as a first argument
   */
  cloneWithoutData: function(callback) {
    var el = fabric.util.createCanvasElement();

    el.width = this.width;
    el.height = this.height;

    var clone = new fabric.Canvas(el);
    if (this.backgroundImage) {
      clone.setBackgroundImage(this.backgroundImage.src, function() {
        clone.renderAll();
        callback && callback(clone);
      });
      clone.backgroundImageOpacity = this.backgroundImageOpacity;
      clone.backgroundImageStretch = this.backgroundImageStretch;
    }
    else {
      callback && callback(clone);
    }
  }
});
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      clone = fabric.util.object.clone,
      toFixed = fabric.util.toFixed,
      capitalize = fabric.util.string.capitalize,
      degreesToRadians = fabric.util.degreesToRadians,
      objectCaching = !fabric.isLikelyNode,
      ALIASING_LIMIT = 2;

  if (fabric.Object) {
    return;
  }

  /**
   * Root object class from which all 2d shape classes inherit from
   * @class fabric.Object
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-1#objects}
   * @see {@link fabric.Object#initialize} for constructor definition
   *
   * @fires added
   * @fires removed
   *
   * @fires selected
   * @fires deselected
   * @fires modified
   * @fires modified
   * @fires moved
   * @fires scaled
   * @fires rotated
   * @fires skewed
   *
   * @fires rotating
   * @fires scaling
   * @fires moving
   * @fires skewing
   *
   * @fires mousedown
   * @fires mouseup
   * @fires mouseover
   * @fires mouseout
   * @fires mousewheel
   * @fires mousedblclick
   *
   * @fires dragover
   * @fires dragenter
   * @fires dragleave
   * @fires drop
   */
  fabric.Object = fabric.util.createClass(fabric.CommonMethods, /** @lends fabric.Object.prototype */ {

    /**
     * Type of an object (rect, circle, path, etc.).
     * Note that this property is meant to be read-only and not meant to be modified.
     * If you modify, certain parts of Fabric (such as JSON loading) won't work correctly.
     * @type String
     * @default
     */
    type:                     'object',

    /**
     * Horizontal origin of transformation of an object (one of "left", "right", "center")
     * See http://jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
     * @type String
     * @default
     */
    originX:                  'left',

    /**
     * Vertical origin of transformation of an object (one of "top", "bottom", "center")
     * See http://jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
     * @type String
     * @default
     */
    originY:                  'top',

    /**
     * Top position of an object. Note that by default it's relative to object top. You can change this by setting originY={top/center/bottom}
     * @type Number
     * @default
     */
    top:                      0,

    /**
     * Left position of an object. Note that by default it's relative to object left. You can change this by setting originX={left/center/right}
     * @type Number
     * @default
     */
    left:                     0,

    /**
     * Object width
     * @type Number
     * @default
     */
    width:                    0,

    /**
     * Object height
     * @type Number
     * @default
     */
    height:                   0,

    /**
     * Object scale factor (horizontal)
     * @type Number
     * @default
     */
    scaleX:                   1,

    /**
     * Object scale factor (vertical)
     * @type Number
     * @default
     */
    scaleY:                   1,

    /**
     * When true, an object is rendered as flipped horizontally
     * @type Boolean
     * @default
     */
    flipX:                    false,

    /**
     * When true, an object is rendered as flipped vertically
     * @type Boolean
     * @default
     */
    flipY:                    false,

    /**
     * Opacity of an object
     * @type Number
     * @default
     */
    opacity:                  1,

    /**
     * Angle of rotation of an object (in degrees)
     * @type Number
     * @default
     */
    angle:                    0,

    /**
     * Angle of skew on x axes of an object (in degrees)
     * @type Number
     * @default
     */
    skewX:                    0,

    /**
     * Angle of skew on y axes of an object (in degrees)
     * @type Number
     * @default
     */
    skewY:                    0,

    /**
     * Size of object's controlling corners (in pixels)
     * @type Number
     * @default
     */
    cornerSize:               13,

    /**
     * Size of object's controlling corners when touch interaction is detected
     * @type Number
     * @default
     */
    touchCornerSize:               24,

    /**
     * When true, object's controlling corners are rendered as transparent inside (i.e. stroke instead of fill)
     * @type Boolean
     * @default
     */
    transparentCorners:       true,

    /**
     * Default cursor value used when hovering over this object on canvas
     * @type String
     * @default
     */
    hoverCursor:              null,

    /**
     * Default cursor value used when moving this object on canvas
     * @type String
     * @default
     */
    moveCursor:               null,

    /**
     * Padding between object and its controlling borders (in pixels)
     * @type Number
     * @default
     */
    padding:                  0,

    /**
     * Color of controlling borders of an object (when it's active)
     * @type String
     * @default
     */
    borderColor:              'rgb(178,204,255)',

    /**
     * Array specifying dash pattern of an object's borders (hasBorder must be true)
     * @since 1.6.2
     * @type Array
     */
    borderDashArray:          null,

    /**
     * Color of controlling corners of an object (when it's active)
     * @type String
     * @default
     */
    cornerColor:              'rgb(178,204,255)',

    /**
     * Color of controlling corners of an object (when it's active and transparentCorners false)
     * @since 1.6.2
     * @type String
     * @default
     */
    cornerStrokeColor:        null,

    /**
     * Specify style of control, 'rect' or 'circle'
     * @since 1.6.2
     * @type String
     */
    cornerStyle:          'rect',

    /**
     * Array specifying dash pattern of an object's control (hasBorder must be true)
     * @since 1.6.2
     * @type Array
     */
    cornerDashArray:          null,

    /**
     * When true, this object will use center point as the origin of transformation
     * when being scaled via the controls.
     * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredScaling:          false,

    /**
     * When true, this object will use center point as the origin of transformation
     * when being rotated via the controls.
     * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredRotation:         true,

    /**
     * Color of object's fill
     * takes css colors https://www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    fill:                     'rgb(0,0,0)',

    /**
     * Fill rule used to fill an object
     * accepted values are nonzero, evenodd
     * <b>Backwards incompatibility note:</b> This property was used for setting globalCompositeOperation until v1.4.12 (use `fabric.Object#globalCompositeOperation` instead)
     * @type String
     * @default
     */
    fillRule:                 'nonzero',

    /**
     * Composite rule used for canvas globalCompositeOperation
     * @type String
     * @default
     */
    globalCompositeOperation: 'source-over',

    /**
     * Background color of an object.
     * takes css colors https://www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    backgroundColor:          '',

    /**
     * Selection Background color of an object. colored layer behind the object when it is active.
     * does not mix good with globalCompositeOperation methods.
     * @type String
     * @default
     */
    selectionBackgroundColor:          '',

    /**
     * When defined, an object is rendered via stroke and this property specifies its color
     * takes css colors https://www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    stroke:                   null,

    /**
     * Width of a stroke used to render this object
     * @type Number
     * @default
     */
    strokeWidth:              1,

    /**
     * Array specifying dash pattern of an object's stroke (stroke must be defined)
     * @type Array
     */
    strokeDashArray:          null,

    /**
     * Line offset of an object's stroke
     * @type Number
     * @default
     */
    strokeDashOffset: 0,

    /**
     * Line endings style of an object's stroke (one of "butt", "round", "square")
     * @type String
     * @default
     */
    strokeLineCap:            'butt',

    /**
     * Corner style of an object's stroke (one of "bevel", "round", "miter")
     * @type String
     * @default
     */
    strokeLineJoin:           'miter',

    /**
     * Maximum miter length (used for strokeLineJoin = "miter") of an object's stroke
     * @type Number
     * @default
     */
    strokeMiterLimit:         4,

    /**
     * Shadow object representing shadow of this shape
     * @type fabric.Shadow
     * @default
     */
    shadow:                   null,

    /**
     * Opacity of object's controlling borders when object is active and moving
     * @type Number
     * @default
     */
    borderOpacityWhenMoving:  0.4,

    /**
     * Scale factor of object's controlling borders
     * bigger number will make a thicker border
     * border is 1, so this is basically a border thickness
     * since there is no way to change the border itself.
     * @type Number
     * @default
     */
    borderScaleFactor:        1,

    /**
     * Minimum allowed scale value of an object
     * @type Number
     * @default
     */
    minScaleLimit:            0,

    /**
     * When set to `false`, an object can not be selected for modification (using either point-click-based or group-based selection).
     * But events still fire on it.
     * @type Boolean
     * @default
     */
    selectable:               true,

    /**
     * When set to `false`, an object can not be a target of events. All events propagate through it. Introduced in v1.3.4
     * @type Boolean
     * @default
     */
    evented:                  true,

    /**
     * When set to `false`, an object is not rendered on canvas
     * @type Boolean
     * @default
     */
    visible:                  true,

    /**
     * When set to `false`, object's controls are not displayed and can not be used to manipulate object
     * @type Boolean
     * @default
     */
    hasControls:              true,

    /**
     * When set to `false`, object's controlling borders are not rendered
     * @type Boolean
     * @default
     */
    hasBorders:               true,

    /**
     * When set to `true`, objects are "found" on canvas on per-pixel basis rather than according to bounding box
     * @type Boolean
     * @default
     */
    perPixelTargetFind:       false,

    /**
     * When `false`, default object's values are not included in its serialization
     * @type Boolean
     * @default
     */
    includeDefaultValues:     true,

    /**
     * When `true`, object horizontal movement is locked
     * @type Boolean
     * @default
     */
    lockMovementX:            false,

    /**
     * When `true`, object vertical movement is locked
     * @type Boolean
     * @default
     */
    lockMovementY:            false,

    /**
     * When `true`, object rotation is locked
     * @type Boolean
     * @default
     */
    lockRotation:             false,

    /**
     * When `true`, object horizontal scaling is locked
     * @type Boolean
     * @default
     */
    lockScalingX:             false,

    /**
     * When `true`, object vertical scaling is locked
     * @type Boolean
     * @default
     */
    lockScalingY:             false,

    /**
     * When `true`, object horizontal skewing is locked
     * @type Boolean
     * @default
     */
    lockSkewingX:             false,

    /**
     * When `true`, object vertical skewing is locked
     * @type Boolean
     * @default
     */
    lockSkewingY:             false,

    /**
     * When `true`, object cannot be flipped by scaling into negative values
     * @type Boolean
     * @default
     */
    lockScalingFlip:          false,

    /**
     * When `true`, object is not exported in OBJECT/JSON
     * @since 1.6.3
     * @type Boolean
     * @default
     */
    excludeFromExport:        false,

    /**
     * When `true`, object is cached on an additional canvas.
     * When `false`, object is not cached unless necessary ( clipPath )
     * default to true
     * @since 1.7.0
     * @type Boolean
     * @default true
     */
    objectCaching:            objectCaching,

    /**
     * When `true`, object properties are checked for cache invalidation. In some particular
     * situation you may want this to be disabled ( spray brush, very big, groups)
     * or if your application does not allow you to modify properties for groups child you want
     * to disable it for groups.
     * default to false
     * since 1.7.0
     * @type Boolean
     * @default false
     */
    statefullCache:            false,

    /**
     * When `true`, cache does not get updated during scaling. The picture will get blocky if scaled
     * too much and will be redrawn with correct details at the end of scaling.
     * this setting is performance and application dependant.
     * default to true
     * since 1.7.0
     * @type Boolean
     * @default true
     */
    noScaleCache:              true,

    /**
     * When `false`, the stoke width will scale with the object.
     * When `true`, the stroke will always match the exact pixel size entered for stroke width.
     * this Property does not work on Text classes or drawing call that uses strokeText,fillText methods
     * default to false
     * @since 2.6.0
     * @type Boolean
     * @default false
     * @type Boolean
     * @default false
     */
    strokeUniform:              false,

    /**
     * When set to `true`, object's cache will be rerendered next render call.
     * since 1.7.0
     * @type Boolean
     * @default true
     */
    dirty:                true,

    /**
     * keeps the value of the last hovered corner during mouse move.
     * 0 is no corner, or 'mt', 'ml', 'mtr' etc..
     * It should be private, but there is no harm in using it as
     * a read-only property.
     * @type number|string|any
     * @default 0
     */
    __corner: 0,

    /**
     * Determines if the fill or the stroke is drawn first (one of "fill" or "stroke")
     * @type String
     * @default
     */
    paintFirst:           'fill',

    /**
     * When 'down', object is set to active on mousedown/touchstart
     * When 'up', object is set to active on mouseup/touchend
     * Experimental. Let's see if this breaks anything before supporting officially
     * @private
     * since 4.4.0
     * @type String
     * @default 'down'
     */
    activeOn:           'down',

    /**
     * List of properties to consider when checking if state
     * of an object is changed (fabric.Object#hasStateChanged)
     * as well as for history (undo/redo) purposes
     * @type Array
     */
    stateProperties: (
      'top left width height scaleX scaleY flipX flipY originX originY transformMatrix ' +
      'stroke strokeWidth strokeDashArray strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit ' +
      'angle opacity fill globalCompositeOperation shadow visible backgroundColor ' +
      'skewX skewY fillRule paintFirst clipPath strokeUniform'
    ).split(' '),

    /**
     * List of properties to consider when checking if cache needs refresh
     * Those properties are checked by statefullCache ON ( or lazy mode if we want ) or from single
     * calls to Object.set(key, value). If the key is in this list, the object is marked as dirty
     * and refreshed at the next render
     * @type Array
     */
    cacheProperties: (
      'fill stroke strokeWidth strokeDashArray width height paintFirst strokeUniform' +
      ' strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit backgroundColor clipPath'
    ).split(' '),

    /**
     * List of properties to consider for animating colors.
     * @type Array
     */
    colorProperties: (
      'fill stroke backgroundColor'
    ).split(' '),

    /**
     * a fabricObject that, without stroke define a clipping area with their shape. filled in black
     * the clipPath object gets used when the object has rendered, and the context is placed in the center
     * of the object cacheCanvas.
     * If you want 0,0 of a clipPath to align with an object center, use clipPath.originX/Y to 'center'
     * @type fabric.Object
     */
    clipPath: undefined,

    /**
     * Meaningful ONLY when the object is used as clipPath.
     * if true, the clipPath will make the object clip to the outside of the clipPath
     * since 2.4.0
     * @type boolean
     * @default false
     */
    inverted: false,

    /**
     * Meaningful ONLY when the object is used as clipPath.
     * if true, the clipPath will have its top and left relative to canvas, and will
     * not be influenced by the object transform. This will make the clipPath relative
     * to the canvas, but clipping just a particular object.
     * WARNING this is beta, this feature may change or be renamed.
     * since 2.4.0
     * @type boolean
     * @default false
     */
    absolutePositioned: false,

    /**
     * Constructor
     * @param {Object} [options] Options object
     */
    initialize: function(options) {
      if (options) {
        this.setOptions(options);
      }
    },

    /**
     * Create a the canvas used to keep the cached copy of the object
     * @private
     */
    _createCacheCanvas: function() {
      this._cacheProperties = {};
      this._cacheCanvas = fabric.util.createCanvasElement();
      this._cacheContext = this._cacheCanvas.getContext('2d');
      this._updateCacheCanvas();
      // if canvas gets created, is empty, so dirty.
      this.dirty = true;
    },

    /**
     * Limit the cache dimensions so that X * Y do not cross fabric.perfLimitSizeTotal
     * and each side do not cross fabric.cacheSideLimit
     * those numbers are configurable so that you can get as much detail as you want
     * making bargain with performances.
     * @param {Object} dims
     * @param {Object} dims.width width of canvas
     * @param {Object} dims.height height of canvas
     * @param {Object} dims.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @param {Object} dims.zoomY zoomY zoom value to unscale the canvas before drawing cache
     * @return {Object}.width width of canvas
     * @return {Object}.height height of canvas
     * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
     */
    _limitCacheSize: function(dims) {
      var perfLimitSizeTotal = fabric.perfLimitSizeTotal,
          width = dims.width, height = dims.height,
          max = fabric.maxCacheSideLimit, min = fabric.minCacheSideLimit;
      if (width <= max && height <= max && width * height <= perfLimitSizeTotal) {
        if (width < min) {
          dims.width = min;
        }
        if (height < min) {
          dims.height = min;
        }
        return dims;
      }
      var ar = width / height, limitedDims = fabric.util.limitDimsByArea(ar, perfLimitSizeTotal),
          capValue = fabric.util.capValue,
          x = capValue(min, limitedDims.x, max),
          y = capValue(min, limitedDims.y, max);
      if (width > x) {
        dims.zoomX /= width / x;
        dims.width = x;
        dims.capped = true;
      }
      if (height > y) {
        dims.zoomY /= height / y;
        dims.height = y;
        dims.capped = true;
      }
      return dims;
    },

    /**
     * Return the dimension and the zoom level needed to create a cache canvas
     * big enough to host the object to be cached.
     * @private
     * @return {Object}.x width of object to be cached
     * @return {Object}.y height of object to be cached
     * @return {Object}.width width of canvas
     * @return {Object}.height height of canvas
     * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
     */
    _getCacheCanvasDimensions: function() {
      var objectScale = this.getTotalObjectScaling(),
          // caculate dimensions without skewing
          dim = this._getTransformedDimensions(0, 0),
          neededX = dim.x * objectScale.scaleX / this.scaleX,
          neededY = dim.y * objectScale.scaleY / this.scaleY;
      return {
        // for sure this ALIASING_LIMIT is slightly creating problem
        // in situation in which the cache canvas gets an upper limit
        // also objectScale contains already scaleX and scaleY
        width: neededX + ALIASING_LIMIT,
        height: neededY + ALIASING_LIMIT,
        zoomX: objectScale.scaleX,
        zoomY: objectScale.scaleY,
        x: neededX,
        y: neededY
      };
    },

    /**
     * Update width and height of the canvas for cache
     * returns true or false if canvas needed resize.
     * @private
     * @return {Boolean} true if the canvas has been resized
     */
    _updateCacheCanvas: function() {
      var targetCanvas = this.canvas;
      if (this.noScaleCache && targetCanvas && targetCanvas._currentTransform) {
        var target = targetCanvas._currentTransform.target,
            action = targetCanvas._currentTransform.action;
        if (this === target && action.slice && action.slice(0, 5) === 'scale') {
          return false;
        }
      }
      var canvas = this._cacheCanvas,
          dims = this._limitCacheSize(this._getCacheCanvasDimensions()),
          minCacheSize = fabric.minCacheSideLimit,
          width = dims.width, height = dims.height, drawingWidth, drawingHeight,
          zoomX = dims.zoomX, zoomY = dims.zoomY,
          dimensionsChanged = width !== this.cacheWidth || height !== this.cacheHeight,
          zoomChanged = this.zoomX !== zoomX || this.zoomY !== zoomY,
          shouldRedraw = dimensionsChanged || zoomChanged,
          additionalWidth = 0, additionalHeight = 0, shouldResizeCanvas = false;
      if (dimensionsChanged) {
        var canvasWidth = this._cacheCanvas.width,
            canvasHeight = this._cacheCanvas.height,
            sizeGrowing = width > canvasWidth || height > canvasHeight,
            sizeShrinking = (width < canvasWidth * 0.9 || height < canvasHeight * 0.9) &&
              canvasWidth > minCacheSize && canvasHeight > minCacheSize;
        shouldResizeCanvas = sizeGrowing || sizeShrinking;
        if (sizeGrowing && !dims.capped && (width > minCacheSize || height > minCacheSize)) {
          additionalWidth = width * 0.1;
          additionalHeight = height * 0.1;
        }
      }
      if (this instanceof fabric.Text && this.path) {
        shouldRedraw = true;
        shouldResizeCanvas = true;
        additionalWidth += this.getHeightOfLine(0) * this.zoomX;
        additionalHeight += this.getHeightOfLine(0) * this.zoomY;
      }
      if (shouldRedraw) {
        if (shouldResizeCanvas) {
          canvas.width = Math.ceil(width + additionalWidth);
          canvas.height = Math.ceil(height + additionalHeight);
        }
        else {
          this._cacheContext.setTransform(1, 0, 0, 1, 0, 0);
          this._cacheContext.clearRect(0, 0, canvas.width, canvas.height);
        }
        drawingWidth = dims.x / 2;
        drawingHeight = dims.y / 2;
        this.cacheTranslationX = Math.round(canvas.width / 2 - drawingWidth) + drawingWidth;
        this.cacheTranslationY = Math.round(canvas.height / 2 - drawingHeight) + drawingHeight;
        this.cacheWidth = width;
        this.cacheHeight = height;
        this._cacheContext.translate(this.cacheTranslationX, this.cacheTranslationY);
        this._cacheContext.scale(zoomX, zoomY);
        this.zoomX = zoomX;
        this.zoomY = zoomY;
        return true;
      }
      return false;
    },

    /**
     * Sets object's properties from options
     * @param {Object} [options] Options object
     */
    setOptions: function(options) {
      this._setOptions(options);
      this._initGradient(options.fill, 'fill');
      this._initGradient(options.stroke, 'stroke');
      this._initPattern(options.fill, 'fill');
      this._initPattern(options.stroke, 'stroke');
    },

    /**
     * Transforms context when rendering an object
     * @param {CanvasRenderingContext2D} ctx Context
     */
    transform: function(ctx) {
      var needFullTransform = (this.group && !this.group._transformDone) ||
         (this.group && this.canvas && ctx === this.canvas.contextTop);
      var m = this.calcTransformMatrix(!needFullTransform);
      ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    },

    /**
     * Returns an object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS,

          object = {
            type:                     this.type,
            version:                  fabric.version,
            originX:                  this.originX,
            originY:                  this.originY,
            left:                     toFixed(this.left, NUM_FRACTION_DIGITS),
            top:                      toFixed(this.top, NUM_FRACTION_DIGITS),
            width:                    toFixed(this.width, NUM_FRACTION_DIGITS),
            height:                   toFixed(this.height, NUM_FRACTION_DIGITS),
            fill:                     (this.fill && this.fill.toObject) ? this.fill.toObject() : this.fill,
            stroke:                   (this.stroke && this.stroke.toObject) ? this.stroke.toObject() : this.stroke,
            strokeWidth:              toFixed(this.strokeWidth, NUM_FRACTION_DIGITS),
            strokeDashArray:          this.strokeDashArray ? this.strokeDashArray.concat() : this.strokeDashArray,
            strokeLineCap:            this.strokeLineCap,
            strokeDashOffset:         this.strokeDashOffset,
            strokeLineJoin:           this.strokeLineJoin,
            strokeUniform:            this.strokeUniform,
            strokeMiterLimit:         toFixed(this.strokeMiterLimit, NUM_FRACTION_DIGITS),
            scaleX:                   toFixed(this.scaleX, NUM_FRACTION_DIGITS),
            scaleY:                   toFixed(this.scaleY, NUM_FRACTION_DIGITS),
            angle:                    toFixed(this.angle, NUM_FRACTION_DIGITS),
            flipX:                    this.flipX,
            flipY:                    this.flipY,
            opacity:                  toFixed(this.opacity, NUM_FRACTION_DIGITS),
            shadow:                   (this.shadow && this.shadow.toObject) ? this.shadow.toObject() : this.shadow,
            visible:                  this.visible,
            backgroundColor:          this.backgroundColor,
            fillRule:                 this.fillRule,
            paintFirst:               this.paintFirst,
            globalCompositeOperation: this.globalCompositeOperation,
            skewX:                    toFixed(this.skewX, NUM_FRACTION_DIGITS),
            skewY:                    toFixed(this.skewY, NUM_FRACTION_DIGITS),
          };

      if (this.clipPath && !this.clipPath.excludeFromExport) {
        object.clipPath = this.clipPath.toObject(propertiesToInclude);
        object.clipPath.inverted = this.clipPath.inverted;
        object.clipPath.absolutePositioned = this.clipPath.absolutePositioned;
      }

      fabric.util.populateWithProperties(this, object, propertiesToInclude);
      if (!this.includeDefaultValues) {
        object = this._removeDefaultValues(object);
      }

      return object;
    },

    /**
     * Returns (dataless) object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toDatalessObject: function(propertiesToInclude) {
      // will be overwritten by subclasses
      return this.toObject(propertiesToInclude);
    },

    /**
     * @private
     * @param {Object} object
     */
    _removeDefaultValues: function(object) {
      var prototype = fabric.util.getKlass(object.type).prototype,
          stateProperties = prototype.stateProperties;
      stateProperties.forEach(function(prop) {
        if (prop === 'left' || prop === 'top') {
          return;
        }
        if (object[prop] === prototype[prop]) {
          delete object[prop];
        }
        // basically a check for [] === []
        if (Array.isArray(object[prop]) && Array.isArray(prototype[prop])
          && object[prop].length === 0 && prototype[prop].length === 0) {
          delete object[prop];
        }
      });

      return object;
    },

    /**
     * Returns a string representation of an instance
     * @return {String}
     */
    toString: function() {
      return '#<fabric.' + capitalize(this.type) + '>';
    },

    /**
     * Return the object scale factor counting also the group scaling
     * @return {Object} object with scaleX and scaleY properties
     */
    getObjectScaling: function() {
      // if the object is a top level one, on the canvas, we go for simple aritmetic
      // otherwise the complex method with angles will return approximations and decimals
      // and will likely kill the cache when not needed
      // https://github.com/fabricjs/fabric.js/issues/7157
      if (!this.group) {
        return {
          scaleX: this.scaleX,
          scaleY: this.scaleY,
        };
      }
      // if we are inside a group total zoom calculation is complex, we defer to generic matrices
      var options = fabric.util.qrDecompose(this.calcTransformMatrix());
      return { scaleX: Math.abs(options.scaleX), scaleY: Math.abs(options.scaleY) };
    },

    /**
     * Return the object scale factor counting also the group scaling, zoom and retina
     * @return {Object} object with scaleX and scaleY properties
     */
    getTotalObjectScaling: function() {
      var scale = this.getObjectScaling(), scaleX = scale.scaleX, scaleY = scale.scaleY;
      if (this.canvas) {
        var zoom = this.canvas.getZoom();
        var retina = this.canvas.getRetinaScaling();
        scaleX *= zoom * retina;
        scaleY *= zoom * retina;
      }
      return { scaleX: scaleX, scaleY: scaleY };
    },

    /**
     * Return the object opacity counting also the group property
     * @return {Number}
     */
    getObjectOpacity: function() {
      var opacity = this.opacity;
      if (this.group) {
        opacity *= this.group.getObjectOpacity();
      }
      return opacity;
    },

    /**
     * @private
     * @param {String} key
     * @param {*} value
     * @return {fabric.Object} thisArg
     */
    _set: function(key, value) {
      var shouldConstrainValue = (key === 'scaleX' || key === 'scaleY'),
          isChanged = this[key] !== value, groupNeedsUpdate = false;

      if (shouldConstrainValue) {
        value = this._constrainScale(value);
      }
      if (key === 'scaleX' && value < 0) {
        this.flipX = !this.flipX;
        value *= -1;
      }
      else if (key === 'scaleY' && value < 0) {
        this.flipY = !this.flipY;
        value *= -1;
      }
      else if (key === 'shadow' && value && !(value instanceof fabric.Shadow)) {
        value = new fabric.Shadow(value);
      }
      else if (key === 'dirty' && this.group) {
        this.group.set('dirty', value);
      }

      this[key] = value;

      if (isChanged) {
        groupNeedsUpdate = this.group && this.group.isOnACache();
        if (this.cacheProperties.indexOf(key) > -1) {
          this.dirty = true;
          groupNeedsUpdate && this.group.set('dirty', true);
        }
        else if (groupNeedsUpdate && this.stateProperties.indexOf(key) > -1) {
          this.group.set('dirty', true);
        }
      }
      return this;
    },

    /**
     * This callback function is called by the parent group of an object every
     * time a non-delegated property changes on the group. It is passed the key
     * and value as parameters. Not adding in this function's signature to avoid
     * Travis build error about unused variables.
     */
    setOnGroup: function() {
      // implemented by sub-classes, as needed.
    },

    /**
     * Retrieves viewportTransform from Object's canvas if possible
     * @method getViewportTransform
     * @memberOf fabric.Object.prototype
     * @return {Array}
     */
    getViewportTransform: function() {
      if (this.canvas && this.canvas.viewportTransform) {
        return this.canvas.viewportTransform;
      }
      return fabric.iMatrix.concat();
    },

    /*
     * @private
     * return if the object would be visible in rendering
     * @memberOf fabric.Object.prototype
     * @return {Boolean}
     */
    isNotVisible: function() {
      return this.opacity === 0 ||
        (!this.width && !this.height && this.strokeWidth === 0) ||
        !this.visible;
    },

    /**
     * Renders an object on a specified context
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    render: function(ctx) {
      // do not render if width/height are zeros or object is not visible
      if (this.isNotVisible()) {
        return;
      }
      if (this.canvas && this.canvas.skipOffscreen && !this.group && !this.isOnScreen()) {
        return;
      }
      ctx.save();
      this._setupCompositeOperation(ctx);
      this.drawSelectionBackground(ctx);
      this.transform(ctx);
      this._setOpacity(ctx);
      this._setShadow(ctx, this);
      if (this.shouldCache()) {
        this.renderCache();
        this.drawCacheOnCanvas(ctx);
      }
      else {
        this._removeCacheCanvas();
        this.dirty = false;
        this.drawObject(ctx);
        if (this.objectCaching && this.statefullCache) {
          this.saveState({ propertySet: 'cacheProperties' });
        }
      }
      ctx.restore();
    },

    renderCache: function(options) {
      options = options || {};
      if (!this._cacheCanvas || !this._cacheContext) {
        this._createCacheCanvas();
      }
      if (this.isCacheDirty()) {
        this.statefullCache && this.saveState({ propertySet: 'cacheProperties' });
        this.drawObject(this._cacheContext, options.forClipping);
        this.dirty = false;
      }
    },

    /**
     * Remove cacheCanvas and its dimensions from the objects
     */
    _removeCacheCanvas: function() {
      this._cacheCanvas = null;
      this._cacheContext = null;
      this.cacheWidth = 0;
      this.cacheHeight = 0;
    },

    /**
     * return true if the object will draw a stroke
     * Does not consider text styles. This is just a shortcut used at rendering time
     * We want it to be an approximation and be fast.
     * wrote to avoid extra caching, it has to return true when stroke happens,
     * can guess when it will not happen at 100% chance, does not matter if it misses
     * some use case where the stroke is invisible.
     * @since 3.0.0
     * @returns Boolean
     */
    hasStroke: function() {
      return this.stroke && this.stroke !== 'transparent' && this.strokeWidth !== 0;
    },

    /**
     * return true if the object will draw a fill
     * Does not consider text styles. This is just a shortcut used at rendering time
     * We want it to be an approximation and be fast.
     * wrote to avoid extra caching, it has to return true when fill happens,
     * can guess when it will not happen at 100% chance, does not matter if it misses
     * some use case where the fill is invisible.
     * @since 3.0.0
     * @returns Boolean
     */
    hasFill: function() {
      return this.fill && this.fill !== 'transparent';
    },

    /**
     * When set to `true`, force the object to have its own cache, even if it is inside a group
     * it may be needed when your object behave in a particular way on the cache and always needs
     * its own isolated canvas to render correctly.
     * Created to be overridden
     * since 1.7.12
     * @returns Boolean
     */
    needsItsOwnCache: function() {
      if (this.paintFirst === 'stroke' &&
        this.hasFill() && this.hasStroke() && typeof this.shadow === 'object') {
        return true;
      }
      if (this.clipPath) {
        return true;
      }
      return false;
    },

    /**
     * Decide if the object should cache or not. Create its own cache level
     * objectCaching is a global flag, wins over everything
     * needsItsOwnCache should be used when the object drawing method requires
     * a cache step. None of the fabric classes requires it.
     * Generally you do not cache objects in groups because the group outside is cached.
     * Read as: cache if is needed, or if the feature is enabled but we are not already caching.
     * @return {Boolean}
     */
    shouldCache: function() {
      this.ownCaching = this.needsItsOwnCache() || (
        this.objectCaching &&
        (!this.group || !this.group.isOnACache())
      );
      return this.ownCaching;
    },

    /**
     * Check if this object or a child object will cast a shadow
     * used by Group.shouldCache to know if child has a shadow recursively
     * @return {Boolean}
     */
    willDrawShadow: function() {
      return !!this.shadow && (this.shadow.offsetX !== 0 || this.shadow.offsetY !== 0);
    },

    /**
     * Execute the drawing operation for an object clipPath
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {fabric.Object} clipPath
     */
    drawClipPathOnCache: function(ctx, clipPath) {
      ctx.save();
      // DEBUG: uncomment this line, comment the following
      // ctx.globalAlpha = 0.4
      if (clipPath.inverted) {
        ctx.globalCompositeOperation = 'destination-out';
      }
      else {
        ctx.globalCompositeOperation = 'destination-in';
      }
      //ctx.scale(1 / 2, 1 / 2);
      if (clipPath.absolutePositioned) {
        var m = fabric.util.invertTransform(this.calcTransformMatrix());
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      }
      clipPath.transform(ctx);
      ctx.scale(1 / clipPath.zoomX, 1 / clipPath.zoomY);
      ctx.drawImage(clipPath._cacheCanvas, -clipPath.cacheTranslationX, -clipPath.cacheTranslationY);
      ctx.restore();
    },

    /**
     * Execute the drawing operation for an object on a specified context
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawObject: function(ctx, forClipping) {
      var originalFill = this.fill, originalStroke = this.stroke;
      if (forClipping) {
        this.fill = 'black';
        this.stroke = '';
        this._setClippingProperties(ctx);
      }
      else {
        this._renderBackground(ctx);
      }
      this._render(ctx);
      this._drawClipPath(ctx, this.clipPath);
      this.fill = originalFill;
      this.stroke = originalStroke;
    },

    /**
     * Prepare clipPath state and cache and draw it on instance's cache
     * @param {CanvasRenderingContext2D} ctx
     * @param {fabric.Object} clipPath
     */
    _drawClipPath: function (ctx, clipPath) {
      if (!clipPath) { return; }
      // needed to setup a couple of variables
      // path canvas gets overridden with this one.
      // TODO find a better solution?
      clipPath.canvas = this.canvas;
      clipPath.shouldCache();
      clipPath._transformDone = true;
      clipPath.renderCache({ forClipping: true });
      this.drawClipPathOnCache(ctx, clipPath);
    },

    /**
     * Paint the cached copy of the object on the target context.
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawCacheOnCanvas: function(ctx) {
      ctx.scale(1 / this.zoomX, 1 / this.zoomY);
      ctx.drawImage(this._cacheCanvas, -this.cacheTranslationX, -this.cacheTranslationY);
    },

    /**
     * Check if cache is dirty
     * @param {Boolean} skipCanvas skip canvas checks because this object is painted
     * on parent canvas.
     */
    isCacheDirty: function(skipCanvas) {
      if (this.isNotVisible()) {
        return false;
      }
      if (this._cacheCanvas && this._cacheContext && !skipCanvas && this._updateCacheCanvas()) {
        // in this case the context is already cleared.
        return true;
      }
      else {
        if (this.dirty ||
          (this.clipPath && this.clipPath.absolutePositioned) ||
          (this.statefullCache && this.hasStateChanged('cacheProperties'))
        ) {
          if (this._cacheCanvas && this._cacheContext && !skipCanvas) {
            var width = this.cacheWidth / this.zoomX;
            var height = this.cacheHeight / this.zoomY;
            this._cacheContext.clearRect(-width / 2, -height / 2, width, height);
          }
          return true;
        }
      }
      return false;
    },

    /**
     * Draws a background for the object big as its untransformed dimensions
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderBackground: function(ctx) {
      if (!this.backgroundColor) {
        return;
      }
      var dim = this._getNonTransformedDimensions();
      ctx.fillStyle = this.backgroundColor;

      ctx.fillRect(
        -dim.x / 2,
        -dim.y / 2,
        dim.x,
        dim.y
      );
      // if there is background color no other shadows
      // should be casted
      this._removeShadow(ctx);
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _setOpacity: function(ctx) {
      if (this.group && !this.group._transformDone) {
        ctx.globalAlpha = this.getObjectOpacity();
      }
      else {
        ctx.globalAlpha *= this.opacity;
      }
    },

    _setStrokeStyles: function(ctx, decl) {
      var stroke = decl.stroke;
      if (stroke) {
        ctx.lineWidth = decl.strokeWidth;
        ctx.lineCap = decl.strokeLineCap;
        ctx.lineDashOffset = decl.strokeDashOffset;
        ctx.lineJoin = decl.strokeLineJoin;
        ctx.miterLimit = decl.strokeMiterLimit;
        if (stroke.toLive) {
          if (stroke.gradientUnits === 'percentage' || stroke.gradientTransform || stroke.patternTransform) {
            // need to transform gradient in a pattern.
            // this is a slow process. If you are hitting this codepath, and the object
            // is not using caching, you should consider switching it on.
            // we need a canvas as big as the current object caching canvas.
            this._applyPatternForTransformedGradient(ctx, stroke);
          }
          else {
            // is a simple gradient or pattern
            ctx.strokeStyle = stroke.toLive(ctx, this);
            this._applyPatternGradientTransform(ctx, stroke);
          }
        }
        else {
          // is a color
          ctx.strokeStyle = decl.stroke;
        }
      }
    },

    _setFillStyles: function(ctx, decl) {
      var fill = decl.fill;
      if (fill) {
        if (fill.toLive) {
          ctx.fillStyle = fill.toLive(ctx, this);
          this._applyPatternGradientTransform(ctx, decl.fill);
        }
        else {
          ctx.fillStyle = fill;
        }
      }
    },

    _setClippingProperties: function(ctx) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'transparent';
      ctx.fillStyle = '#000000';
    },

    /**
     * @private
     * Sets line dash
     * @param {CanvasRenderingContext2D} ctx Context to set the dash line on
     * @param {Array} dashArray array representing dashes
     */
    _setLineDash: function(ctx, dashArray) {
      if (!dashArray || dashArray.length === 0) {
        return;
      }
      // Spec requires the concatenation of two copies the dash list when the number of elements is odd
      if (1 & dashArray.length) {
        dashArray.push.apply(dashArray, dashArray);
      }
      ctx.setLineDash(dashArray);
    },

    /**
     * Renders controls and borders for the object
     * the context here is not transformed
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} [styleOverride] properties to override the object style
     */
    _renderControls: function(ctx, styleOverride) {
      var vpt = this.getViewportTransform(),
          matrix = this.calcTransformMatrix(),
          options, drawBorders, drawControls;
      styleOverride = styleOverride || { };
      drawBorders = typeof styleOverride.hasBorders !== 'undefined' ? styleOverride.hasBorders : this.hasBorders;
      drawControls = typeof styleOverride.hasControls !== 'undefined' ? styleOverride.hasControls : this.hasControls;
      matrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
      options = fabric.util.qrDecompose(matrix);
      ctx.save();
      ctx.translate(options.translateX, options.translateY);
      ctx.lineWidth = 1 * this.borderScaleFactor;
      if (!this.group) {
        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
      }
      if (this.flipX) {
        options.angle -= 180;
      }
      ctx.rotate(degreesToRadians(this.group ? options.angle : this.angle));
      if (styleOverride.forActiveSelection || this.group) {
        drawBorders && this.drawBordersInGroup(ctx, options, styleOverride);
      }
      else {
        drawBorders && this.drawBorders(ctx, styleOverride);
      }
      drawControls && this.drawControls(ctx, styleOverride);
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _setShadow: function(ctx) {
      if (!this.shadow) {
        return;
      }

      var shadow = this.shadow, canvas = this.canvas, scaling,
          multX = (canvas && canvas.viewportTransform[0]) || 1,
          multY = (canvas && canvas.viewportTransform[3]) || 1;
      if (shadow.nonScaling) {
        scaling = { scaleX: 1, scaleY: 1 };
      }
      else {
        scaling = this.getObjectScaling();
      }
      if (canvas && canvas._isRetinaScaling()) {
        multX *= fabric.devicePixelRatio;
        multY *= fabric.devicePixelRatio;
      }
      ctx.shadowColor = shadow.color;
      ctx.shadowBlur = shadow.blur * fabric.browserShadowBlurConstant *
        (multX + multY) * (scaling.scaleX + scaling.scaleY) / 4;
      ctx.shadowOffsetX = shadow.offsetX * multX * scaling.scaleX;
      ctx.shadowOffsetY = shadow.offsetY * multY * scaling.scaleY;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _removeShadow: function(ctx) {
      if (!this.shadow) {
        return;
      }

      ctx.shadowColor = '';
      ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} filler fabric.Pattern or fabric.Gradient
     * @return {Object} offset.offsetX offset for text rendering
     * @return {Object} offset.offsetY offset for text rendering
     */
    _applyPatternGradientTransform: function(ctx, filler) {
      if (!filler || !filler.toLive) {
        return { offsetX: 0, offsetY: 0 };
      }
      var t = filler.gradientTransform || filler.patternTransform;
      var offsetX = -this.width / 2 + filler.offsetX || 0,
          offsetY = -this.height / 2 + filler.offsetY || 0;

      if (filler.gradientUnits === 'percentage') {
        ctx.transform(this.width, 0, 0, this.height, offsetX, offsetY);
      }
      else {
        ctx.transform(1, 0, 0, 1, offsetX, offsetY);
      }
      if (t) {
        ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
      }
      return { offsetX: offsetX, offsetY: offsetY };
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderPaintInOrder: function(ctx) {
      if (this.paintFirst === 'stroke') {
        this._renderStroke(ctx);
        this._renderFill(ctx);
      }
      else {
        this._renderFill(ctx);
        this._renderStroke(ctx);
      }
    },

    /**
     * @private
     * function that actually render something on the context.
     * empty here to allow Obects to work on tests to benchmark fabric functionalites
     * not related to rendering
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function(/* ctx */) {

    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderFill: function(ctx) {
      if (!this.fill) {
        return;
      }

      ctx.save();
      this._setFillStyles(ctx, this);
      if (this.fillRule === 'evenodd') {
        ctx.fill('evenodd');
      }
      else {
        ctx.fill();
      }
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderStroke: function(ctx) {
      if (!this.stroke || this.strokeWidth === 0) {
        return;
      }

      if (this.shadow && !this.shadow.affectStroke) {
        this._removeShadow(ctx);
      }

      ctx.save();
      if (this.strokeUniform && this.group) {
        var scaling = this.getObjectScaling();
        ctx.scale(1 / scaling.scaleX, 1 / scaling.scaleY);
      }
      else if (this.strokeUniform) {
        ctx.scale(1 / this.scaleX, 1 / this.scaleY);
      }
      this._setLineDash(ctx, this.strokeDashArray);
      this._setStrokeStyles(ctx, this);
      ctx.stroke();
      ctx.restore();
    },

    /**
     * This function try to patch the missing gradientTransform on canvas gradients.
     * transforming a context to transform the gradient, is going to transform the stroke too.
     * we want to transform the gradient but not the stroke operation, so we create
     * a transformed gradient on a pattern and then we use the pattern instead of the gradient.
     * this method has drwabacks: is slow, is in low resolution, needs a patch for when the size
     * is limited.
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {fabric.Gradient} filler a fabric gradient instance
     */
    _applyPatternForTransformedGradient: function(ctx, filler) {
      var dims = this._limitCacheSize(this._getCacheCanvasDimensions()),
          pCanvas = fabric.util.createCanvasElement(), pCtx, retinaScaling = this.canvas.getRetinaScaling(),
          width = dims.x / this.scaleX / retinaScaling, height = dims.y / this.scaleY / retinaScaling;
      pCanvas.width = width;
      pCanvas.height = height;
      pCtx = pCanvas.getContext('2d');
      pCtx.beginPath(); pCtx.moveTo(0, 0); pCtx.lineTo(width, 0); pCtx.lineTo(width, height);
      pCtx.lineTo(0, height); pCtx.closePath();
      pCtx.translate(width / 2, height / 2);
      pCtx.scale(
        dims.zoomX / this.scaleX / retinaScaling,
        dims.zoomY / this.scaleY / retinaScaling
      );
      this._applyPatternGradientTransform(pCtx, filler);
      pCtx.fillStyle = filler.toLive(ctx);
      pCtx.fill();
      ctx.translate(-this.width / 2 - this.strokeWidth / 2, -this.height / 2 - this.strokeWidth / 2);
      ctx.scale(
        retinaScaling * this.scaleX / dims.zoomX,
        retinaScaling * this.scaleY / dims.zoomY
      );
      ctx.strokeStyle = pCtx.createPattern(pCanvas, 'no-repeat');
    },

    /**
     * This function is an helper for svg import. it returns the center of the object in the svg
     * untransformed coordinates
     * @private
     * @return {Object} center point from element coordinates
     */
    _findCenterFromElement: function() {
      return { x: this.left + this.width / 2, y: this.top + this.height / 2 };
    },

    /**
     * This function is an helper for svg import. it decompose the transformMatrix
     * and assign properties to object.
     * untransformed coordinates
     * @private
     * @chainable
     */
    _assignTransformMatrixProps: function() {
      if (this.transformMatrix) {
        var options = fabric.util.qrDecompose(this.transformMatrix);
        this.flipX = false;
        this.flipY = false;
        this.set('scaleX', options.scaleX);
        this.set('scaleY', options.scaleY);
        this.angle = options.angle;
        this.skewX = options.skewX;
        this.skewY = 0;
      }
    },

    /**
     * This function is an helper for svg import. it removes the transform matrix
     * and set to object properties that fabricjs can handle
     * @private
     * @param {Object} preserveAspectRatioOptions
     * @return {thisArg}
     */
    _removeTransformMatrix: function(preserveAspectRatioOptions) {
      var center = this._findCenterFromElement();
      if (this.transformMatrix) {
        this._assignTransformMatrixProps();
        center = fabric.util.transformPoint(center, this.transformMatrix);
      }
      this.transformMatrix = null;
      if (preserveAspectRatioOptions) {
        this.scaleX *= preserveAspectRatioOptions.scaleX;
        this.scaleY *= preserveAspectRatioOptions.scaleY;
        this.cropX = preserveAspectRatioOptions.cropX;
        this.cropY = preserveAspectRatioOptions.cropY;
        center.x += preserveAspectRatioOptions.offsetLeft;
        center.y += preserveAspectRatioOptions.offsetTop;
        this.width = preserveAspectRatioOptions.width;
        this.height = preserveAspectRatioOptions.height;
      }
      this.setPositionByOrigin(center, 'center', 'center');
    },

    /**
     * Clones an instance, using a callback method will work for every object.
     * @param {Function} callback Callback is invoked with a clone as a first argument
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     */
    clone: function(callback, propertiesToInclude) {
      var objectForm = this.toObject(propertiesToInclude);
      if (this.constructor.fromObject) {
        this.constructor.fromObject(objectForm, callback);
      }
      else {
        fabric.Object._fromObject('Object', objectForm, callback);
      }
    },

    /**
     * Creates an instance of fabric.Image out of an object
     * makes use of toCanvasElement.
     * Once this method was based on toDataUrl and loadImage, so it also had a quality
     * and format option. toCanvasElement is faster and produce no loss of quality.
     * If you need to get a real Jpeg or Png from an object, using toDataURL is the right way to do it.
     * toCanvasElement and then toBlob from the obtained canvas is also a good option.
     * This method is sync now, but still support the callback because we did not want to break.
     * When fabricJS 5.0 will be planned, this will probably be changed to not have a callback.
     * @param {Function} callback callback, invoked with an instance as a first argument
     * @param {Object} [options] for clone as image, passed to toDataURL
     * @param {Number} [options.multiplier=1] Multiplier to scale by
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
     * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
     * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
     * @return {fabric.Object} thisArg
     */
    cloneAsImage: function(callback, options) {
      var canvasEl = this.toCanvasElement(options);
      if (callback) {
        callback(new fabric.Image(canvasEl));
      }
      return this;
    },

    /**
     * Converts an object into a HTMLCanvas element
     * @param {Object} options Options object
     * @param {Number} [options.multiplier=1] Multiplier to scale by
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
     * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
     * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
     * @return {HTMLCanvasElement} Returns DOM element <canvas> with the fabric.Object
     */
    toCanvasElement: function(options) {
      options || (options = { });

      var utils = fabric.util, origParams = utils.saveObjectTransform(this),
          originalGroup = this.group,
          originalShadow = this.shadow, abs = Math.abs,
          multiplier = (options.multiplier || 1) * (options.enableRetinaScaling ? fabric.devicePixelRatio : 1);
      delete this.group;
      if (options.withoutTransform) {
        utils.resetObjectTransform(this);
      }
      if (options.withoutShadow) {
        this.shadow = null;
      }

      var el = fabric.util.createCanvasElement(),
          // skip canvas zoom and calculate with setCoords now.
          boundingRect = this.getBoundingRect(true, true),
          shadow = this.shadow, scaling,
          shadowOffset = { x: 0, y: 0 }, shadowBlur,
          width, height;

      if (shadow) {
        shadowBlur = shadow.blur;
        if (shadow.nonScaling) {
          scaling = { scaleX: 1, scaleY: 1 };
        }
        else {
          scaling = this.getObjectScaling();
        }
        // consider non scaling shadow.
        shadowOffset.x = 2 * Math.round(abs(shadow.offsetX) + shadowBlur) * (abs(scaling.scaleX));
        shadowOffset.y = 2 * Math.round(abs(shadow.offsetY) + shadowBlur) * (abs(scaling.scaleY));
      }
      width = boundingRect.width + shadowOffset.x;
      height = boundingRect.height + shadowOffset.y;
      // if the current width/height is not an integer
      // we need to make it so.
      el.width = Math.ceil(width);
      el.height = Math.ceil(height);
      var canvas = new fabric.StaticCanvas(el, {
        enableRetinaScaling: false,
        renderOnAddRemove: false,
        skipOffscreen: false,
      });
      if (options.format === 'jpeg') {
        canvas.backgroundColor = '#fff';
      }
      this.setPositionByOrigin(new fabric.Point(canvas.width / 2, canvas.height / 2), 'center', 'center');

      var originalCanvas = this.canvas;
      canvas.add(this);
      var canvasEl = canvas.toCanvasElement(multiplier || 1, options);
      this.shadow = originalShadow;
      this.set('canvas', originalCanvas);
      if (originalGroup) {
        this.group = originalGroup;
      }
      this.set(origParams).setCoords();
      // canvas.dispose will call image.dispose that will nullify the elements
      // since this canvas is a simple element for the process, we remove references
      // to objects in this way in order to avoid object trashing.
      canvas._objects = [];
      canvas.dispose();
      canvas = null;

      return canvasEl;
    },

    /**
     * Converts an object into a data-url-like string
     * @param {Object} options Options object
     * @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
     * @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
     * @param {Number} [options.multiplier=1] Multiplier to scale by
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
     * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
     * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
     * @return {String} Returns a data: URL containing a representation of the object in the format specified by options.format
     */
    toDataURL: function(options) {
      options || (options = { });
      return fabric.util.toDataURL(this.toCanvasElement(options), options.format || 'png', options.quality || 1);
    },

    /**
     * Returns true if specified type is identical to the type of an instance
     * @param {String} type Type to check against
     * @return {Boolean}
     */
    isType: function(type) {
      return arguments.length > 1 ? Array.from(arguments).includes(this.type) : this.type === type;
    },

    /**
     * Returns complexity of an instance
     * @return {Number} complexity of this instance (is 1 unless subclassed)
     */
    complexity: function() {
      return 1;
    },

    /**
     * Returns a JSON representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} JSON
     */
    toJSON: function(propertiesToInclude) {
      // delegate, not alias
      return this.toObject(propertiesToInclude);
    },

    /**
     * Sets "angle" of an instance with centered rotation
     * @param {Number} angle Angle value (in degrees)
     * @return {fabric.Object} thisArg
     * @chainable
     */
    rotate: function(angle) {
      var shouldCenterOrigin = (this.originX !== 'center' || this.originY !== 'center') && this.centeredRotation;

      if (shouldCenterOrigin) {
        this._setOriginToCenter();
      }

      this.set('angle', angle);

      if (shouldCenterOrigin) {
        this._resetOrigin();
      }

      return this;
    },

    /**
     * Centers object horizontally on canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    centerH: function () {
      this.canvas && this.canvas.centerObjectH(this);
      return this;
    },

    /**
     * Centers object horizontally on current viewport of canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    viewportCenterH: function () {
      this.canvas && this.canvas.viewportCenterObjectH(this);
      return this;
    },

    /**
     * Centers object vertically on canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    centerV: function () {
      this.canvas && this.canvas.centerObjectV(this);
      return this;
    },

    /**
     * Centers object vertically on current viewport of canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    viewportCenterV: function () {
      this.canvas && this.canvas.viewportCenterObjectV(this);
      return this;
    },

    /**
     * Centers object vertically and horizontally on canvas to which is was added last
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    center: function () {
      this.canvas && this.canvas.centerObject(this);
      return this;
    },

    /**
     * Centers object on current viewport of canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    viewportCenter: function () {
      this.canvas && this.canvas.viewportCenterObject(this);
      return this;
    },

    /**
     * Returns coordinates of a pointer relative to an object
     * @param {Event} e Event to operate upon
     * @param {Object} [pointer] Pointer to operate upon (instead of event)
     * @return {Object} Coordinates of a pointer (x, y)
     */
    getLocalPointer: function(e, pointer) {
      pointer = pointer || this.canvas.getPointer(e);
      var pClicked = new fabric.Point(pointer.x, pointer.y),
          objectLeftTop = this._getLeftTopCoords();
      if (this.angle) {
        pClicked = fabric.util.rotatePoint(
          pClicked, objectLeftTop, degreesToRadians(-this.angle));
      }
      return {
        x: pClicked.x - objectLeftTop.x,
        y: pClicked.y - objectLeftTop.y
      };
    },

    /**
     * Sets canvas globalCompositeOperation for specific object
     * custom composition operation for the particular object can be specified using globalCompositeOperation property
     * @param {CanvasRenderingContext2D} ctx Rendering canvas context
     */
    _setupCompositeOperation: function (ctx) {
      if (this.globalCompositeOperation) {
        ctx.globalCompositeOperation = this.globalCompositeOperation;
      }
    },

    /**
     * cancel instance's running animations
     * override if necessary to dispose artifacts such as `clipPath`
     */
    dispose: function () {
      if (fabric.runningAnimations) {
        fabric.runningAnimations.cancelByTarget(this);
      }
    }
  });

  fabric.util.createAccessors && fabric.util.createAccessors(fabric.Object);

  extend(fabric.Object.prototype, fabric.Observable);

  /**
   * Defines the number of fraction digits to use when serializing object values.
   * You can use it to increase/decrease precision of such values like left, top, scaleX, scaleY, etc.
   * @static
   * @memberOf fabric.Object
   * @constant
   * @type Number
   */
  fabric.Object.NUM_FRACTION_DIGITS = 2;

  /**
   * Defines which properties should be enlivened from the object passed to {@link fabric.Object._fromObject}
   * @static
   * @memberOf fabric.Object
   * @constant
   * @type string[]
   */
  fabric.Object.ENLIVEN_PROPS = ['clipPath'];

  fabric.Object._fromObject = function(className, object, callback, extraParam) {
    var klass = fabric[className];
    object = clone(object, true);
    fabric.util.enlivenPatterns([object.fill, object.stroke], function(patterns) {
      if (typeof patterns[0] !== 'undefined') {
        object.fill = patterns[0];
      }
      if (typeof patterns[1] !== 'undefined') {
        object.stroke = patterns[1];
      }
      fabric.util.enlivenObjectEnlivables(object, object, function () {
        var instance = extraParam ? new klass(object[extraParam], object) : new klass(object);
        callback && callback(instance);
      });
    });
  };

  /**
   * Unique id used internally when creating SVG elements
   * @static
   * @memberOf fabric.Object
   * @type Number
   */
  fabric.Object.__uid = 0;
})(typeof exports !== 'undefined' ? exports : this);
(function() {

  var degreesToRadians = fabric.util.degreesToRadians,
      originXOffset = {
        left: -0.5,
        center: 0,
        right: 0.5
      },
      originYOffset = {
        top: -0.5,
        center: 0,
        bottom: 0.5
      };

  fabric.util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {

    /**
     * Translates the coordinates from a set of origin to another (based on the object's dimensions)
     * @param {fabric.Point} point The point which corresponds to the originX and originY params
     * @param {String} fromOriginX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} fromOriginY Vertical origin: 'top', 'center' or 'bottom'
     * @param {String} toOriginX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} toOriginY Vertical origin: 'top', 'center' or 'bottom'
     * @return {fabric.Point}
     */
    translateToGivenOrigin: function(point, fromOriginX, fromOriginY, toOriginX, toOriginY) {
      var x = point.x,
          y = point.y,
          offsetX, offsetY, dim;

      if (typeof fromOriginX === 'string') {
        fromOriginX = originXOffset[fromOriginX];
      }
      else {
        fromOriginX -= 0.5;
      }

      if (typeof toOriginX === 'string') {
        toOriginX = originXOffset[toOriginX];
      }
      else {
        toOriginX -= 0.5;
      }

      offsetX = toOriginX - fromOriginX;

      if (typeof fromOriginY === 'string') {
        fromOriginY = originYOffset[fromOriginY];
      }
      else {
        fromOriginY -= 0.5;
      }

      if (typeof toOriginY === 'string') {
        toOriginY = originYOffset[toOriginY];
      }
      else {
        toOriginY -= 0.5;
      }

      offsetY = toOriginY - fromOriginY;

      if (offsetX || offsetY) {
        dim = this._getTransformedDimensions();
        x = point.x + offsetX * dim.x;
        y = point.y + offsetY * dim.y;
      }

      return new fabric.Point(x, y);
    },

    /**
     * Translates the coordinates from origin to center coordinates (based on the object's dimensions)
     * @param {fabric.Point} point The point which corresponds to the originX and originY params
     * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
     * @return {fabric.Point}
     */
    translateToCenterPoint: function(point, originX, originY) {
      var p = this.translateToGivenOrigin(point, originX, originY, 'center', 'center');
      if (this.angle) {
        return fabric.util.rotatePoint(p, point, degreesToRadians(this.angle));
      }
      return p;
    },

    /**
     * Translates the coordinates from center to origin coordinates (based on the object's dimensions)
     * @param {fabric.Point} center The point which corresponds to center of the object
     * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
     * @return {fabric.Point}
     */
    translateToOriginPoint: function(center, originX, originY) {
      var p = this.translateToGivenOrigin(center, 'center', 'center', originX, originY);
      if (this.angle) {
        return fabric.util.rotatePoint(p, center, degreesToRadians(this.angle));
      }
      return p;
    },

    /**
     * Returns the real center coordinates of the object
     * @return {fabric.Point}
     */
    getCenterPoint: function() {
      var leftTop = new fabric.Point(this.left, this.top);
      return this.translateToCenterPoint(leftTop, this.originX, this.originY);
    },

    /**
     * Returns the coordinates of the object based on center coordinates
     * @param {fabric.Point} point The point which corresponds to the originX and originY params
     * @return {fabric.Point}
     */
    // getOriginPoint: function(center) {
    //   return this.translateToOriginPoint(center, this.originX, this.originY);
    // },

    /**
     * Returns the coordinates of the object as if it has a different origin
     * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
     * @return {fabric.Point}
     */
    getPointByOrigin: function(originX, originY) {
      var center = this.getCenterPoint();
      return this.translateToOriginPoint(center, originX, originY);
    },

    /**
     * Returns the point in local coordinates
     * @param {fabric.Point} point The point relative to the global coordinate system
     * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
     * @return {fabric.Point}
     */
    toLocalPoint: function(point, originX, originY) {
      var center = this.getCenterPoint(),
          p, p2;

      if (typeof originX !== 'undefined' && typeof originY !== 'undefined' ) {
        p = this.translateToGivenOrigin(center, 'center', 'center', originX, originY);
      }
      else {
        p = new fabric.Point(this.left, this.top);
      }

      p2 = new fabric.Point(point.x, point.y);
      if (this.angle) {
        p2 = fabric.util.rotatePoint(p2, center, -degreesToRadians(this.angle));
      }
      return p2.subtractEquals(p);
    },

    /**
     * Returns the point in global coordinates
     * @param {fabric.Point} The point relative to the local coordinate system
     * @return {fabric.Point}
     */
    // toGlobalPoint: function(point) {
    //   return fabric.util.rotatePoint(point, this.getCenterPoint(), degreesToRadians(this.angle)).addEquals(new fabric.Point(this.left, this.top));
    // },

    /**
     * Sets the position of the object taking into consideration the object's origin
     * @param {fabric.Point} pos The new position of the object
     * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
     * @return {void}
     */
    setPositionByOrigin: function(pos, originX, originY) {
      var center = this.translateToCenterPoint(pos, originX, originY),
          position = this.translateToOriginPoint(center, this.originX, this.originY);
      this.set('left', position.x);
      this.set('top', position.y);
    },

    /**
     * @param {String} to One of 'left', 'center', 'right'
     */
    adjustPosition: function(to) {
      var angle = degreesToRadians(this.angle),
          hypotFull = this.getScaledWidth(),
          xFull = fabric.util.cos(angle) * hypotFull,
          yFull = fabric.util.sin(angle) * hypotFull,
          offsetFrom, offsetTo;

      //TODO: this function does not consider mixed situation like top, center.
      if (typeof this.originX === 'string') {
        offsetFrom = originXOffset[this.originX];
      }
      else {
        offsetFrom = this.originX - 0.5;
      }
      if (typeof to === 'string') {
        offsetTo = originXOffset[to];
      }
      else {
        offsetTo = to - 0.5;
      }
      this.left += xFull * (offsetTo - offsetFrom);
      this.top += yFull * (offsetTo - offsetFrom);
      this.setCoords();
      this.originX = to;
    },

    /**
     * Sets the origin/position of the object to it's center point
     * @private
     * @return {void}
     */
    _setOriginToCenter: function() {
      this._originalOriginX = this.originX;
      this._originalOriginY = this.originY;

      var center = this.getCenterPoint();

      this.originX = 'center';
      this.originY = 'center';

      this.left = center.x;
      this.top = center.y;
    },

    /**
     * Resets the origin/position of the object to it's original origin
     * @private
     * @return {void}
     */
    _resetOrigin: function() {
      var originPoint = this.translateToOriginPoint(
        this.getCenterPoint(),
        this._originalOriginX,
        this._originalOriginY);

      this.originX = this._originalOriginX;
      this.originY = this._originalOriginY;

      this.left = originPoint.x;
      this.top = originPoint.y;

      this._originalOriginX = null;
      this._originalOriginY = null;
    },

    /**
     * @private
     */
    _getLeftTopCoords: function() {
      return this.translateToOriginPoint(this.getCenterPoint(), 'left', 'top');
    },
  });

})();
(function() {

  function arrayFromCoords(coords) {
    return [
      new fabric.Point(coords.tl.x, coords.tl.y),
      new fabric.Point(coords.tr.x, coords.tr.y),
      new fabric.Point(coords.br.x, coords.br.y),
      new fabric.Point(coords.bl.x, coords.bl.y)
    ];
  }

  var util = fabric.util,
      degreesToRadians = util.degreesToRadians,
      multiplyMatrices = util.multiplyTransformMatrices,
      transformPoint = util.transformPoint;

  util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {

    /**
     * Describe object's corner position in canvas element coordinates.
     * properties are depending on control keys and padding the main controls.
     * each property is an object with x, y and corner.
     * The `corner` property contains in a similar manner the 4 points of the
     * interactive area of the corner.
     * The coordinates depends from the controls positionHandler and are used
     * to draw and locate controls
     * @memberOf fabric.Object.prototype
     */
    oCoords: null,

    /**
     * Describe object's corner position in canvas object absolute coordinates
     * properties are tl,tr,bl,br and describe the four main corner.
     * each property is an object with x, y, instance of Fabric.Point.
     * The coordinates depends from this properties: width, height, scaleX, scaleY
     * skewX, skewY, angle, strokeWidth, top, left.
     * Those coordinates are useful to understand where an object is. They get updated
     * with oCoords but they do not need to be updated when zoom or panning change.
     * The coordinates get updated with @method setCoords.
     * You can calculate them without updating with @method calcACoords();
     * @memberOf fabric.Object.prototype
     */
    aCoords: null,

    /**
     * Describe object's corner position in canvas element coordinates.
     * includes padding. Used of object detection.
     * set and refreshed with setCoords.
     * @memberOf fabric.Object.prototype
     */
    lineCoords: null,

    /**
     * storage for object transform matrix
     */
    ownMatrixCache: null,

    /**
     * storage for object full transform matrix
     */
    matrixCache: null,

    /**
     * custom controls interface
     * controls are added by default_controls.js
     */
    controls: { },

    /**
     * return correct set of coordinates for intersection
     * this will return either aCoords or lineCoords.
     * @param {Boolean} absolute will return aCoords if true or lineCoords
     * @return {Object} {tl, tr, br, bl} points
     */
    _getCoords: function(absolute, calculate) {
      if (calculate) {
        return (absolute ? this.calcACoords() : this.calcLineCoords());
      }
      if (!this.aCoords || !this.lineCoords) {
        this.setCoords(true);
      }
      return (absolute ? this.aCoords : this.lineCoords);
    },

    /**
     * return correct set of coordinates for intersection
     * this will return either aCoords or lineCoords.
     * The coords are returned in an array.
     * @return {Array} [tl, tr, br, bl] of points
     */
    getCoords: function(absolute, calculate) {
      return arrayFromCoords(this._getCoords(absolute, calculate));
    },

    /**
     * Checks if object intersects with an area formed by 2 points
     * @param {Object} pointTL top-left point of area
     * @param {Object} pointBR bottom-right point of area
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object intersects with an area formed by 2 points
     */
    intersectsWithRect: function(pointTL, pointBR, absolute, calculate) {
      var coords = this.getCoords(absolute, calculate),
          intersection = fabric.Intersection.intersectPolygonRectangle(
            coords,
            pointTL,
            pointBR
          );
      return intersection.status === 'Intersection';
    },

    /**
     * Checks if object intersects with another object
     * @param {Object} other Object to test
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object intersects with another object
     */
    intersectsWithObject: function(other, absolute, calculate) {
      var intersection = fabric.Intersection.intersectPolygonPolygon(
        this.getCoords(absolute, calculate),
        other.getCoords(absolute, calculate)
      );

      return intersection.status === 'Intersection'
        || other.isContainedWithinObject(this, absolute, calculate)
        || this.isContainedWithinObject(other, absolute, calculate);
    },

    /**
     * Checks if object is fully contained within area of another object
     * @param {Object} other Object to test
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object is fully contained within area of another object
     */
    isContainedWithinObject: function(other, absolute, calculate) {
      var points = this.getCoords(absolute, calculate),
          otherCoords = absolute ? other.aCoords : other.lineCoords,
          i = 0, lines = other._getImageLines(otherCoords);
      for (; i < 4; i++) {
        if (!other.containsPoint(points[i], lines)) {
          return false;
        }
      }
      return true;
    },

    /**
     * Checks if object is fully contained within area formed by 2 points
     * @param {Object} pointTL top-left point of area
     * @param {Object} pointBR bottom-right point of area
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object is fully contained within area formed by 2 points
     */
    isContainedWithinRect: function(pointTL, pointBR, absolute, calculate) {
      var boundingRect = this.getBoundingRect(absolute, calculate);

      return (
        boundingRect.left >= pointTL.x &&
        boundingRect.left + boundingRect.width <= pointBR.x &&
        boundingRect.top >= pointTL.y &&
        boundingRect.top + boundingRect.height <= pointBR.y
      );
    },

    /**
     * Checks if point is inside the object
     * @param {fabric.Point} point Point to check against
     * @param {Object} [lines] object returned from @method _getImageLines
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if point is inside the object
     */
    containsPoint: function(point, lines, absolute, calculate) {
      var coords = this._getCoords(absolute, calculate),
          lines = lines || this._getImageLines(coords),
          xPoints = this._findCrossPoints(point, lines);
      // if xPoints is odd then point is inside the object
      return (xPoints !== 0 && xPoints % 2 === 1);
    },

    /**
     * Checks if object is contained within the canvas with current viewportTransform
     * the check is done stopping at first point that appears on screen
     * @param {Boolean} [calculate] use coordinates of current position instead of .aCoords
     * @return {Boolean} true if object is fully or partially contained within canvas
     */
    isOnScreen: function(calculate) {
      if (!this.canvas) {
        return false;
      }
      var pointTL = this.canvas.vptCoords.tl, pointBR = this.canvas.vptCoords.br;
      var points = this.getCoords(true, calculate);
      // if some point is on screen, the object is on screen.
      if (points.some(function(point) {
        return point.x <= pointBR.x && point.x >= pointTL.x &&
        point.y <= pointBR.y && point.y >= pointTL.y;
      })) {
        return true;
      }
      // no points on screen, check intersection with absolute coordinates
      if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
        return true;
      }
      return this._containsCenterOfCanvas(pointTL, pointBR, calculate);
    },

    /**
     * Checks if the object contains the midpoint between canvas extremities
     * Does not make sense outside the context of isOnScreen and isPartiallyOnScreen
     * @private
     * @param {Fabric.Point} pointTL Top Left point
     * @param {Fabric.Point} pointBR Top Right point
     * @param {Boolean} calculate use coordinates of current position instead of .oCoords
     * @return {Boolean} true if the object contains the point
     */
    _containsCenterOfCanvas: function(pointTL, pointBR, calculate) {
      // worst case scenario the object is so big that contains the screen
      var centerPoint = { x: (pointTL.x + pointBR.x) / 2, y: (pointTL.y + pointBR.y) / 2 };
      if (this.containsPoint(centerPoint, null, true, calculate)) {
        return true;
      }
      return false;
    },

    /**
     * Checks if object is partially contained within the canvas with current viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object is partially contained within canvas
     */
    isPartiallyOnScreen: function(calculate) {
      if (!this.canvas) {
        return false;
      }
      var pointTL = this.canvas.vptCoords.tl, pointBR = this.canvas.vptCoords.br;
      if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
        return true;
      }
      var allPointsAreOutside = this.getCoords(true, calculate).every(function(point) {
        return (point.x >= pointBR.x || point.x <= pointTL.x) &&
        (point.y >= pointBR.y || point.y <= pointTL.y);
      });
      return allPointsAreOutside && this._containsCenterOfCanvas(pointTL, pointBR, calculate);
    },

    /**
     * Method that returns an object with the object edges in it, given the coordinates of the corners
     * @private
     * @param {Object} oCoords Coordinates of the object corners
     */
    _getImageLines: function(oCoords) {

      var lines = {
        topline: {
          o: oCoords.tl,
          d: oCoords.tr
        },
        rightline: {
          o: oCoords.tr,
          d: oCoords.br
        },
        bottomline: {
          o: oCoords.br,
          d: oCoords.bl
        },
        leftline: {
          o: oCoords.bl,
          d: oCoords.tl
        }
      };

      // // debugging
      // if (this.canvas.contextTop) {
      //   this.canvas.contextTop.fillRect(lines.bottomline.d.x, lines.bottomline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.bottomline.o.x, lines.bottomline.o.y, 2, 2);
      //
      //   this.canvas.contextTop.fillRect(lines.leftline.d.x, lines.leftline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.leftline.o.x, lines.leftline.o.y, 2, 2);
      //
      //   this.canvas.contextTop.fillRect(lines.topline.d.x, lines.topline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.topline.o.x, lines.topline.o.y, 2, 2);
      //
      //   this.canvas.contextTop.fillRect(lines.rightline.d.x, lines.rightline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.rightline.o.x, lines.rightline.o.y, 2, 2);
      // }

      return lines;
    },

    /**
     * Helper method to determine how many cross points are between the 4 object edges
     * and the horizontal line determined by a point on canvas
     * @private
     * @param {fabric.Point} point Point to check
     * @param {Object} lines Coordinates of the object being evaluated
     */
    // remove yi, not used but left code here just in case.
    _findCrossPoints: function(point, lines) {
      var b1, b2, a1, a2, xi, // yi,
          xcount = 0,
          iLine;

      for (var lineKey in lines) {
        iLine = lines[lineKey];
        // optimisation 1: line below point. no cross
        if ((iLine.o.y < point.y) && (iLine.d.y < point.y)) {
          continue;
        }
        // optimisation 2: line above point. no cross
        if ((iLine.o.y >= point.y) && (iLine.d.y >= point.y)) {
          continue;
        }
        // optimisation 3: vertical line case
        if ((iLine.o.x === iLine.d.x) && (iLine.o.x >= point.x)) {
          xi = iLine.o.x;
          // yi = point.y;
        }
        // calculate the intersection point
        else {
          b1 = 0;
          b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
          a1 = point.y - b1 * point.x;
          a2 = iLine.o.y - b2 * iLine.o.x;

          xi = -(a1 - a2) / (b1 - b2);
          // yi = a1 + b1 * xi;
        }
        // dont count xi < point.x cases
        if (xi >= point.x) {
          xcount += 1;
        }
        // optimisation 4: specific for square images
        if (xcount === 2) {
          break;
        }
      }
      return xcount;
    },

    /**
     * Returns coordinates of object's bounding rectangle (left, top, width, height)
     * the box is intended as aligned to axis of canvas.
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords / .aCoords
     * @return {Object} Object with left, top, width, height properties
     */
    getBoundingRect: function(absolute, calculate) {
      var coords = this.getCoords(absolute, calculate);
      return util.makeBoundingBoxFromPoints(coords);
    },

    /**
     * Returns width of an object's bounding box counting transformations
     * before 2.0 it was named getWidth();
     * @return {Number} width value
     */
    getScaledWidth: function() {
      return this._getTransformedDimensions().x;
    },

    /**
     * Returns height of an object bounding box counting transformations
     * before 2.0 it was named getHeight();
     * @return {Number} height value
     */
    getScaledHeight: function() {
      return this._getTransformedDimensions().y;
    },

    /**
     * Makes sure the scale is valid and modifies it if necessary
     * @private
     * @param {Number} value
     * @return {Number}
     */
    _constrainScale: function(value) {
      if (Math.abs(value) < this.minScaleLimit) {
        if (value < 0) {
          return -this.minScaleLimit;
        }
        else {
          return this.minScaleLimit;
        }
      }
      else if (value === 0) {
        return 0.0001;
      }
      return value;
    },

    /**
     * Scales an object (equally by x and y)
     * @param {Number} value Scale factor
     * @return {fabric.Object} thisArg
     * @chainable
     */
    scale: function(value) {
      this._set('scaleX', value);
      this._set('scaleY', value);
      return this.setCoords();
    },

    /**
     * Scales an object to a given width, with respect to bounding box (scaling by x/y equally)
     * @param {Number} value New width value
     * @param {Boolean} absolute ignore viewport
     * @return {fabric.Object} thisArg
     * @chainable
     */
    scaleToWidth: function(value, absolute) {
      // adjust to bounding rect factor so that rotated shapes would fit as well
      var boundingRectFactor = this.getBoundingRect(absolute).width / this.getScaledWidth();
      return this.scale(value / this.width / boundingRectFactor);
    },

    /**
     * Scales an object to a given height, with respect to bounding box (scaling by x/y equally)
     * @param {Number} value New height value
     * @param {Boolean} absolute ignore viewport
     * @return {fabric.Object} thisArg
     * @chainable
     */
    scaleToHeight: function(value, absolute) {
      // adjust to bounding rect factor so that rotated shapes would fit as well
      var boundingRectFactor = this.getBoundingRect(absolute).height / this.getScaledHeight();
      return this.scale(value / this.height / boundingRectFactor);
    },

    calcLineCoords: function() {
      var vpt = this.getViewportTransform(),
          padding = this.padding, angle = degreesToRadians(this.angle),
          cos = util.cos(angle), sin = util.sin(angle),
          cosP = cos * padding, sinP = sin * padding, cosPSinP = cosP + sinP,
          cosPMinusSinP = cosP - sinP, aCoords = this.calcACoords();

      var lineCoords = {
        tl: transformPoint(aCoords.tl, vpt),
        tr: transformPoint(aCoords.tr, vpt),
        bl: transformPoint(aCoords.bl, vpt),
        br: transformPoint(aCoords.br, vpt),
      };

      if (padding) {
        lineCoords.tl.x -= cosPMinusSinP;
        lineCoords.tl.y -= cosPSinP;
        lineCoords.tr.x += cosPSinP;
        lineCoords.tr.y -= cosPMinusSinP;
        lineCoords.bl.x -= cosPSinP;
        lineCoords.bl.y += cosPMinusSinP;
        lineCoords.br.x += cosPMinusSinP;
        lineCoords.br.y += cosPSinP;
      }

      return lineCoords;
    },

    calcOCoords: function() {
      var rotateMatrix = this._calcRotateMatrix(),
          translateMatrix = this._calcTranslateMatrix(),
          vpt = this.getViewportTransform(),
          startMatrix = multiplyMatrices(vpt, translateMatrix),
          finalMatrix = multiplyMatrices(startMatrix, rotateMatrix),
          finalMatrix = multiplyMatrices(finalMatrix, [1 / vpt[0], 0, 0, 1 / vpt[3], 0, 0]),
          dim = this._calculateCurrentDimensions(),
          coords = {};
      this.forEachControl(function(control, key, fabricObject) {
        coords[key] = control.positionHandler(dim, finalMatrix, fabricObject);
      });

      // debug code
      // var canvas = this.canvas;
      // setTimeout(function() {
      //   canvas.contextTop.clearRect(0, 0, 700, 700);
      //   canvas.contextTop.fillStyle = 'green';
      //   Object.keys(coords).forEach(function(key) {
      //     var control = coords[key];
      //     canvas.contextTop.fillRect(control.x, control.y, 3, 3);
      //   });
      // }, 50);
      return coords;
    },

    calcACoords: function() {
      var rotateMatrix = this._calcRotateMatrix(),
          translateMatrix = this._calcTranslateMatrix(),
          finalMatrix = multiplyMatrices(translateMatrix, rotateMatrix),
          dim = this._getTransformedDimensions(),
          w = dim.x / 2, h = dim.y / 2;
      return {
        // corners
        tl: transformPoint({ x: -w, y: -h }, finalMatrix),
        tr: transformPoint({ x: w, y: -h }, finalMatrix),
        bl: transformPoint({ x: -w, y: h }, finalMatrix),
        br: transformPoint({ x: w, y: h }, finalMatrix)
      };
    },

    /**
     * Sets corner and controls position coordinates based on current angle, width and height, left and top.
     * oCoords are used to find the corners
     * aCoords are used to quickly find an object on the canvas
     * lineCoords are used to quickly find object during pointer events.
     * See {@link https://github.com/fabricjs/fabric.js/wiki/When-to-call-setCoords} and {@link http://fabricjs.com/fabric-gotchas}
     *
     * @param {Boolean} [skipCorners] skip calculation of oCoords.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setCoords: function(skipCorners) {
      this.aCoords = this.calcACoords();
      // in case we are in a group, for how the inner group target check works,
      // lineCoords are exactly aCoords. Since the vpt gets absorbed by the normalized pointer.
      this.lineCoords = this.group ? this.aCoords : this.calcLineCoords();
      if (skipCorners) {
        return this;
      }
      // set coordinates of the draggable boxes in the corners used to scale/rotate the image
      this.oCoords = this.calcOCoords();
      this._setCornerCoords && this._setCornerCoords();
      return this;
    },

    /**
     * calculate rotation matrix of an object
     * @return {Array} rotation matrix for the object
     */
    _calcRotateMatrix: function() {
      return util.calcRotateMatrix(this);
    },

    /**
     * calculate the translation matrix for an object transform
     * @return {Array} rotation matrix for the object
     */
    _calcTranslateMatrix: function() {
      var center = this.getCenterPoint();
      return [1, 0, 0, 1, center.x, center.y];
    },

    transformMatrixKey: function(skipGroup) {
      var sep = '_', prefix = '';
      if (!skipGroup && this.group) {
        prefix = this.group.transformMatrixKey(skipGroup) + sep;
      };
      return prefix + this.top + sep + this.left + sep + this.scaleX + sep + this.scaleY +
        sep + this.skewX + sep + this.skewY + sep + this.angle + sep + this.originX + sep + this.originY +
        sep + this.width + sep + this.height + sep + this.strokeWidth + this.flipX + this.flipY;
    },

    /**
     * calculate transform matrix that represents the current transformations from the
     * object's properties.
     * @param {Boolean} [skipGroup] return transform matrix for object not counting parent transformations
     * There are some situation in which this is useful to avoid the fake rotation.
     * @return {Array} transform matrix for the object
     */
    calcTransformMatrix: function(skipGroup) {
      var matrix = this.calcOwnMatrix();
      if (skipGroup || !this.group) {
        return matrix;
      }
      var key = this.transformMatrixKey(skipGroup), cache = this.matrixCache || (this.matrixCache = {});
      if (cache.key === key) {
        return cache.value;
      }
      if (this.group) {
        matrix = multiplyMatrices(this.group.calcTransformMatrix(false), matrix);
      }
      cache.key = key;
      cache.value = matrix;
      return matrix;
    },

    /**
     * calculate transform matrix that represents the current transformations from the
     * object's properties, this matrix does not include the group transformation
     * @return {Array} transform matrix for the object
     */
    calcOwnMatrix: function() {
      var key = this.transformMatrixKey(true), cache = this.ownMatrixCache || (this.ownMatrixCache = {});
      if (cache.key === key) {
        return cache.value;
      }
      var tMatrix = this._calcTranslateMatrix(),
          options = {
            angle: this.angle,
            translateX: tMatrix[4],
            translateY: tMatrix[5],
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            skewX: this.skewX,
            skewY: this.skewY,
            flipX: this.flipX,
            flipY: this.flipY,
          };
      cache.key = key;
      cache.value = util.composeMatrix(options);
      return cache.value;
    },

    /*
     * Calculate object dimensions from its properties
     * @private
     * @return {Object} .x width dimension
     * @return {Object} .y height dimension
     */
    _getNonTransformedDimensions: function() {
      var strokeWidth = this.strokeWidth,
          w = this.width + strokeWidth,
          h = this.height + strokeWidth;
      return { x: w, y: h };
    },

    /*
     * Calculate object bounding box dimensions from its properties scale, skew.
     * @param {Number} skewX, a value to override current skewX
     * @param {Number} skewY, a value to override current skewY
     * @private
     * @return {Object} .x width dimension
     * @return {Object} .y height dimension
     */
    _getTransformedDimensions: function(skewX, skewY) {
      if (typeof skewX === 'undefined') {
        skewX = this.skewX;
      }
      if (typeof skewY === 'undefined') {
        skewY = this.skewY;
      }
      var dimensions, dimX, dimY,
          noSkew = skewX === 0 && skewY === 0;

      if (this.strokeUniform) {
        dimX = this.width;
        dimY = this.height;
      }
      else {
        dimensions = this._getNonTransformedDimensions();
        dimX = dimensions.x;
        dimY = dimensions.y;
      }
      if (noSkew) {
        return this._finalizeDimensions(dimX * this.scaleX, dimY * this.scaleY);
      }
      var bbox = util.sizeAfterTransform(dimX, dimY, {
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        skewX: skewX,
        skewY: skewY,
      });
      return this._finalizeDimensions(bbox.x, bbox.y);
    },

    /*
     * Calculate object bounding box dimensions from its properties scale, skew.
     * @param Number width width of the bbox
     * @param Number height height of the bbox
     * @private
     * @return {Object} .x finalized width dimension
     * @return {Object} .y finalized height dimension
     */
    _finalizeDimensions: function(width, height) {
      return this.strokeUniform ?
        { x: width + this.strokeWidth, y: height + this.strokeWidth }
        :
        { x: width, y: height };
    },

    /*
     * Calculate object dimensions for controls box, including padding and canvas zoom.
     * and active selection
     * private
     */
    _calculateCurrentDimensions: function()  {
      var vpt = this.getViewportTransform(),
          dim = this._getTransformedDimensions(),
          p = transformPoint(dim, vpt, true);
      return p.scalarAdd(2 * this.padding);
    },
  });
})();
fabric.util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {

  /**
   * Moves an object to the bottom of the stack of drawn objects
   * @return {fabric.Object} thisArg
   * @chainable
   */
  sendToBack: function() {
    if (this.group) {
      fabric.StaticCanvas.prototype.sendToBack.call(this.group, this);
    }
    else if (this.canvas) {
      this.canvas.sendToBack(this);
    }
    return this;
  },

  /**
   * Moves an object to the top of the stack of drawn objects
   * @return {fabric.Object} thisArg
   * @chainable
   */
  bringToFront: function() {
    if (this.group) {
      fabric.StaticCanvas.prototype.bringToFront.call(this.group, this);
    }
    else if (this.canvas) {
      this.canvas.bringToFront(this);
    }
    return this;
  },

  /**
   * Moves an object down in stack of drawn objects
   * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
   * @return {fabric.Object} thisArg
   * @chainable
   */
  sendBackwards: function(intersecting) {
    if (this.group) {
      fabric.StaticCanvas.prototype.sendBackwards.call(this.group, this, intersecting);
    }
    else if (this.canvas) {
      this.canvas.sendBackwards(this, intersecting);
    }
    return this;
  },

  /**
   * Moves an object up in stack of drawn objects
   * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
   * @return {fabric.Object} thisArg
   * @chainable
   */
  bringForward: function(intersecting) {
    if (this.group) {
      fabric.StaticCanvas.prototype.bringForward.call(this.group, this, intersecting);
    }
    else if (this.canvas) {
      this.canvas.bringForward(this, intersecting);
    }
    return this;
  },

  /**
   * Moves an object to specified level in stack of drawn objects
   * @param {Number} index New position of object
   * @return {fabric.Object} thisArg
   * @chainable
   */
  moveTo: function(index) {
    if (this.group && this.group.type !== 'activeSelection') {
      fabric.StaticCanvas.prototype.moveTo.call(this.group, this, index);
    }
    else if (this.canvas) {
      this.canvas.moveTo(this, index);
    }
    return this;
  }
});

(function() {

  var extend = fabric.util.object.extend,
      originalSet = 'stateProperties';

  /*
    Depends on `stateProperties`
  */
  function saveProps(origin, destination, props) {
    var tmpObj = { }, deep = true;
    props.forEach(function(prop) {
      tmpObj[prop] = origin[prop];
    });

    extend(origin[destination], tmpObj, deep);
  }

  function _isEqual(origValue, currentValue, firstPass) {
    if (origValue === currentValue) {
      // if the objects are identical, return
      return true;
    }
    else if (Array.isArray(origValue)) {
      if (!Array.isArray(currentValue) || origValue.length !== currentValue.length) {
        return false;
      }
      for (var i = 0, len = origValue.length; i < len; i++) {
        if (!_isEqual(origValue[i], currentValue[i])) {
          return false;
        }
      }
      return true;
    }
    else if (origValue && typeof origValue === 'object') {
      var keys = Object.keys(origValue), key;
      if (!currentValue ||
          typeof currentValue !== 'object' ||
          (!firstPass && keys.length !== Object.keys(currentValue).length)
      ) {
        return false;
      }
      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        // since clipPath is in the statefull cache list and the clipPath objects
        // would be iterated as an object, this would lead to possible infinite recursion
        // we do not want to compare those.
        if (key === 'canvas' || key === 'group') {
          continue;
        }
        if (!_isEqual(origValue[key], currentValue[key])) {
          return false;
        }
      }
      return true;
    }
  }


  fabric.util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {

    /**
     * Returns true if object state (one of its state properties) was changed
     * @param {String} [propertySet] optional name for the set of property we want to save
     * @return {Boolean} true if instance' state has changed since `{@link fabric.Object#saveState}` was called
     */
    hasStateChanged: function(propertySet) {
      propertySet = propertySet || originalSet;
      var dashedPropertySet = '_' + propertySet;
      if (Object.keys(this[dashedPropertySet]).length < this[propertySet].length) {
        return true;
      }
      return !_isEqual(this[dashedPropertySet], this, true);
    },

    /**
     * Saves state of an object
     * @param {Object} [options] Object with additional `stateProperties` array to include when saving state
     * @return {fabric.Object} thisArg
     */
    saveState: function(options) {
      var propertySet = options && options.propertySet || originalSet,
          destination = '_' + propertySet;
      if (!this[destination]) {
        return this.setupState(options);
      }
      saveProps(this, destination, this[propertySet]);
      if (options && options.stateProperties) {
        saveProps(this, destination, options.stateProperties);
      }
      return this;
    },

    /**
     * Setups state of an object
     * @param {Object} [options] Object with additional `stateProperties` array to include when saving state
     * @return {fabric.Object} thisArg
     */
    setupState: function(options) {
      options = options || { };
      var propertySet = options.propertySet || originalSet;
      options.propertySet = propertySet;
      this['_' + propertySet] = { };
      this.saveState(options);
      return this;
    }
  });
})();
(function() {

  var degreesToRadians = fabric.util.degreesToRadians;

  fabric.util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {
    /**
     * Determines which corner has been clicked
     * @private
     * @param {Object} pointer The pointer indicating the mouse position
     * @return {String|Boolean} corner code (tl, tr, bl, br, etc.), or false if nothing is found
     */
    _findTargetCorner: function(pointer, forTouch) {
      // objects in group, anykind, are not self modificable,
      // must not return an hovered corner.
      if (!this.hasControls || this.group || (!this.canvas || this.canvas._activeObject !== this)) {
        return false;
      }

      var ex = pointer.x,
          ey = pointer.y,
          xPoints,
          lines, keys = Object.keys(this.oCoords),
          j = keys.length - 1, i;
      this.__corner = 0;

      // cycle in reverse order so we pick first the one on top
      for (; j >= 0; j--) {
        i = keys[j];
        if (!this.isControlVisible(i)) {
          continue;
        }

        lines = this._getImageLines(forTouch ? this.oCoords[i].touchCorner : this.oCoords[i].corner);
        // // debugging
        //
        // this.canvas.contextTop.fillRect(lines.bottomline.d.x, lines.bottomline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.bottomline.o.x, lines.bottomline.o.y, 2, 2);
        //
        // this.canvas.contextTop.fillRect(lines.leftline.d.x, lines.leftline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.leftline.o.x, lines.leftline.o.y, 2, 2);
        //
        // this.canvas.contextTop.fillRect(lines.topline.d.x, lines.topline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.topline.o.x, lines.topline.o.y, 2, 2);
        //
        // this.canvas.contextTop.fillRect(lines.rightline.d.x, lines.rightline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.rightline.o.x, lines.rightline.o.y, 2, 2);

        xPoints = this._findCrossPoints({ x: ex, y: ey }, lines);
        if (xPoints !== 0 && xPoints % 2 === 1) {
          this.__corner = i;
          return i;
        }
      }
      return false;
    },

    /**
     * Calls a function for each control. The function gets called,
     * with the control, the object that is calling the iterator and the control's key
     * @param {Function} fn function to iterate over the controls over
     */
    forEachControl: function(fn) {
      for (var i in this.controls) {
        fn(this.controls[i], i, this);
      };
    },

    /**
     * Sets the coordinates of the draggable boxes in the corners of
     * the image used to scale/rotate it.
     * note: if we would switch to ROUND corner area, all of this would disappear.
     * everything would resolve to a single point and a pythagorean theorem for the distance
     * @private
     */
    _setCornerCoords: function() {
      var coords = this.oCoords;

      for (var control in coords) {
        var controlObject = this.controls[control];
        coords[control].corner = controlObject.calcCornerCoords(
          this.angle, this.cornerSize, coords[control].x, coords[control].y, false);
        coords[control].touchCorner = controlObject.calcCornerCoords(
          this.angle, this.touchCornerSize, coords[control].x, coords[control].y, true);
      }
    },

    /**
     * Draws a colored layer behind the object, inside its selection borders.
     * Requires public options: padding, selectionBackgroundColor
     * this function is called when the context is transformed
     * has checks to be skipped when the object is on a staticCanvas
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawSelectionBackground: function(ctx) {
      if (!this.selectionBackgroundColor ||
        (this.canvas && !this.canvas.interactive) ||
        (this.canvas && this.canvas._activeObject !== this)
      ) {
        return this;
      }
      ctx.save();
      var center = this.getCenterPoint(), wh = this._calculateCurrentDimensions(),
          vpt = this.canvas.viewportTransform;
      ctx.translate(center.x, center.y);
      ctx.scale(1 / vpt[0], 1 / vpt[3]);
      ctx.rotate(degreesToRadians(this.angle));
      ctx.fillStyle = this.selectionBackgroundColor;
      ctx.fillRect(-wh.x / 2, -wh.y / 2, wh.x, wh.y);
      ctx.restore();
      return this;
    },

    /**
     * Draws borders of an object's bounding box.
     * Requires public properties: width, height
     * Requires public options: padding, borderColor
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @param {Object} styleOverride object to override the object style
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawBorders: function(ctx, styleOverride) {
      styleOverride = styleOverride || {};
      var wh = this._calculateCurrentDimensions(),
          strokeWidth = this.borderScaleFactor,
          width = wh.x + strokeWidth,
          height = wh.y + strokeWidth,
          hasControls = typeof styleOverride.hasControls !== 'undefined' ?
            styleOverride.hasControls : this.hasControls,
          shouldStroke = false;

      ctx.save();
      ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
      this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray);

      ctx.strokeRect(
        -width / 2,
        -height / 2,
        width,
        height
      );

      if (hasControls) {
        ctx.beginPath();
        this.forEachControl(function(control, key, fabricObject) {
          // in this moment, the ctx is centered on the object.
          // width and height of the above function are the size of the bbox.
          if (control.withConnection && control.getVisibility(fabricObject, key)) {
            // reset movement for each control
            shouldStroke = true;
            ctx.moveTo(control.x * width, control.y * height);
            ctx.lineTo(
              control.x * width + control.offsetX,
              control.y * height + control.offsetY
            );
          }
        });
        if (shouldStroke) {
          ctx.stroke();
        }
      }
      ctx.restore();
      return this;
    },

    /**
     * Draws borders of an object's bounding box when it is inside a group.
     * Requires public properties: width, height
     * Requires public options: padding, borderColor
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @param {object} options object representing current object parameters
     * @param {Object} styleOverride object to override the object style
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawBordersInGroup: function(ctx, options, styleOverride) {
      styleOverride = styleOverride || {};
      var bbox = fabric.util.sizeAfterTransform(this.width, this.height, options),
          strokeWidth = this.strokeWidth,
          strokeUniform = this.strokeUniform,
          borderScaleFactor = this.borderScaleFactor,
          width =
            bbox.x + strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleX) + borderScaleFactor,
          height =
            bbox.y + strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleY) + borderScaleFactor;
      ctx.save();
      this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray);
      ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
      ctx.strokeRect(
        -width / 2,
        -height / 2,
        width,
        height
      );

      ctx.restore();
      return this;
    },

    /**
     * Draws corners of an object's bounding box.
     * Requires public properties: width, height
     * Requires public options: cornerSize, padding
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @param {Object} styleOverride object to override the object style
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawControls: function(ctx, styleOverride) {
      styleOverride = styleOverride || {};
      ctx.save();
      var retinaScaling = this.canvas.getRetinaScaling(), matrix, p;
      ctx.setTransform(retinaScaling, 0, 0, retinaScaling, 0, 0);
      ctx.strokeStyle = ctx.fillStyle = styleOverride.cornerColor || this.cornerColor;
      if (!this.transparentCorners) {
        ctx.strokeStyle = styleOverride.cornerStrokeColor || this.cornerStrokeColor;
      }
      this._setLineDash(ctx, styleOverride.cornerDashArray || this.cornerDashArray);
      this.setCoords();
      if (this.group) {
        // fabricJS does not really support drawing controls inside groups,
        // this piece of code here helps having at least the control in places.
        // If an application needs to show some objects as selected because of some UI state
        // can still call Object._renderControls() on any object they desire, independently of groups.
        // using no padding, circular controls and hiding the rotating cursor is higly suggested,
        matrix = this.group.calcTransformMatrix();
      }
      this.forEachControl(function(control, key, fabricObject) {
        p = fabricObject.oCoords[key];
        if (control.getVisibility(fabricObject, key)) {
          if (matrix) {
            p = fabric.util.transformPoint(p, matrix);
          }
          control.render(ctx, p.x, p.y, styleOverride, fabricObject);
        }
      });
      ctx.restore();

      return this;
    },

    /**
     * Returns true if the specified control is visible, false otherwise.
     * @param {String} controlKey The key of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @returns {Boolean} true if the specified control is visible, false otherwise
     */
    isControlVisible: function(controlKey) {
      return this.controls[controlKey] && this.controls[controlKey].getVisibility(this, controlKey);
    },

    /**
     * Sets the visibility of the specified control.
     * @param {String} controlKey The key of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @param {Boolean} visible true to set the specified control visible, false otherwise
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setControlVisible: function(controlKey, visible) {
      if (!this._controlsVisibility) {
        this._controlsVisibility = {};
      }
      this._controlsVisibility[controlKey] = visible;
      return this;
    },

    /**
     * Sets the visibility state of object controls.
     * @param {Object} [options] Options object
     * @param {Boolean} [options.bl] true to enable the bottom-left control, false to disable it
     * @param {Boolean} [options.br] true to enable the bottom-right control, false to disable it
     * @param {Boolean} [options.mb] true to enable the middle-bottom control, false to disable it
     * @param {Boolean} [options.ml] true to enable the middle-left control, false to disable it
     * @param {Boolean} [options.mr] true to enable the middle-right control, false to disable it
     * @param {Boolean} [options.mt] true to enable the middle-top control, false to disable it
     * @param {Boolean} [options.tl] true to enable the top-left control, false to disable it
     * @param {Boolean} [options.tr] true to enable the top-right control, false to disable it
     * @param {Boolean} [options.mtr] true to enable the middle-top-rotate control, false to disable it
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setControlsVisibility: function(options) {
      options || (options = { });

      for (var p in options) {
        this.setControlVisible(p, options[p]);
      }
      return this;
    },


    /**
     * This callback function is called every time _discardActiveObject or _setActiveObject
     * try to to deselect this object. If the function returns true, the process is cancelled
     * @param {Object} [options] options sent from the upper functions
     * @param {Event} [options.e] event if the process is generated by an event
     */
    onDeselect: function() {
      // implemented by sub-classes, as needed.
    },


    /**
     * This callback function is called every time _discardActiveObject or _setActiveObject
     * try to to select this object. If the function returns true, the process is cancelled
     * @param {Object} [options] options sent from the upper functions
     * @param {Event} [options.e] event if the process is generated by an event
     */
    onSelect: function() {
      // implemented by sub-classes, as needed.
    }
  });
})();
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      degreesToRadians = fabric.util.degreesToRadians;

  if (fabric.Circle) {
    fabric.warn('fabric.Circle is already defined.');
    return;
  }

  /**
   * Circle class
   * @class fabric.Circle
   * @extends fabric.Object
   * @see {@link fabric.Circle#initialize} for constructor definition
   */
  fabric.Circle = fabric.util.createClass(fabric.Object, /** @lends fabric.Circle.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'circle',

    /**
     * Radius of this circle
     * @type Number
     * @default
     */
    radius: 0,

    /**
     * degrees of start of the circle.
     * probably will change to degrees in next major version
     * @type Number 0 - 359
     * @default 0
     */
    startAngle: 0,

    /**
     * End angle of the circle
     * probably will change to degrees in next major version
     * @type Number 1 - 360
     * @default 360
     */
    endAngle: 360,

    cacheProperties: fabric.Object.prototype.cacheProperties.concat('radius', 'startAngle', 'endAngle'),

    /**
     * @private
     * @param {String} key
     * @param {*} value
     * @return {fabric.Circle} thisArg
     */
    _set: function(key, value) {
      this.callSuper('_set', key, value);

      if (key === 'radius') {
        this.setRadius(value);
      }

      return this;
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['radius', 'startAngle', 'endAngle'].concat(propertiesToInclude));
    },

    

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx context to render on
     */
    _render: function(ctx) {
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        this.radius,
        degreesToRadians(this.startAngle),
        degreesToRadians(this.endAngle),
        false
      );
      this._renderPaintInOrder(ctx);
    },

    /**
     * Returns horizontal radius of an object (according to how an object is scaled)
     * @return {Number}
     */
    getRadiusX: function() {
      return this.get('radius') * this.get('scaleX');
    },

    /**
     * Returns vertical radius of an object (according to how an object is scaled)
     * @return {Number}
     */
    getRadiusY: function() {
      return this.get('radius') * this.get('scaleY');
    },

    /**
     * Sets radius of an object (and updates width accordingly)
     * @return {fabric.Circle} thisArg
     */
    setRadius: function(value) {
      this.radius = value;
      return this.set('width', value * 2).set('height', value * 2);
    },
  });

  

  /**
   * Returns {@link fabric.Circle} instance from an object representation
   * @static
   * @memberOf fabric.Circle
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] invoked with new instance as first argument
   * @return {void}
   */
  fabric.Circle.fromObject = function(object, callback) {
    fabric.Object._fromObject('Circle', object, callback);
  };

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend;

  if (fabric.Rect) {
    fabric.warn('fabric.Rect is already defined');
    return;
  }

  /**
   * Rectangle class
   * @class fabric.Rect
   * @extends fabric.Object
   * @return {fabric.Rect} thisArg
   * @see {@link fabric.Rect#initialize} for constructor definition
   */
  fabric.Rect = fabric.util.createClass(fabric.Object, /** @lends fabric.Rect.prototype */ {

    /**
     * List of properties to consider when checking if state of an object is changed ({@link fabric.Object#hasStateChanged})
     * as well as for history (undo/redo) purposes
     * @type Array
     */
    stateProperties: fabric.Object.prototype.stateProperties.concat('rx', 'ry'),

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'rect',

    /**
     * Horizontal border radius
     * @type Number
     * @default
     */
    rx:   0,

    /**
     * Vertical border radius
     * @type Number
     * @default
     */
    ry:   0,

    cacheProperties: fabric.Object.prototype.cacheProperties.concat('rx', 'ry'),

    /**
     * Constructor
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
      this._initRxRy();
    },

    /**
     * Initializes rx/ry attributes
     * @private
     */
    _initRxRy: function() {
      if (this.rx && !this.ry) {
        this.ry = this.rx;
      }
      else if (this.ry && !this.rx) {
        this.rx = this.ry;
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function(ctx) {

      // 1x1 case (used in spray brush) optimization was removed because
      // with caching and higher zoom level this makes more damage than help

      var rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
          ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
          w = this.width,
          h = this.height,
          x = -this.width / 2,
          y = -this.height / 2,
          isRounded = rx !== 0 || ry !== 0,
          /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */
          k = 1 - 0.5522847498;
      ctx.beginPath();

      ctx.moveTo(x + rx, y);

      ctx.lineTo(x + w - rx, y);
      isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);

      ctx.lineTo(x + w, y + h - ry);
      isRounded && ctx.bezierCurveTo(x + w, y + h - k * ry, x + w - k * rx, y + h, x + w - rx, y + h);

      ctx.lineTo(x + rx, y + h);
      isRounded && ctx.bezierCurveTo(x + k * rx, y + h, x, y + h - k * ry, x, y + h - ry);

      ctx.lineTo(x, y + ry);
      isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);

      ctx.closePath();

      this._renderPaintInOrder(ctx);
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['rx', 'ry'].concat(propertiesToInclude));
    },

    
  });

  

  /**
   * Returns {@link fabric.Rect} instance from an object representation
   * @static
   * @memberOf fabric.Rect
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] Callback to invoke when an fabric.Rect instance is created
   */
  fabric.Rect.fromObject = function(object, callback) {
    return fabric.Object._fromObject('Rect', object, callback);
  };

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      min = fabric.util.array.min,
      max = fabric.util.array.max,
      extend = fabric.util.object.extend,
      clone = fabric.util.object.clone,
      toFixed = fabric.util.toFixed;

  if (fabric.Path) {
    fabric.warn('fabric.Path is already defined');
    return;
  }

  /**
   * Path class
   * @class fabric.Path
   * @extends fabric.Object
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-1#path_and_pathgroup}
   * @see {@link fabric.Path#initialize} for constructor definition
   */
  fabric.Path = fabric.util.createClass(fabric.Object, /** @lends fabric.Path.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'path',

    /**
     * Array of path points
     * @type Array
     * @default
     */
    path: null,

    cacheProperties: fabric.Object.prototype.cacheProperties.concat('path', 'fillRule'),

    stateProperties: fabric.Object.prototype.stateProperties.concat('path'),

    /**
     * Constructor
     * @param {Array|String} path Path data (sequence of coordinates and corresponding "command" tokens)
     * @param {Object} [options] Options object
     * @return {fabric.Path} thisArg
     */
    initialize: function (path, options) {
      options = clone(options || {});
      delete options.path;
      this.callSuper('initialize', options);
      this._setPath(path || [], options);
    },

    /**
    * @private
    * @param {Array|String} path Path data (sequence of coordinates and corresponding "command" tokens)
    * @param {Object} [options] Options object
    */
    _setPath: function (path, options) {
      this.path = fabric.util.makePathSimpler(
        Array.isArray(path) ? path : fabric.util.parsePath(path)
      );

      fabric.Polyline.prototype._setPositionDimensions.call(this, options || {});
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx context to render path on
     */
    _renderPathCommands: function(ctx) {
      var current, // current instruction
          subpathStartX = 0,
          subpathStartY = 0,
          x = 0, // current x
          y = 0, // current y
          controlX = 0, // current control point x
          controlY = 0, // current control point y
          l = -this.pathOffset.x,
          t = -this.pathOffset.y;

      ctx.beginPath();

      for (var i = 0, len = this.path.length; i < len; ++i) {

        current = this.path[i];

        switch (current[0]) { // first letter

          case 'L': // lineto, absolute
            x = current[1];
            y = current[2];
            ctx.lineTo(x + l, y + t);
            break;

          case 'M': // moveTo, absolute
            x = current[1];
            y = current[2];
            subpathStartX = x;
            subpathStartY = y;
            ctx.moveTo(x + l, y + t);
            break;

          case 'C': // bezierCurveTo, absolute
            x = current[5];
            y = current[6];
            controlX = current[3];
            controlY = current[4];
            ctx.bezierCurveTo(
              current[1] + l,
              current[2] + t,
              controlX + l,
              controlY + t,
              x + l,
              y + t
            );
            break;

          case 'Q': // quadraticCurveTo, absolute
            ctx.quadraticCurveTo(
              current[1] + l,
              current[2] + t,
              current[3] + l,
              current[4] + t
            );
            x = current[3];
            y = current[4];
            controlX = current[1];
            controlY = current[2];
            break;

          case 'z':
          case 'Z':
            x = subpathStartX;
            y = subpathStartY;
            ctx.closePath();
            break;
        }
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx context to render path on
     */
    _render: function(ctx) {
      this._renderPathCommands(ctx);
      this._renderPaintInOrder(ctx);
    },

    /**
     * Returns string representation of an instance
     * @return {String} string representation of an instance
     */
    toString: function() {
      return '#<fabric.Path (' + this.complexity() +
        '): { "top": ' + this.top + ', "left": ' + this.left + ' }>';
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return extend(this.callSuper('toObject', propertiesToInclude), {
        path: this.path.map(function(item) { return item.slice(); }),
      });
    },

    /**
     * Returns dataless object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toDatalessObject: function(propertiesToInclude) {
      var o = this.toObject(['sourcePath'].concat(propertiesToInclude));
      if (o.sourcePath) {
        delete o.path;
      }
      return o;
    },

    

    /**
     * Returns number representation of an instance complexity
     * @return {Number} complexity of this instance
     */
    complexity: function() {
      return this.path.length;
    },

    /**
     * @private
     */
    _calcDimensions: function() {

      var aX = [],
          aY = [],
          current, // current instruction
          subpathStartX = 0,
          subpathStartY = 0,
          x = 0, // current x
          y = 0, // current y
          bounds;

      for (var i = 0, len = this.path.length; i < len; ++i) {

        current = this.path[i];

        switch (current[0]) { // first letter

          case 'L': // lineto, absolute
            x = current[1];
            y = current[2];
            bounds = [];
            break;

          case 'M': // moveTo, absolute
            x = current[1];
            y = current[2];
            subpathStartX = x;
            subpathStartY = y;
            bounds = [];
            break;

          case 'C': // bezierCurveTo, absolute
            bounds = fabric.util.getBoundsOfCurve(x, y,
              current[1],
              current[2],
              current[3],
              current[4],
              current[5],
              current[6]
            );
            x = current[5];
            y = current[6];
            break;

          case 'Q': // quadraticCurveTo, absolute
            bounds = fabric.util.getBoundsOfCurve(x, y,
              current[1],
              current[2],
              current[1],
              current[2],
              current[3],
              current[4]
            );
            x = current[3];
            y = current[4];
            break;

          case 'z':
          case 'Z':
            x = subpathStartX;
            y = subpathStartY;
            break;
        }
        bounds.forEach(function (point) {
          aX.push(point.x);
          aY.push(point.y);
        });
        aX.push(x);
        aY.push(y);
      }

      var minX = min(aX) || 0,
          minY = min(aY) || 0,
          maxX = max(aX) || 0,
          maxY = max(aY) || 0,
          deltaX = maxX - minX,
          deltaY = maxY - minY;

      return {
        left: minX,
        top: minY,
        width: deltaX,
        height: deltaY
      };
    }
  });

  /**
   * Creates an instance of fabric.Path from an object
   * @static
   * @memberOf fabric.Path
   * @param {Object} object
   * @param {Function} [callback] Callback to invoke when an fabric.Path instance is created
   */
  fabric.Path.fromObject = function(object, callback) {
    if (typeof object.sourcePath === 'string') {
      var pathUrl = object.sourcePath;
      fabric.loadSVGFromURL(pathUrl, function (elements) {
        var path = elements[0];
        path.setOptions(object);
        callback && callback(path);
      });
    }
    else {
      fabric.Object._fromObject('Path', object, callback, 'path');
    }
  };

  

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      min = fabric.util.array.min,
      max = fabric.util.array.max;

  if (fabric.Group) {
    return;
  }

  /**
   * Group class
   * @class fabric.Group
   * @extends fabric.Object
   * @mixes fabric.Collection
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#groups}
   * @see {@link fabric.Group#initialize} for constructor definition
   */
  fabric.Group = fabric.util.createClass(fabric.Object, fabric.Collection, /** @lends fabric.Group.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'group',

    /**
     * Width of stroke
     * @type Number
     * @default
     */
    strokeWidth: 0,

    /**
     * Indicates if click, mouseover, mouseout events & hoverCursor should also check for subtargets
     * @type Boolean
     * @default
     */
    subTargetCheck: false,

    /**
     * Groups are container, do not render anything on theyr own, ence no cache properties
     * @type Array
     * @default
     */
    cacheProperties: [],

    /**
     * setOnGroup is a method used for TextBox that is no more used since 2.0.0 The behavior is still
     * available setting this boolean to true.
     * @type Boolean
     * @since 2.0.0
     * @default
     */
    useSetOnGroup: false,

    /**
     * Constructor
     * @param {Object} objects Group objects
     * @param {Object} [options] Options object
     * @param {Boolean} [isAlreadyGrouped] if true, objects have been grouped already.
     * @return {Object} thisArg
     */
    initialize: function(objects, options, isAlreadyGrouped) {
      options = options || {};
      this._objects = [];
      // if objects enclosed in a group have been grouped already,
      // we cannot change properties of objects.
      // Thus we need to set options to group without objects,
      isAlreadyGrouped && this.callSuper('initialize', options);
      this._objects = objects || [];
      for (var i = this._objects.length; i--; ) {
        this._objects[i].group = this;
      }

      if (!isAlreadyGrouped) {
        var center = options && options.centerPoint;
        // we want to set origins before calculating the bounding box.
        // so that the topleft can be set with that in mind.
        // if specific top and left are passed, are overwritten later
        // with the callSuper('initialize', options)
        if (options.originX !== undefined) {
          this.originX = options.originX;
        }
        if (options.originY !== undefined) {
          this.originY = options.originY;
        }
        // if coming from svg i do not want to calc bounds.
        // i assume width and height are passed along options
        center || this._calcBounds();
        this._updateObjectsCoords(center);
        delete options.centerPoint;
        this.callSuper('initialize', options);
      }
      else {
        this._updateObjectsACoords();
      }

      this.setCoords();
    },

    /**
     * @private
     */
    _updateObjectsACoords: function() {
      var skipControls = true;
      for (var i = this._objects.length; i--; ){
        this._objects[i].setCoords(skipControls);
      }
    },

    /**
     * @private
     * @param {Boolean} [skipCoordsChange] if true, coordinates of objects enclosed in a group do not change
     */
    _updateObjectsCoords: function(center) {
      var center = center || this.getCenterPoint();
      for (var i = this._objects.length; i--; ){
        this._updateObjectCoords(this._objects[i], center);
      }
    },

    /**
     * @private
     * @param {Object} object
     * @param {fabric.Point} center, current center of group.
     */
    _updateObjectCoords: function(object, center) {
      var objectLeft = object.left,
          objectTop = object.top,
          skipControls = true;

      object.set({
        left: objectLeft - center.x,
        top: objectTop - center.y
      });
      object.group = this;
      object.setCoords(skipControls);
    },

    /**
     * Returns string represenation of a group
     * @return {String}
     */
    toString: function() {
      return '#<fabric.Group: (' + this.complexity() + ')>';
    },

    /**
     * Adds an object to a group; Then recalculates group's dimension, position.
     * @param {Object} object
     * @return {fabric.Group} thisArg
     * @chainable
     */
    addWithUpdate: function(object) {
      var nested = !!this.group;
      this._restoreObjectsState();
      fabric.util.resetObjectTransform(this);
      if (object) {
        if (nested) {
          // if this group is inside another group, we need to pre transform the object
          fabric.util.removeTransformFromObject(object, this.group.calcTransformMatrix());
        }
        this._objects.push(object);
        object.group = this;
        object._set('canvas', this.canvas);
      }
      this._calcBounds();
      this._updateObjectsCoords();
      this.dirty = true;
      if (nested) {
        this.group.addWithUpdate();
      }
      else {
        this.setCoords();
      }
      return this;
    },

    /**
     * Removes an object from a group; Then recalculates group's dimension, position.
     * @param {Object} object
     * @return {fabric.Group} thisArg
     * @chainable
     */
    removeWithUpdate: function(object) {
      this._restoreObjectsState();
      fabric.util.resetObjectTransform(this);

      this.remove(object);
      this._calcBounds();
      this._updateObjectsCoords();
      this.setCoords();
      this.dirty = true;
      return this;
    },

    /**
     * @private
     */
    _onObjectAdded: function(object) {
      this.dirty = true;
      object.group = this;
      object._set('canvas', this.canvas);
    },

    /**
     * @private
     */
    _onObjectRemoved: function(object) {
      this.dirty = true;
      delete object.group;
    },

    /**
     * @private
     */
    _set: function(key, value) {
      var i = this._objects.length;
      if (this.useSetOnGroup) {
        while (i--) {
          this._objects[i].setOnGroup(key, value);
        }
      }
      if (key === 'canvas') {
        while (i--) {
          this._objects[i]._set(key, value);
        }
      }
      fabric.Object.prototype._set.call(this, key, value);
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      var _includeDefaultValues = this.includeDefaultValues;
      var objsToObject = this._objects
        .filter(function (obj) {
          return !obj.excludeFromExport;
        })
        .map(function (obj) {
          var originalDefaults = obj.includeDefaultValues;
          obj.includeDefaultValues = _includeDefaultValues;
          var _obj = obj.toObject(propertiesToInclude);
          obj.includeDefaultValues = originalDefaults;
          return _obj;
        });
      var obj = fabric.Object.prototype.toObject.call(this, propertiesToInclude);
      obj.objects = objsToObject;
      return obj;
    },

    /**
     * Returns object representation of an instance, in dataless mode.
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toDatalessObject: function(propertiesToInclude) {
      var objsToObject, sourcePath = this.sourcePath;
      if (sourcePath) {
        objsToObject = sourcePath;
      }
      else {
        var _includeDefaultValues = this.includeDefaultValues;
        objsToObject = this._objects.map(function(obj) {
          var originalDefaults = obj.includeDefaultValues;
          obj.includeDefaultValues = _includeDefaultValues;
          var _obj = obj.toDatalessObject(propertiesToInclude);
          obj.includeDefaultValues = originalDefaults;
          return _obj;
        });
      }
      var obj = fabric.Object.prototype.toDatalessObject.call(this, propertiesToInclude);
      obj.objects = objsToObject;
      return obj;
    },

    /**
     * Renders instance on a given context
     * @param {CanvasRenderingContext2D} ctx context to render instance on
     */
    render: function(ctx) {
      this._transformDone = true;
      this.callSuper('render', ctx);
      this._transformDone = false;
    },

    /**
     * Decide if the object should cache or not. Create its own cache level
     * needsItsOwnCache should be used when the object drawing method requires
     * a cache step. None of the fabric classes requires it.
     * Generally you do not cache objects in groups because the group is already cached.
     * @return {Boolean}
     */
    shouldCache: function() {
      var ownCache = fabric.Object.prototype.shouldCache.call(this);
      if (ownCache) {
        for (var i = 0, len = this._objects.length; i < len; i++) {
          if (this._objects[i].willDrawShadow()) {
            this.ownCaching = false;
            return false;
          }
        }
      }
      return ownCache;
    },

    /**
     * Check if this object or a child object will cast a shadow
     * @return {Boolean}
     */
    willDrawShadow: function() {
      if (fabric.Object.prototype.willDrawShadow.call(this)) {
        return true;
      }
      for (var i = 0, len = this._objects.length; i < len; i++) {
        if (this._objects[i].willDrawShadow()) {
          return true;
        }
      }
      return false;
    },

    /**
     * Check if this group or its parent group are caching, recursively up
     * @return {Boolean}
     */
    isOnACache: function() {
      return this.ownCaching || (this.group && this.group.isOnACache());
    },

    /**
     * Execute the drawing operation for an object on a specified context
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawObject: function(ctx) {
      for (var i = 0, len = this._objects.length; i < len; i++) {
        this._objects[i].render(ctx);
      }
      this._drawClipPath(ctx, this.clipPath);
    },

    /**
     * Check if cache is dirty
     */
    isCacheDirty: function(skipCanvas) {
      if (this.callSuper('isCacheDirty', skipCanvas)) {
        return true;
      }
      if (!this.statefullCache) {
        return false;
      }
      for (var i = 0, len = this._objects.length; i < len; i++) {
        if (this._objects[i].isCacheDirty(true)) {
          if (this._cacheCanvas) {
            // if this group has not a cache canvas there is nothing to clean
            var x = this.cacheWidth / this.zoomX, y = this.cacheHeight / this.zoomY;
            this._cacheContext.clearRect(-x / 2, -y / 2, x, y);
          }
          return true;
        }
      }
      return false;
    },

    /**
     * Restores original state of each of group objects (original state is that which was before group was created).
     * if the nested boolean is true, the original state will be restored just for the
     * first group and not for all the group chain
     * @private
     * @param {Boolean} nested tell the function to restore object state up to the parent group and not more
     * @return {fabric.Group} thisArg
     * @chainable
     */
    _restoreObjectsState: function() {
      var groupMatrix = this.calcOwnMatrix();
      this._objects.forEach(function(object) {
        // instead of using _this = this;
        fabric.util.addTransformToObject(object, groupMatrix);
        delete object.group;
        object.setCoords();
      });
      return this;
    },

    /**
     * Destroys a group (restoring state of its objects)
     * @return {fabric.Group} thisArg
     * @chainable
     */
    destroy: function() {
      // when group is destroyed objects needs to get a repaint to be eventually
      // displayed on canvas.
      this._objects.forEach(function(object) {
        object.set('dirty', true);
      });
      return this._restoreObjectsState();
    },

    dispose: function () {
      this.callSuper('dispose');
      this.forEachObject(function (object) {
        object.dispose && object.dispose();
      });
      this._objects = [];
    },

    /**
     * make a group an active selection, remove the group from canvas
     * the group has to be on canvas for this to work.
     * @return {fabric.ActiveSelection} thisArg
     * @chainable
     */
    toActiveSelection: function() {
      if (!this.canvas) {
        return;
      }
      var objects = this._objects, canvas = this.canvas;
      this._objects = [];
      var options = this.toObject();
      delete options.objects;
      var activeSelection = new fabric.ActiveSelection([]);
      activeSelection.set(options);
      activeSelection.type = 'activeSelection';
      canvas.remove(this);
      objects.forEach(function(object) {
        object.group = activeSelection;
        object.dirty = true;
        canvas.add(object);
      });
      activeSelection.canvas = canvas;
      activeSelection._objects = objects;
      canvas._activeObject = activeSelection;
      activeSelection.setCoords();
      return activeSelection;
    },

    /**
     * Destroys a group (restoring state of its objects)
     * @return {fabric.Group} thisArg
     * @chainable
     */
    ungroupOnCanvas: function() {
      return this._restoreObjectsState();
    },

    /**
     * Sets coordinates of all objects inside group
     * @return {fabric.Group} thisArg
     * @chainable
     */
    setObjectsCoords: function() {
      var skipControls = true;
      this.forEachObject(function(object) {
        object.setCoords(skipControls);
      });
      return this;
    },

    /**
     * @private
     */
    _calcBounds: function(onlyWidthHeight) {
      var aX = [],
          aY = [],
          o, prop, coords,
          props = ['tr', 'br', 'bl', 'tl'],
          i = 0, iLen = this._objects.length,
          j, jLen = props.length;

      for ( ; i < iLen; ++i) {
        o = this._objects[i];
        coords = o.calcACoords();
        for (j = 0; j < jLen; j++) {
          prop = props[j];
          aX.push(coords[prop].x);
          aY.push(coords[prop].y);
        }
        o.aCoords = coords;
      }

      this._getBounds(aX, aY, onlyWidthHeight);
    },

    /**
     * @private
     */
    _getBounds: function(aX, aY, onlyWidthHeight) {
      var minXY = new fabric.Point(min(aX), min(aY)),
          maxXY = new fabric.Point(max(aX), max(aY)),
          top = minXY.y || 0, left = minXY.x || 0,
          width = (maxXY.x - minXY.x) || 0,
          height = (maxXY.y - minXY.y) || 0;
      this.width = width;
      this.height = height;
      if (!onlyWidthHeight) {
        // the bounding box always finds the topleft most corner.
        // whatever is the group origin, we set up here the left/top position.
        this.setPositionByOrigin({ x: left, y: top }, 'left', 'top');
      }
    },

    
  });

  /**
   * Returns {@link fabric.Group} instance from an object representation
   * @static
   * @memberOf fabric.Group
   * @param {Object} object Object to create a group from
   * @param {Function} [callback] Callback to invoke when an group instance is created
   */
  fabric.Group.fromObject = function(object, callback) {
    var objects = object.objects,
        options = fabric.util.object.clone(object, true);
    delete options.objects;
    if (typeof objects === 'string') {
      // it has to be an url or something went wrong.
      fabric.loadSVGFromURL(objects, function (elements) {
        var group = fabric.util.groupSVGElements(elements, object, objects);
        group.set(options);
        callback && callback(group);
      });
      return;
    }
    fabric.util.enlivenObjects(objects, function (enlivenedObjects) {
      var options = fabric.util.object.clone(object, true);
      delete options.objects;
      fabric.util.enlivenObjectEnlivables(object, options, function () {
        callback && callback(new fabric.Group(enlivenedObjects, options, true));
      });
    });
  };

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { });

  if (fabric.ActiveSelection) {
    return;
  }

  /**
   * Group class
   * @class fabric.ActiveSelection
   * @extends fabric.Group
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#groups}
   * @see {@link fabric.ActiveSelection#initialize} for constructor definition
   */
  fabric.ActiveSelection = fabric.util.createClass(fabric.Group, /** @lends fabric.ActiveSelection.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'activeSelection',

    /**
     * Constructor
     * @param {Object} objects ActiveSelection objects
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(objects, options) {
      options = options || {};
      this._objects = objects || [];
      for (var i = this._objects.length; i--; ) {
        this._objects[i].group = this;
      }

      if (options.originX) {
        this.originX = options.originX;
      }
      if (options.originY) {
        this.originY = options.originY;
      }
      this._calcBounds();
      this._updateObjectsCoords();
      fabric.Object.prototype.initialize.call(this, options);
      this.setCoords();
    },

    /**
     * Change te activeSelection to a normal group,
     * High level function that automatically adds it to canvas as
     * active object. no events fired.
     * @since 2.0.0
     * @return {fabric.Group}
     */
    toGroup: function() {
      var objects = this._objects.concat();
      this._objects = [];
      var options = fabric.Object.prototype.toObject.call(this);
      var newGroup = new fabric.Group([]);
      delete options.type;
      newGroup.set(options);
      objects.forEach(function(object) {
        object.canvas.remove(object);
        object.group = newGroup;
      });
      newGroup._objects = objects;
      if (!this.canvas) {
        return newGroup;
      }
      var canvas = this.canvas;
      canvas.add(newGroup);
      canvas._activeObject = newGroup;
      newGroup.setCoords();
      return newGroup;
    },

    /**
     * If returns true, deselection is cancelled.
     * @since 2.0.0
     * @return {Boolean} [cancel]
     */
    onDeselect: function() {
      this.destroy();
      return false;
    },

    /**
     * Returns string representation of a group
     * @return {String}
     */
    toString: function() {
      return '#<fabric.ActiveSelection: (' + this.complexity() + ')>';
    },

    /**
     * Decide if the object should cache or not. Create its own cache level
     * objectCaching is a global flag, wins over everything
     * needsItsOwnCache should be used when the object drawing method requires
     * a cache step. None of the fabric classes requires it.
     * Generally you do not cache objects in groups because the group outside is cached.
     * @return {Boolean}
     */
    shouldCache: function() {
      return false;
    },

    /**
     * Check if this group or its parent group are caching, recursively up
     * @return {Boolean}
     */
    isOnACache: function() {
      return false;
    },

    /**
     * Renders controls and borders for the object
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} [styleOverride] properties to override the object style
     * @param {Object} [childrenOverride] properties to override the children overrides
     */
    _renderControls: function(ctx, styleOverride, childrenOverride) {
      ctx.save();
      ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
      this.callSuper('_renderControls', ctx, styleOverride);
      childrenOverride = childrenOverride || { };
      if (typeof childrenOverride.hasControls === 'undefined') {
        childrenOverride.hasControls = false;
      }
      childrenOverride.forActiveSelection = true;
      for (var i = 0, len = this._objects.length; i < len; i++) {
        this._objects[i]._renderControls(ctx, childrenOverride);
      }
      ctx.restore();
    },
  });

  /**
   * Returns {@link fabric.ActiveSelection} instance from an object representation
   * @static
   * @memberOf fabric.ActiveSelection
   * @param {Object} object Object to create a group from
   * @param {Function} [callback] Callback to invoke when an ActiveSelection instance is created
   */
  fabric.ActiveSelection.fromObject = function(object, callback) {
    fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
      delete object.objects;
      callback && callback(new fabric.ActiveSelection(enlivenedObjects, object, true));
    });
  };

})(typeof exports !== 'undefined' ? exports : this);
fabric.util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {

  /**
   * @private
   * @return {Number} angle value
   */
  _getAngleValueForStraighten: function() {
    var angle = this.angle % 360;
    if (angle > 0) {
      return Math.round((angle - 1) / 90) * 90;
    }
    return Math.round(angle / 90) * 90;
  },

  /**
   * Straightens an object (rotating it from current angle to one of 0, 90, 180, 270, etc. depending on which is closer)
   * @return {fabric.Object} thisArg
   * @chainable
   */
  straighten: function() {
    return this.rotate(this._getAngleValueForStraighten());
  },

  /**
   * Same as {@link fabric.Object.prototype.straighten} but with animation
   * @param {Object} callbacks Object with callback functions
   * @param {Function} [callbacks.onComplete] Invoked on completion
   * @param {Function} [callbacks.onChange] Invoked on every step of animation
   * @return {fabric.Object} thisArg
   */
  fxStraighten: function(callbacks) {
    callbacks = callbacks || { };

    var empty = function() { },
        onComplete = callbacks.onComplete || empty,
        onChange = callbacks.onChange || empty,
        _this = this;

    return fabric.util.animate({
      target: this,
      startValue: this.get('angle'),
      endValue: this._getAngleValueForStraighten(),
      duration: this.FX_DURATION,
      onChange: function(value) {
        _this.rotate(value);
        onChange();
      },
      onComplete: function() {
        _this.setCoords();
        onComplete();
      },
    });
  }
});

fabric.util.object.extend(fabric.StaticCanvas.prototype, /** @lends fabric.StaticCanvas.prototype */ {

  /**
   * Straightens object, then rerenders canvas
   * @param {fabric.Object} object Object to straighten
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  straightenObject: function (object) {
    object.straighten();
    this.requestRenderAll();
    return this;
  },

  /**
   * Same as {@link fabric.Canvas.prototype.straightenObject}, but animated
   * @param {fabric.Object} object Object to straighten
   * @return {fabric.Canvas} thisArg
   */
  fxStraightenObject: function (object) {
    return object.fxStraighten({
      onChange: this.requestRenderAllBound
    });
  }
});
(function() {

  'use strict';

  /**
   * Tests if webgl supports certain precision
   * @param {WebGL} Canvas WebGL context to test on
   * @param {String} Precision to test can be any of following: 'lowp', 'mediump', 'highp'
   * @returns {Boolean} Whether the user's browser WebGL supports given precision.
   */
  function testPrecision(gl, precision){
    var fragmentSource = 'precision ' + precision + ' float;\nvoid main(){}';
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      return false;
    }
    return true;
  }

  /**
   * Indicate whether this filtering backend is supported by the user's browser.
   * @param {Number} tileSize check if the tileSize is supported
   * @returns {Boolean} Whether the user's browser supports WebGL.
   */
  fabric.isWebglSupported = function(tileSize) {
    if (fabric.isLikelyNode) {
      return false;
    }
    tileSize = tileSize || fabric.WebglFilterBackend.prototype.tileSize;
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    var isSupported = false;
    // eslint-disable-next-line
    if (gl) {
      fabric.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      isSupported = fabric.maxTextureSize >= tileSize;
      var precisions = ['highp', 'mediump', 'lowp'];
      for (var i = 0; i < 3; i++){
        if (testPrecision(gl, precisions[i])){
          fabric.webGlPrecision = precisions[i];
          break;
        };
      }
    }
    this.isSupported = isSupported;
    return isSupported;
  };

  fabric.WebglFilterBackend = WebglFilterBackend;

  /**
   * WebGL filter backend.
   */
  function WebglFilterBackend(options) {
    if (options && options.tileSize) {
      this.tileSize = options.tileSize;
    }
    this.setupGLContext(this.tileSize, this.tileSize);
    this.captureGPUInfo();
  };

  WebglFilterBackend.prototype = /** @lends fabric.WebglFilterBackend.prototype */ {

    tileSize: 2048,

    /**
     * Experimental. This object is a sort of repository of help layers used to avoid
     * of recreating them during frequent filtering. If you are previewing a filter with
     * a slider you probably do not want to create help layers every filter step.
     * in this object there will be appended some canvases, created once, resized sometimes
     * cleared never. Clearing is left to the developer.
     **/
    resources: {

    },

    /**
     * Setup a WebGL context suitable for filtering, and bind any needed event handlers.
     */
    setupGLContext: function(width, height) {
      this.dispose();
      this.createWebGLCanvas(width, height);
      // eslint-disable-next-line
      this.aPosition = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);
      this.chooseFastestCopyGLTo2DMethod(width, height);
    },

    /**
     * Pick a method to copy data from GL context to 2d canvas.  In some browsers using
     * putImageData is faster than drawImage for that specific operation.
     */
    chooseFastestCopyGLTo2DMethod: function(width, height) {
      var canMeasurePerf = typeof window.performance !== 'undefined', canUseImageData;
      try {
        new ImageData(1, 1);
        canUseImageData = true;
      }
      catch (e) {
        canUseImageData = false;
      }
      // eslint-disable-next-line no-undef
      var canUseArrayBuffer = typeof ArrayBuffer !== 'undefined';
      // eslint-disable-next-line no-undef
      var canUseUint8Clamped = typeof Uint8ClampedArray !== 'undefined';

      if (!(canMeasurePerf && canUseImageData && canUseArrayBuffer && canUseUint8Clamped)) {
        return;
      }

      var targetCanvas = fabric.util.createCanvasElement();
      // eslint-disable-next-line no-undef
      var imageBuffer = new ArrayBuffer(width * height * 4);
      if (fabric.forceGLPutImageData) {
        this.imageBuffer = imageBuffer;
        this.copyGLTo2D = copyGLTo2DPutImageData;
        return;
      }
      var testContext = {
        imageBuffer: imageBuffer,
        destinationWidth: width,
        destinationHeight: height,
        targetCanvas: targetCanvas
      };
      var startTime, drawImageTime, putImageDataTime;
      targetCanvas.width = width;
      targetCanvas.height = height;

      startTime = window.performance.now();
      copyGLTo2DDrawImage.call(testContext, this.gl, testContext);
      drawImageTime = window.performance.now() - startTime;

      startTime = window.performance.now();
      copyGLTo2DPutImageData.call(testContext, this.gl, testContext);
      putImageDataTime = window.performance.now() - startTime;

      if (drawImageTime > putImageDataTime) {
        this.imageBuffer = imageBuffer;
        this.copyGLTo2D = copyGLTo2DPutImageData;
      }
      else {
        this.copyGLTo2D = copyGLTo2DDrawImage;
      }
    },

    /**
     * Create a canvas element and associated WebGL context and attaches them as
     * class properties to the GLFilterBackend class.
     */
    createWebGLCanvas: function(width, height) {
      var canvas = fabric.util.createCanvasElement();
      canvas.width = width;
      canvas.height = height;
      var glOptions = {
            alpha: true,
            premultipliedAlpha: false,
            depth: false,
            stencil: false,
            antialias: false
          },
          gl = canvas.getContext('webgl', glOptions);
      if (!gl) {
        gl = canvas.getContext('experimental-webgl', glOptions);
      }
      if (!gl) {
        return;
      }
      gl.clearColor(0, 0, 0, 0);
      // this canvas can fire webglcontextlost and webglcontextrestored
      this.canvas = canvas;
      this.gl = gl;
    },

    /**
     * Attempts to apply the requested filters to the source provided, drawing the filtered output
     * to the provided target canvas.
     *
     * @param {Array} filters The filters to apply.
     * @param {HTMLImageElement|HTMLCanvasElement} source The source to be filtered.
     * @param {Number} width The width of the source input.
     * @param {Number} height The height of the source input.
     * @param {HTMLCanvasElement} targetCanvas The destination for filtered output to be drawn.
     * @param {String|undefined} cacheKey A key used to cache resources related to the source. If
     * omitted, caching will be skipped.
     */
    applyFilters: function(filters, source, width, height, targetCanvas, cacheKey) {
      var gl = this.gl;
      var cachedTexture;
      if (cacheKey) {
        cachedTexture = this.getCachedTexture(cacheKey, source);
      }
      var pipelineState = {
        originalWidth: source.width || source.originalWidth,
        originalHeight: source.height || source.originalHeight,
        sourceWidth: width,
        sourceHeight: height,
        destinationWidth: width,
        destinationHeight: height,
        context: gl,
        sourceTexture: this.createTexture(gl, width, height, !cachedTexture && source),
        targetTexture: this.createTexture(gl, width, height),
        originalTexture: cachedTexture ||
          this.createTexture(gl, width, height, !cachedTexture && source),
        passes: filters.length,
        webgl: true,
        aPosition: this.aPosition,
        programCache: this.programCache,
        pass: 0,
        filterBackend: this,
        targetCanvas: targetCanvas
      };
      var tempFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo);
      filters.forEach(function(filter) { filter && filter.applyTo(pipelineState); });
      resizeCanvasIfNeeded(pipelineState);
      this.copyGLTo2D(gl, pipelineState);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(pipelineState.sourceTexture);
      gl.deleteTexture(pipelineState.targetTexture);
      gl.deleteFramebuffer(tempFbo);
      targetCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
      return pipelineState;
    },

    /**
     * Detach event listeners, remove references, and clean up caches.
     */
    dispose: function() {
      if (this.canvas) {
        this.canvas = null;
        this.gl = null;
      }
      this.clearWebGLCaches();
    },

    /**
     * Wipe out WebGL-related caches.
     */
    clearWebGLCaches: function() {
      this.programCache = {};
      this.textureCache = {};
    },

    /**
     * Create a WebGL texture object.
     *
     * Accepts specific dimensions to initialize the texture to or a source image.
     *
     * @param {WebGLRenderingContext} gl The GL context to use for creating the texture.
     * @param {Number} width The width to initialize the texture at.
     * @param {Number} height The height to initialize the texture.
     * @param {HTMLImageElement|HTMLCanvasElement} textureImageSource A source for the texture data.
     * @returns {WebGLTexture}
     */
    createTexture: function(gl, width, height, textureImageSource) {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (textureImageSource) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImageSource);
      }
      else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      return texture;
    },

    /**
     * Can be optionally used to get a texture from the cache array
     *
     * If an existing texture is not found, a new texture is created and cached.
     *
     * @param {String} uniqueId A cache key to use to find an existing texture.
     * @param {HTMLImageElement|HTMLCanvasElement} textureImageSource A source to use to create the
     * texture cache entry if one does not already exist.
     */
    getCachedTexture: function(uniqueId, textureImageSource) {
      if (this.textureCache[uniqueId]) {
        return this.textureCache[uniqueId];
      }
      else {
        var texture = this.createTexture(
          this.gl, textureImageSource.width, textureImageSource.height, textureImageSource);
        this.textureCache[uniqueId] = texture;
        return texture;
      }
    },

    /**
     * Clear out cached resources related to a source image that has been
     * filtered previously.
     *
     * @param {String} cacheKey The cache key provided when the source image was filtered.
     */
    evictCachesForKey: function(cacheKey) {
      if (this.textureCache[cacheKey]) {
        this.gl.deleteTexture(this.textureCache[cacheKey]);
        delete this.textureCache[cacheKey];
      }
    },

    copyGLTo2D: copyGLTo2DDrawImage,

    /**
     * Attempt to extract GPU information strings from a WebGL context.
     *
     * Useful information when debugging or blacklisting specific GPUs.
     *
     * @returns {Object} A GPU info object with renderer and vendor strings.
     */
    captureGPUInfo: function() {
      if (this.gpuInfo) {
        return this.gpuInfo;
      }
      var gl = this.gl, gpuInfo = { renderer: '', vendor: '' };
      if (!gl) {
        return gpuInfo;
      }
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        var renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        var vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        if (renderer) {
          gpuInfo.renderer = renderer.toLowerCase();
        }
        if (vendor) {
          gpuInfo.vendor = vendor.toLowerCase();
        }
      }
      this.gpuInfo = gpuInfo;
      return gpuInfo;
    },
  };
})();

function resizeCanvasIfNeeded(pipelineState) {
  var targetCanvas = pipelineState.targetCanvas,
      width = targetCanvas.width, height = targetCanvas.height,
      dWidth = pipelineState.destinationWidth,
      dHeight = pipelineState.destinationHeight;

  if (width !== dWidth || height !== dHeight) {
    targetCanvas.width = dWidth;
    targetCanvas.height = dHeight;
  }
}

/**
 * Copy an input WebGL canvas on to an output 2D canvas.
 *
 * The WebGL canvas is assumed to be upside down, with the top-left pixel of the
 * desired output image appearing in the bottom-left corner of the WebGL canvas.
 *
 * @param {WebGLRenderingContext} sourceContext The WebGL context to copy from.
 * @param {HTMLCanvasElement} targetCanvas The 2D target canvas to copy on to.
 * @param {Object} pipelineState The 2D target canvas to copy on to.
 */
function copyGLTo2DDrawImage(gl, pipelineState) {
  var glCanvas = gl.canvas, targetCanvas = pipelineState.targetCanvas,
      ctx = targetCanvas.getContext('2d');
  ctx.translate(0, targetCanvas.height); // move it down again
  ctx.scale(1, -1); // vertical flip
  // where is my image on the big glcanvas?
  var sourceY = glCanvas.height - targetCanvas.height;
  ctx.drawImage(glCanvas, 0, sourceY, targetCanvas.width, targetCanvas.height, 0, 0,
    targetCanvas.width, targetCanvas.height);
}

/**
 * Copy an input WebGL canvas on to an output 2D canvas using 2d canvas' putImageData
 * API. Measurably faster than using ctx.drawImage in Firefox (version 54 on OSX Sierra).
 *
 * @param {WebGLRenderingContext} sourceContext The WebGL context to copy from.
 * @param {HTMLCanvasElement} targetCanvas The 2D target canvas to copy on to.
 * @param {Object} pipelineState The 2D target canvas to copy on to.
 */
function copyGLTo2DPutImageData(gl, pipelineState) {
  var targetCanvas = pipelineState.targetCanvas, ctx = targetCanvas.getContext('2d'),
      dWidth = pipelineState.destinationWidth,
      dHeight = pipelineState.destinationHeight,
      numBytes = dWidth * dHeight * 4;

  // eslint-disable-next-line no-undef
  var u8 = new Uint8Array(this.imageBuffer, 0, numBytes);
  // eslint-disable-next-line no-undef
  var u8Clamped = new Uint8ClampedArray(this.imageBuffer, 0, numBytes);

  gl.readPixels(0, 0, dWidth, dHeight, gl.RGBA, gl.UNSIGNED_BYTE, u8);
  var imgData = new ImageData(u8Clamped, dWidth, dHeight);
  ctx.putImageData(imgData, 0, 0);
}
(function() {

  'use strict';

  var noop = function() {};

  fabric.Canvas2dFilterBackend = Canvas2dFilterBackend;

  /**
   * Canvas 2D filter backend.
   */
  function Canvas2dFilterBackend() {};

  Canvas2dFilterBackend.prototype = /** @lends fabric.Canvas2dFilterBackend.prototype */ {
    evictCachesForKey: noop,
    dispose: noop,
    clearWebGLCaches: noop,

    /**
     * Experimental. This object is a sort of repository of help layers used to avoid
     * of recreating them during frequent filtering. If you are previewing a filter with
     * a slider you probably do not want to create help layers every filter step.
     * in this object there will be appended some canvases, created once, resized sometimes
     * cleared never. Clearing is left to the developer.
     **/
    resources: {

    },

    /**
     * Apply a set of filters against a source image and draw the filtered output
     * to the provided destination canvas.
     *
     * @param {EnhancedFilter} filters The filter to apply.
     * @param {HTMLImageElement|HTMLCanvasElement} sourceElement The source to be filtered.
     * @param {Number} sourceWidth The width of the source input.
     * @param {Number} sourceHeight The height of the source input.
     * @param {HTMLCanvasElement} targetCanvas The destination for filtered output to be drawn.
     */
    applyFilters: function(filters, sourceElement, sourceWidth, sourceHeight, targetCanvas) {
      var ctx = targetCanvas.getContext('2d');
      ctx.drawImage(sourceElement, 0, 0, sourceWidth, sourceHeight);
      var imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      var originalImageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      var pipelineState = {
        sourceWidth: sourceWidth,
        sourceHeight: sourceHeight,
        imageData: imageData,
        originalEl: sourceElement,
        originalImageData: originalImageData,
        canvasEl: targetCanvas,
        ctx: ctx,
        filterBackend: this,
      };
      filters.forEach(function(filter) { filter.applyTo(pipelineState); });
      if (pipelineState.imageData.width !== sourceWidth || pipelineState.imageData.height !== sourceHeight) {
        targetCanvas.width = pipelineState.imageData.width;
        targetCanvas.height = pipelineState.imageData.height;
      }
      ctx.putImageData(pipelineState.imageData, 0, 0);
      return pipelineState;
    },

  };
})();
/**
 * @namespace fabric.Image.filters
 * @memberOf fabric.Image
 * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#image_filters}
 * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
 */
fabric.Image = fabric.Image || { };
fabric.Image.filters = fabric.Image.filters || { };

/**
 * Root filter class from which all filter classes inherit from
 * @class fabric.Image.filters.BaseFilter
 * @memberOf fabric.Image.filters
 */
fabric.Image.filters.BaseFilter = fabric.util.createClass(/** @lends fabric.Image.filters.BaseFilter.prototype */ {

  /**
   * Filter type
   * @param {String} type
   * @default
   */
  type: 'BaseFilter',

  /**
   * Array of attributes to send with buffers. do not modify
   * @private
   */

  vertexSource: 'attribute vec2 aPosition;\n' +
    'varying vec2 vTexCoord;\n' +
    'void main() {\n' +
      'vTexCoord = aPosition;\n' +
      'gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);\n' +
    '}',

  fragmentSource: 'precision highp float;\n' +
    'varying vec2 vTexCoord;\n' +
    'uniform sampler2D uTexture;\n' +
    'void main() {\n' +
      'gl_FragColor = texture2D(uTexture, vTexCoord);\n' +
    '}',

  /**
   * Constructor
   * @param {Object} [options] Options object
   */
  initialize: function(options) {
    if (options) {
      this.setOptions(options);
    }
  },

  /**
   * Sets filter's properties from options
   * @param {Object} [options] Options object
   */
  setOptions: function(options) {
    for (var prop in options) {
      this[prop] = options[prop];
    }
  },

  /**
   * Compile this filter's shader program.
   *
   * @param {WebGLRenderingContext} gl The GL canvas context to use for shader compilation.
   * @param {String} fragmentSource fragmentShader source for compilation
   * @param {String} vertexSource vertexShader source for compilation
   */
  createProgram: function(gl, fragmentSource, vertexSource) {
    fragmentSource = fragmentSource || this.fragmentSource;
    vertexSource = vertexSource || this.vertexSource;
    if (fabric.webGlPrecision !== 'highp'){
      fragmentSource = fragmentSource.replace(
        /precision highp float/g,
        'precision ' + fabric.webGlPrecision + ' float'
      );
    }
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(
        // eslint-disable-next-line prefer-template
        'Vertex shader compile error for ' + this.type + ': ' +
        gl.getShaderInfoLog(vertexShader)
      );
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(
        // eslint-disable-next-line prefer-template
        'Fragment shader compile error for ' + this.type + ': ' +
        gl.getShaderInfoLog(fragmentShader)
      );
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        // eslint-disable-next-line prefer-template
        'Shader link error for "${this.type}" ' +
        gl.getProgramInfoLog(program)
      );
    }

    var attributeLocations = this.getAttributeLocations(gl, program);
    var uniformLocations = this.getUniformLocations(gl, program) || { };
    uniformLocations.uStepW = gl.getUniformLocation(program, 'uStepW');
    uniformLocations.uStepH = gl.getUniformLocation(program, 'uStepH');
    return {
      program: program,
      attributeLocations: attributeLocations,
      uniformLocations: uniformLocations
    };
  },

  /**
   * Return a map of attribute names to WebGLAttributeLocation objects.
   *
   * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
   * @param {WebGLShaderProgram} program The shader program from which to take attribute locations.
   * @returns {Object} A map of attribute names to attribute locations.
   */
  getAttributeLocations: function(gl, program) {
    return {
      aPosition: gl.getAttribLocation(program, 'aPosition'),
    };
  },

  /**
   * Return a map of uniform names to WebGLUniformLocation objects.
   *
   * Intended to be overridden by subclasses.
   *
   * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
   * @param {WebGLShaderProgram} program The shader program from which to take uniform locations.
   * @returns {Object} A map of uniform names to uniform locations.
   */
  getUniformLocations: function (/* gl, program */) {
    // in case i do not need any special uniform i need to return an empty object
    return { };
  },

  /**
   * Send attribute data from this filter to its shader program on the GPU.
   *
   * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
   * @param {Object} attributeLocations A map of shader attribute names to their locations.
   */
  sendAttributeData: function(gl, attributeLocations, aPositionData) {
    var attributeLocation = attributeLocations.aPosition;
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, aPositionData, gl.STATIC_DRAW);
  },

  _setupFrameBuffer: function(options) {
    var gl = options.context, width, height;
    if (options.passes > 1) {
      width = options.destinationWidth;
      height = options.destinationHeight;
      if (options.sourceWidth !== width || options.sourceHeight !== height) {
        gl.deleteTexture(options.targetTexture);
        options.targetTexture = options.filterBackend.createTexture(gl, width, height);
      }
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
        options.targetTexture, 0);
    }
    else {
      // draw last filter on canvas and not to framebuffer.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.finish();
    }
  },

  _swapTextures: function(options) {
    options.passes--;
    options.pass++;
    var temp = options.targetTexture;
    options.targetTexture = options.sourceTexture;
    options.sourceTexture = temp;
  },

  /**
   * Generic isNeutral implementation for one parameter based filters.
   * Used only in image applyFilters to discard filters that will not have an effect
   * on the image
   * Other filters may need their own version ( ColorMatrix, HueRotation, gamma, ComposedFilter )
   * @param {Object} options
   **/
  isNeutralState: function(/* options */) {
    var main = this.mainParameter,
        _class = fabric.Image.filters[this.type].prototype;
    if (main) {
      if (Array.isArray(_class[main])) {
        for (var i = _class[main].length; i--;) {
          if (this[main][i] !== _class[main][i]) {
            return false;
          }
        }
        return true;
      }
      else {
        return _class[main] === this[main];
      }
    }
    else {
      return false;
    }
  },

  /**
   * Apply this filter to the input image data provided.
   *
   * Determines whether to use WebGL or Canvas2D based on the options.webgl flag.
   *
   * @param {Object} options
   * @param {Number} options.passes The number of filters remaining to be executed
   * @param {Boolean} options.webgl Whether to use webgl to render the filter.
   * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
   * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
   * @param {WebGLRenderingContext} options.context The GL context used for rendering.
   * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
   */
  applyTo: function(options) {
    if (options.webgl) {
      this._setupFrameBuffer(options);
      this.applyToWebGL(options);
      this._swapTextures(options);
    }
    else {
      this.applyTo2d(options);
    }
  },

  /**
   * Retrieves the cached shader.
   * @param {Object} options
   * @param {WebGLRenderingContext} options.context The GL context used for rendering.
   * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
   */
  retrieveShader: function(options) {
    if (!options.programCache.hasOwnProperty(this.type)) {
      options.programCache[this.type] = this.createProgram(options.context);
    }
    return options.programCache[this.type];
  },

  /**
   * Apply this filter using webgl.
   *
   * @param {Object} options
   * @param {Number} options.passes The number of filters remaining to be executed
   * @param {Boolean} options.webgl Whether to use webgl to render the filter.
   * @param {WebGLTexture} options.originalTexture The texture of the original input image.
   * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
   * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
   * @param {WebGLRenderingContext} options.context The GL context used for rendering.
   * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
   */
  applyToWebGL: function(options) {
    var gl = options.context;
    var shader = this.retrieveShader(options);
    if (options.pass === 0 && options.originalTexture) {
      gl.bindTexture(gl.TEXTURE_2D, options.originalTexture);
    }
    else {
      gl.bindTexture(gl.TEXTURE_2D, options.sourceTexture);
    }
    gl.useProgram(shader.program);
    this.sendAttributeData(gl, shader.attributeLocations, options.aPosition);

    gl.uniform1f(shader.uniformLocations.uStepW, 1 / options.sourceWidth);
    gl.uniform1f(shader.uniformLocations.uStepH, 1 / options.sourceHeight);

    this.sendUniformData(gl, shader.uniformLocations);
    gl.viewport(0, 0, options.destinationWidth, options.destinationHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },

  bindAdditionalTexture: function(gl, texture, textureUnit) {
    gl.activeTexture(textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // reset active texture to 0 as usual
    gl.activeTexture(gl.TEXTURE0);
  },

  unbindAdditionalTexture: function(gl, textureUnit) {
    gl.activeTexture(textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
  },

  getMainParameter: function() {
    return this[this.mainParameter];
  },

  setMainParameter: function(value) {
    this[this.mainParameter] = value;
  },

  /**
   * Send uniform data from this filter to its shader program on the GPU.
   *
   * Intended to be overridden by subclasses.
   *
   * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
   * @param {Object} uniformLocations A map of shader uniform names to their locations.
   */
  sendUniformData: function(/* gl, uniformLocations */) {
    // Intentionally left blank.  Override me in subclasses.
  },

  /**
   * If needed by a 2d filter, this functions can create an helper canvas to be used
   * remember that options.targetCanvas is available for use till end of chain.
   */
  createHelpLayer: function(options) {
    if (!options.helpLayer) {
      var helpLayer = document.createElement('canvas');
      helpLayer.width = options.sourceWidth;
      helpLayer.height = options.sourceHeight;
      options.helpLayer = helpLayer;
    }
  },

  /**
   * Returns object representation of an instance
   * @return {Object} Object representation of an instance
   */
  toObject: function() {
    var object = { type: this.type }, mainP = this.mainParameter;
    if (mainP) {
      object[mainP] = this[mainP];
    }
    return object;
  },

  /**
   * Returns a JSON representation of an instance
   * @return {Object} JSON
   */
  toJSON: function() {
    // delegate, not alias
    return this.toObject();
  }
});

fabric.Image.filters.BaseFilter.fromObject = function(object, callback) {
  var filter = new fabric.Image.filters[object.type](object);
  callback && callback(filter);
  return filter;
};
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Color Matrix filter class
   * @class fabric.Image.filters.ColorMatrix
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.ColorMatrix#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @see {@Link http://www.webwasp.co.uk/tutorials/219/Color_Matrix_Filter.php}
   * @see {@Link http://phoboslab.org/log/2013/11/fast-image-filters-with-webgl}
   * @example <caption>Kodachrome filter</caption>
   * var filter = new fabric.Image.filters.ColorMatrix({
   *  matrix: [
       1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502,
       -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203,
       -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946,
       0, 0, 0, 1, 0
      ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.ColorMatrix = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.ColorMatrix.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'ColorMatrix',

    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'varying vec2 vTexCoord;\n' +
      'uniform mat4 uColorMatrix;\n' +
      'uniform vec4 uConstants;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'color *= uColorMatrix;\n' +
        'color += uConstants;\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * Colormatrix for pixels.
     * array of 20 floats. Numbers in positions 4, 9, 14, 19 loose meaning
     * outside the -1, 1 range.
     * 0.0039215686 is the part of 1 that get translated to 1 in 2d
     * @param {Array} matrix array of 20 numbers.
     * @default
     */
    matrix: [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0
    ],

    mainParameter: 'matrix',

    /**
     * Lock the colormatrix on the color part, skipping alpha, mainly for non webgl scenario
     * to save some calculation
     * @type Boolean
     * @default true
     */
    colorsOnly: true,

    /**
     * Constructor
     * @param {Object} [options] Options object
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
      // create a new array instead mutating the prototype with push
      this.matrix = this.matrix.slice(0);
    },

    /**
     * Apply the ColorMatrix operation to a Uint8Array representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8Array to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data,
          iLen = data.length,
          m = this.matrix,
          r, g, b, a, i, colorsOnly = this.colorsOnly;

      for (i = 0; i < iLen; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        if (colorsOnly) {
          data[i] = r * m[0] + g * m[1] + b * m[2] + m[4] * 255;
          data[i + 1] = r * m[5] + g * m[6] + b * m[7] + m[9] * 255;
          data[i + 2] = r * m[10] + g * m[11] + b * m[12] + m[14] * 255;
        }
        else {
          a = data[i + 3];
          data[i] = r * m[0] + g * m[1] + b * m[2] + a * m[3] + m[4] * 255;
          data[i + 1] = r * m[5] + g * m[6] + b * m[7] + a * m[8] + m[9] * 255;
          data[i + 2] = r * m[10] + g * m[11] + b * m[12] + a * m[13] + m[14] * 255;
          data[i + 3] = r * m[15] + g * m[16] + b * m[17] + a * m[18] + m[19] * 255;
        }
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uColorMatrix: gl.getUniformLocation(program, 'uColorMatrix'),
        uConstants: gl.getUniformLocation(program, 'uConstants'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var m = this.matrix,
          matrix = [
            m[0], m[1], m[2], m[3],
            m[5], m[6], m[7], m[8],
            m[10], m[11], m[12], m[13],
            m[15], m[16], m[17], m[18]
          ],
          constants = [m[4], m[9], m[14], m[19]];
      gl.uniformMatrix4fv(uniformLocations.uColorMatrix, false, matrix);
      gl.uniform4fv(uniformLocations.uConstants, constants);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] function to invoke after filter creation
   * @return {fabric.Image.filters.ColorMatrix} Instance of fabric.Image.filters.ColorMatrix
   */
  fabric.Image.filters.ColorMatrix.fromObject = fabric.Image.filters.BaseFilter.fromObject;
})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Brightness filter class
   * @class fabric.Image.filters.Brightness
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Brightness#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Brightness({
   *   brightness: 0.05
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Brightness = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Brightness.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Brightness',

    /**
     * Fragment source for the brightness program
     */
    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform float uBrightness;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'color.rgb += uBrightness;\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * Brightness value, from -1 to 1.
     * translated to -255 to 255 for 2d
     * 0.0039215686 is the part of 1 that get translated to 1 in 2d
     * @param {Number} brightness
     * @default
     */
    brightness: 0,

    /**
     * Describe the property that is the filter parameter
     * @param {String} m
     * @default
     */
    mainParameter: 'brightness',

    /**
    * Apply the Brightness operation to a Uint8ClampedArray representing the pixels of an image.
    *
    * @param {Object} options
    * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
    */
    applyTo2d: function(options) {
      if (this.brightness === 0) {
        return;
      }
      var imageData = options.imageData,
          data = imageData.data, i, len = data.length,
          brightness = Math.round(this.brightness * 255);
      for (i = 0; i < len; i += 4) {
        data[i] = data[i] + brightness;
        data[i + 1] = data[i + 1] + brightness;
        data[i + 2] = data[i + 2] + brightness;
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uBrightness: gl.getUniformLocation(program, 'uBrightness'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uBrightness, this.brightness);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Brightness} Instance of fabric.Image.filters.Brightness
   */
  fabric.Image.filters.Brightness.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Adapted from <a href="http://www.html5rocks.com/en/tutorials/canvas/imagefilters/">html5rocks article</a>
   * @class fabric.Image.filters.Convolute
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Convolute#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example <caption>Sharpen filter</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   matrix: [ 0, -1,  0,
   *            -1,  5, -1,
   *             0, -1,  0 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   * @example <caption>Blur filter</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   matrix: [ 1/9, 1/9, 1/9,
   *             1/9, 1/9, 1/9,
   *             1/9, 1/9, 1/9 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   * @example <caption>Emboss filter</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   matrix: [ 1,   1,  1,
   *             1, 0.7, -1,
   *            -1,  -1, -1 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   * @example <caption>Emboss filter with opaqueness</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   opaque: true,
   *   matrix: [ 1,   1,  1,
   *             1, 0.7, -1,
   *            -1,  -1, -1 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */
  filters.Convolute = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Convolute.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Convolute',

    /*
     * Opaque value (true/false)
     */
    opaque: false,

    /*
     * matrix for the filter, max 9x9
     */
    matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0],

    /**
     * Fragment source for the brightness program
     */
    fragmentSource: {
      Convolute_3_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[9];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 3.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 3.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 1), uStepH * (h - 1));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 3.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_3_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[9];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 3.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 3.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 1.0), uStepH * (h - 1.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 3.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
      Convolute_5_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[25];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 5.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 5.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 2.0), uStepH * (h - 2.0));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 5.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_5_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[25];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 5.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 5.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 2.0), uStepH * (h - 2.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 5.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
      Convolute_7_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[49];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 7.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 7.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 3.0), uStepH * (h - 3.0));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 7.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_7_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[49];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 7.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 7.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 3.0), uStepH * (h - 3.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 7.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
      Convolute_9_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[81];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 9.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 9.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 4.0), uStepH * (h - 4.0));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 9.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_9_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[81];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 9.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 9.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 4.0), uStepH * (h - 4.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 9.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
    },

    /**
     * Constructor
     * @memberOf fabric.Image.filters.Convolute.prototype
     * @param {Object} [options] Options object
     * @param {Boolean} [options.opaque=false] Opaque value (true/false)
     * @param {Array} [options.matrix] Filter matrix
     */


    /**
    * Retrieves the cached shader.
    * @param {Object} options
    * @param {WebGLRenderingContext} options.context The GL context used for rendering.
    * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
    */
    retrieveShader: function(options) {
      var size = Math.sqrt(this.matrix.length);
      var cacheKey = this.type + '_' + size + '_' + (this.opaque ? 1 : 0);
      var shaderSource = this.fragmentSource[cacheKey];
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    /**
     * Apply the Brightness operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data,
          weights = this.matrix,
          side = Math.round(Math.sqrt(weights.length)),
          halfSide = Math.floor(side / 2),
          sw = imageData.width,
          sh = imageData.height,
          output = options.ctx.createImageData(sw, sh),
          dst = output.data,
          // go through the destination image pixels
          alphaFac = this.opaque ? 1 : 0,
          r, g, b, a, dstOff,
          scx, scy, srcOff, wt,
          x, y, cx, cy;

      for (y = 0; y < sh; y++) {
        for (x = 0; x < sw; x++) {
          dstOff = (y * sw + x) * 4;
          // calculate the weighed sum of the source image pixels that
          // fall under the convolution matrix
          r = 0; g = 0; b = 0; a = 0;

          for (cy = 0; cy < side; cy++) {
            for (cx = 0; cx < side; cx++) {
              scy = y + cy - halfSide;
              scx = x + cx - halfSide;

              // eslint-disable-next-line max-depth
              if (scy < 0 || scy >= sh || scx < 0 || scx >= sw) {
                continue;
              }

              srcOff = (scy * sw + scx) * 4;
              wt = weights[cy * side + cx];

              r += data[srcOff] * wt;
              g += data[srcOff + 1] * wt;
              b += data[srcOff + 2] * wt;
              // eslint-disable-next-line max-depth
              if (!alphaFac) {
                a += data[srcOff + 3] * wt;
              }
            }
          }
          dst[dstOff] = r;
          dst[dstOff + 1] = g;
          dst[dstOff + 2] = b;
          if (!alphaFac) {
            dst[dstOff + 3] = a;
          }
          else {
            dst[dstOff + 3] = data[dstOff + 3];
          }
        }
      }
      options.imageData = output;
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uMatrix: gl.getUniformLocation(program, 'uMatrix'),
        uOpaque: gl.getUniformLocation(program, 'uOpaque'),
        uHalfSize: gl.getUniformLocation(program, 'uHalfSize'),
        uSize: gl.getUniformLocation(program, 'uSize'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1fv(uniformLocations.uMatrix, this.matrix);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return extend(this.callSuper('toObject'), {
        opaque: this.opaque,
        matrix: this.matrix
      });
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Convolute} Instance of fabric.Image.filters.Convolute
   */
  fabric.Image.filters.Convolute.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Grayscale image filter class
   * @class fabric.Image.filters.Grayscale
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Grayscale();
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Grayscale = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Grayscale.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Grayscale',

    fragmentSource: {
      average: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'float average = (color.r + color.b + color.g) / 3.0;\n' +
          'gl_FragColor = vec4(average, average, average, color.a);\n' +
        '}',
      lightness: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform int uMode;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 col = texture2D(uTexture, vTexCoord);\n' +
          'float average = (max(max(col.r, col.g),col.b) + min(min(col.r, col.g),col.b)) / 2.0;\n' +
          'gl_FragColor = vec4(average, average, average, col.a);\n' +
        '}',
      luminosity: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform int uMode;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 col = texture2D(uTexture, vTexCoord);\n' +
          'float average = 0.21 * col.r + 0.72 * col.g + 0.07 * col.b;\n' +
          'gl_FragColor = vec4(average, average, average, col.a);\n' +
        '}',
    },


    /**
     * Grayscale mode, between 'average', 'lightness', 'luminosity'
     * @param {String} type
     * @default
     */
    mode: 'average',

    mainParameter: 'mode',

    /**
     * Apply the Grayscale operation to a Uint8Array representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8Array to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data, i,
          len = data.length, value,
          mode = this.mode;
      for (i = 0; i < len; i += 4) {
        if (mode === 'average') {
          value = (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        else if (mode === 'lightness') {
          value = (Math.min(data[i], data[i + 1], data[i + 2]) +
            Math.max(data[i], data[i + 1], data[i + 2])) / 2;
        }
        else if (mode === 'luminosity') {
          value = 0.21 * data[i] + 0.72 * data[i + 1] + 0.07 * data[i + 2];
        }
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var cacheKey = this.type + '_' + this.mode;
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        var shaderSource = this.fragmentSource[this.mode];
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uMode: gl.getUniformLocation(program, 'uMode'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      // default average mode.
      var mode = 1;
      gl.uniform1i(uniformLocations.uMode, mode);
    },

    /**
     * Grayscale filter isNeutralState implementation
     * The filter is never neutral
     * on the image
     **/
    isNeutralState: function() {
      return false;
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Grayscale} Instance of fabric.Image.filters.Grayscale
   */
  fabric.Image.filters.Grayscale.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Invert filter class
   * @class fabric.Image.filters.Invert
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Invert();
   * object.filters.push(filter);
   * object.applyFilters(canvas.renderAll.bind(canvas));
   */
  filters.Invert = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Invert.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Invert',

    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform int uInvert;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'if (uInvert == 1) {\n' +
          'gl_FragColor = vec4(1.0 - color.r,1.0 -color.g,1.0 -color.b,color.a);\n' +
        '} else {\n' +
          'gl_FragColor = color;\n' +
        '}\n' +
      '}',

    /**
     * Filter invert. if false, does nothing
     * @param {Boolean} invert
     * @default
     */
    invert: true,

    mainParameter: 'invert',

    /**
     * Apply the Invert operation to a Uint8Array representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8Array to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data, i,
          len = data.length;
      for (i = 0; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
    },

    /**
     * Invert filter isNeutralState implementation
     * Used only in image applyFilters to discard filters that will not have an effect
     * on the image
     * @param {Object} options
     **/
    isNeutralState: function() {
      return !this.invert;
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uInvert: gl.getUniformLocation(program, 'uInvert'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1i(uniformLocations.uInvert, this.invert);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Invert} Instance of fabric.Image.filters.Invert
   */
  fabric.Image.filters.Invert.fromObject = fabric.Image.filters.BaseFilter.fromObject;


})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Noise filter class
   * @class fabric.Image.filters.Noise
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Noise#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Noise({
   *   noise: 700
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */
  filters.Noise = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Noise.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Noise',

    /**
     * Fragment source for the noise program
     */
    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform float uStepH;\n' +
      'uniform float uNoise;\n' +
      'uniform float uSeed;\n' +
      'varying vec2 vTexCoord;\n' +
      'float rand(vec2 co, float seed, float vScale) {\n' +
        'return fract(sin(dot(co.xy * vScale ,vec2(12.9898 , 78.233))) * 43758.5453 * (seed + 0.01) / 2.0);\n' +
      '}\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'color.rgb += (0.5 - rand(vTexCoord, uSeed, 0.1 / uStepH)) * uNoise;\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * Describe the property that is the filter parameter
     * @param {String} m
     * @default
     */
    mainParameter: 'noise',

    /**
     * Noise value, from
     * @param {Number} noise
     * @default
     */
    noise: 0,

    /**
     * Apply the Brightness operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      if (this.noise === 0) {
        return;
      }
      var imageData = options.imageData,
          data = imageData.data, i, len = data.length,
          noise = this.noise, rand;

      for (i = 0, len = data.length; i < len; i += 4) {

        rand = (0.5 - Math.random()) * noise;

        data[i] += rand;
        data[i + 1] += rand;
        data[i + 2] += rand;
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uNoise: gl.getUniformLocation(program, 'uNoise'),
        uSeed: gl.getUniformLocation(program, 'uSeed'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uNoise, this.noise / 255);
      gl.uniform1f(uniformLocations.uSeed, Math.random());
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return extend(this.callSuper('toObject'), {
        noise: this.noise
      });
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Noise} Instance of fabric.Image.filters.Noise
   */
  fabric.Image.filters.Noise.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Pixelate filter class
   * @class fabric.Image.filters.Pixelate
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Pixelate#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Pixelate({
   *   blocksize: 8
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Pixelate = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Pixelate.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Pixelate',

    blocksize: 4,

    mainParameter: 'blocksize',

    /**
     * Fragment source for the Pixelate program
     */
    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform float uBlocksize;\n' +
      'uniform float uStepW;\n' +
      'uniform float uStepH;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'float blockW = uBlocksize * uStepW;\n' +
        'float blockH = uBlocksize * uStepW;\n' +
        'int posX = int(vTexCoord.x / blockW);\n' +
        'int posY = int(vTexCoord.y / blockH);\n' +
        'float fposX = float(posX);\n' +
        'float fposY = float(posY);\n' +
        'vec2 squareCoords = vec2(fposX * blockW, fposY * blockH);\n' +
        'vec4 color = texture2D(uTexture, squareCoords);\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * Apply the Pixelate operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data,
          iLen = imageData.height,
          jLen = imageData.width,
          index, i, j, r, g, b, a,
          _i, _j, _iLen, _jLen;

      for (i = 0; i < iLen; i += this.blocksize) {
        for (j = 0; j < jLen; j += this.blocksize) {

          index = (i * 4) * jLen + (j * 4);

          r = data[index];
          g = data[index + 1];
          b = data[index + 2];
          a = data[index + 3];

          _iLen = Math.min(i + this.blocksize, iLen);
          _jLen = Math.min(j + this.blocksize, jLen);
          for (_i = i; _i < _iLen; _i++) {
            for (_j = j; _j < _jLen; _j++) {
              index = (_i * 4) * jLen + (_j * 4);
              data[index] = r;
              data[index + 1] = g;
              data[index + 2] = b;
              data[index + 3] = a;
            }
          }
        }
      }
    },

    /**
     * Indicate when the filter is not gonna apply changes to the image
     **/
    isNeutralState: function() {
      return this.blocksize === 1;
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uBlocksize: gl.getUniformLocation(program, 'uBlocksize'),
        uStepW: gl.getUniformLocation(program, 'uStepW'),
        uStepH: gl.getUniformLocation(program, 'uStepH'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uBlocksize, this.blocksize);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Pixelate} Instance of fabric.Image.filters.Pixelate
   */
  fabric.Image.filters.Pixelate.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Remove white filter class
   * @class fabric.Image.filters.RemoveColor
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.RemoveColor#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.RemoveColor({
   *   threshold: 0.2,
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */
  filters.RemoveColor = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.RemoveColor.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'RemoveColor',

    /**
     * Color to remove, in any format understood by fabric.Color.
     * @param {String} type
     * @default
     */
    color: '#FFFFFF',

    /**
     * Fragment source for the brightness program
     */
    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform vec4 uLow;\n' +
      'uniform vec4 uHigh;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'gl_FragColor = texture2D(uTexture, vTexCoord);\n' +
        'if(all(greaterThan(gl_FragColor.rgb,uLow.rgb)) && all(greaterThan(uHigh.rgb,gl_FragColor.rgb))) {\n' +
          'gl_FragColor.a = 0.0;\n' +
        '}\n' +
      '}',

    /**
     * distance to actual color, as value up or down from each r,g,b
     * between 0 and 1
     **/
    distance: 0.02,

    /**
     * For color to remove inside distance, use alpha channel for a smoother deletion
     * NOT IMPLEMENTED YET
     **/
    useAlpha: false,

    /**
     * Constructor
     * @memberOf fabric.Image.filters.RemoveWhite.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.color=#RRGGBB] Threshold value
     * @param {Number} [options.distance=10] Distance value
     */

    /**
     * Applies filter to canvas element
     * @param {Object} canvasEl Canvas element to apply filter to
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data, i,
          distance = this.distance * 255,
          r, g, b,
          source = new fabric.Color(this.color).getSource(),
          lowC = [
            source[0] - distance,
            source[1] - distance,
            source[2] - distance,
          ],
          highC = [
            source[0] + distance,
            source[1] + distance,
            source[2] + distance,
          ];


      for (i = 0; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];

        if (r > lowC[0] &&
            g > lowC[1] &&
            b > lowC[2] &&
            r < highC[0] &&
            g < highC[1] &&
            b < highC[2]) {
          data[i + 3] = 0;
        }
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uLow: gl.getUniformLocation(program, 'uLow'),
        uHigh: gl.getUniformLocation(program, 'uHigh'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var source = new fabric.Color(this.color).getSource(),
          distance = parseFloat(this.distance),
          lowC = [
            0 + source[0] / 255 - distance,
            0 + source[1] / 255 - distance,
            0 + source[2] / 255 - distance,
            1
          ],
          highC = [
            source[0] / 255 + distance,
            source[1] / 255 + distance,
            source[2] / 255 + distance,
            1
          ];
      gl.uniform4fv(uniformLocations.uLow, lowC);
      gl.uniform4fv(uniformLocations.uHigh, highC);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return extend(this.callSuper('toObject'), {
        color: this.color,
        distance: this.distance
      });
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.RemoveColor} Instance of fabric.Image.filters.RemoveWhite
   */
  fabric.Image.filters.RemoveColor.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  var matrices = {
    Brownie: [
      0.59970,0.34553,-0.27082,0,0.186,
      -0.03770,0.86095,0.15059,0,-0.1449,
      0.24113,-0.07441,0.44972,0,-0.02965,
      0,0,0,1,0
    ],
    Vintage: [
      0.62793,0.32021,-0.03965,0,0.03784,
      0.02578,0.64411,0.03259,0,0.02926,
      0.04660,-0.08512,0.52416,0,0.02023,
      0,0,0,1,0
    ],
    Kodachrome: [
      1.12855,-0.39673,-0.03992,0,0.24991,
      -0.16404,1.08352,-0.05498,0,0.09698,
      -0.16786,-0.56034,1.60148,0,0.13972,
      0,0,0,1,0
    ],
    Technicolor: [
      1.91252,-0.85453,-0.09155,0,0.04624,
      -0.30878,1.76589,-0.10601,0,-0.27589,
      -0.23110,-0.75018,1.84759,0,0.12137,
      0,0,0,1,0
    ],
    Polaroid: [
      1.438,-0.062,-0.062,0,0,
      -0.122,1.378,-0.122,0,0,
      -0.016,-0.016,1.483,0,0,
      0,0,0,1,0
    ],
    Sepia: [
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
      0, 0, 0, 1, 0
    ],
    BlackWhite: [
      1.5, 1.5, 1.5, 0, -1,
      1.5, 1.5, 1.5, 0, -1,
      1.5, 1.5, 1.5, 0, -1,
      0, 0, 0, 1, 0,
    ]
  };

  for (var key in matrices) {
    filters[key] = createClass(filters.ColorMatrix, /** @lends fabric.Image.filters.Sepia.prototype */ {

      /**
       * Filter type
       * @param {String} type
       * @default
       */
      type: key,

      /**
       * Colormatrix for the effect
       * array of 20 floats. Numbers in positions 4, 9, 14, 19 loose meaning
       * outside the -1, 1 range.
       * @param {Array} matrix array of 20 numbers.
       * @default
       */
      matrix: matrices[key],

      /**
       * Lock the matrix export for this kind of static, parameter less filters.
       */
      mainParameter: false,
      /**
       * Lock the colormatrix on the color part, skipping alpha
       */
      colorsOnly: true,

    });
    fabric.Image.filters[key].fromObject = fabric.Image.filters.BaseFilter.fromObject;
  }
})(typeof exports !== 'undefined' ? exports : this);
(function(global) {
  'use strict';

  var fabric = global.fabric,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Color Blend filter class
   * @class fabric.Image.filter.BlendColor
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @example
   * var filter = new fabric.Image.filters.BlendColor({
   *  color: '#000',
   *  mode: 'multiply'
   * });
   *
   * var filter = new fabric.Image.filters.BlendImage({
   *  image: fabricImageObject,
   *  mode: 'multiply',
   *  alpha: 0.5
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */

  filters.BlendColor = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Blend.prototype */ {
    type: 'BlendColor',

    /**
     * Color to make the blend operation with. default to a reddish color since black or white
     * gives always strong result.
     * @type String
     * @default
     **/
    color: '#F95C63',

    /**
     * Blend mode for the filter: one of multiply, add, diff, screen, subtract,
     * darken, lighten, overlay, exclusion, tint.
     * @type String
     * @default
     **/
    mode: 'multiply',

    /**
     * alpha value. represent the strength of the blend color operation.
     * @type Number
     * @default
     **/
    alpha: 1,

    /**
     * Fragment source for the Multiply program
     */
    fragmentSource: {
      multiply: 'gl_FragColor.rgb *= uColor.rgb;\n',
      screen: 'gl_FragColor.rgb = 1.0 - (1.0 - gl_FragColor.rgb) * (1.0 - uColor.rgb);\n',
      add: 'gl_FragColor.rgb += uColor.rgb;\n',
      diff: 'gl_FragColor.rgb = abs(gl_FragColor.rgb - uColor.rgb);\n',
      subtract: 'gl_FragColor.rgb -= uColor.rgb;\n',
      lighten: 'gl_FragColor.rgb = max(gl_FragColor.rgb, uColor.rgb);\n',
      darken: 'gl_FragColor.rgb = min(gl_FragColor.rgb, uColor.rgb);\n',
      exclusion: 'gl_FragColor.rgb += uColor.rgb - 2.0 * (uColor.rgb * gl_FragColor.rgb);\n',
      overlay: 'if (uColor.r < 0.5) {\n' +
          'gl_FragColor.r *= 2.0 * uColor.r;\n' +
        '} else {\n' +
          'gl_FragColor.r = 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - uColor.r);\n' +
        '}\n' +
        'if (uColor.g < 0.5) {\n' +
          'gl_FragColor.g *= 2.0 * uColor.g;\n' +
        '} else {\n' +
          'gl_FragColor.g = 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - uColor.g);\n' +
        '}\n' +
        'if (uColor.b < 0.5) {\n' +
          'gl_FragColor.b *= 2.0 * uColor.b;\n' +
        '} else {\n' +
          'gl_FragColor.b = 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - uColor.b);\n' +
        '}\n',
      tint: 'gl_FragColor.rgb *= (1.0 - uColor.a);\n' +
        'gl_FragColor.rgb += uColor.rgb;\n',
    },

    /**
     * build the fragment source for the filters, joining the common part with
     * the specific one.
     * @param {String} mode the mode of the filter, a key of this.fragmentSource
     * @return {String} the source to be compiled
     * @private
     */
    buildSource: function(mode) {
      return 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform vec4 uColor;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'gl_FragColor = color;\n' +
          'if (color.a > 0.0) {\n' +
            this.fragmentSource[mode] +
          '}\n' +
        '}';
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var cacheKey = this.type + '_' + this.mode, shaderSource;
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        shaderSource = this.buildSource(this.mode);
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    /**
     * Apply the Blend operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data, iLen = data.length,
          tr, tg, tb,
          r, g, b,
          source, alpha1 = 1 - this.alpha;

      source = new fabric.Color(this.color).getSource();
      tr = source[0] * this.alpha;
      tg = source[1] * this.alpha;
      tb = source[2] * this.alpha;

      for (var i = 0; i < iLen; i += 4) {

        r = data[i];
        g = data[i + 1];
        b = data[i + 2];

        switch (this.mode) {
          case 'multiply':
            data[i] = r * tr / 255;
            data[i + 1] = g * tg / 255;
            data[i + 2] = b * tb / 255;
            break;
          case 'screen':
            data[i] = 255 - (255 - r) * (255 - tr) / 255;
            data[i + 1] = 255 - (255 - g) * (255 - tg) / 255;
            data[i + 2] = 255 - (255 - b) * (255 - tb) / 255;
            break;
          case 'add':
            data[i] = r + tr;
            data[i + 1] = g + tg;
            data[i + 2] = b + tb;
            break;
          case 'diff':
          case 'difference':
            data[i] = Math.abs(r - tr);
            data[i + 1] = Math.abs(g - tg);
            data[i + 2] = Math.abs(b - tb);
            break;
          case 'subtract':
            data[i] = r - tr;
            data[i + 1] = g - tg;
            data[i + 2] = b - tb;
            break;
          case 'darken':
            data[i] = Math.min(r, tr);
            data[i + 1] = Math.min(g, tg);
            data[i + 2] = Math.min(b, tb);
            break;
          case 'lighten':
            data[i] = Math.max(r, tr);
            data[i + 1] = Math.max(g, tg);
            data[i + 2] = Math.max(b, tb);
            break;
          case 'overlay':
            data[i] = tr < 128 ? (2 * r * tr / 255) : (255 - 2 * (255 - r) * (255 - tr) / 255);
            data[i + 1] = tg < 128 ? (2 * g * tg / 255) : (255 - 2 * (255 - g) * (255 - tg) / 255);
            data[i + 2] = tb < 128 ? (2 * b * tb / 255) : (255 - 2 * (255 - b) * (255 - tb) / 255);
            break;
          case 'exclusion':
            data[i] = tr + r - ((2 * tr * r) / 255);
            data[i + 1] = tg + g - ((2 * tg * g) / 255);
            data[i + 2] = tb + b - ((2 * tb * b) / 255);
            break;
          case 'tint':
            data[i] = tr + r * alpha1;
            data[i + 1] = tg + g * alpha1;
            data[i + 2] = tb + b * alpha1;
        }
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uColor: gl.getUniformLocation(program, 'uColor'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var source = new fabric.Color(this.color).getSource();
      source[0] = this.alpha * source[0] / 255;
      source[1] = this.alpha * source[1] / 255;
      source[2] = this.alpha * source[2] / 255;
      source[3] = this.alpha;
      gl.uniform4fv(uniformLocations.uColor, source);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return {
        type: this.type,
        color: this.color,
        mode: this.mode,
        alpha: this.alpha
      };
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.BlendColor} Instance of fabric.Image.filters.BlendColor
   */
  fabric.Image.filters.BlendColor.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {
  'use strict';

  var fabric = global.fabric,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Image Blend filter class
   * @class fabric.Image.filter.BlendImage
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @example
   * var filter = new fabric.Image.filters.BlendColor({
   *  color: '#000',
   *  mode: 'multiply'
   * });
   *
   * var filter = new fabric.Image.filters.BlendImage({
   *  image: fabricImageObject,
   *  mode: 'multiply',
   *  alpha: 0.5
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */

  filters.BlendImage = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.BlendImage.prototype */ {
    type: 'BlendImage',

    /**
     * Color to make the blend operation with. default to a reddish color since black or white
     * gives always strong result.
     **/
    image: null,

    /**
     * Blend mode for the filter (one of "multiply", "mask")
     * @type String
     * @default
     **/
    mode: 'multiply',

    /**
     * alpha value. represent the strength of the blend image operation.
     * not implemented.
     **/
    alpha: 1,

    vertexSource: 'attribute vec2 aPosition;\n' +
      'varying vec2 vTexCoord;\n' +
      'varying vec2 vTexCoord2;\n' +
      'uniform mat3 uTransformMatrix;\n' +
      'void main() {\n' +
        'vTexCoord = aPosition;\n' +
        'vTexCoord2 = (uTransformMatrix * vec3(aPosition, 1.0)).xy;\n' +
        'gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);\n' +
      '}',

    /**
     * Fragment source for the Multiply program
     */
    fragmentSource: {
      multiply: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform sampler2D uImage;\n' +
        'uniform vec4 uColor;\n' +
        'varying vec2 vTexCoord;\n' +
        'varying vec2 vTexCoord2;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'vec4 color2 = texture2D(uImage, vTexCoord2);\n' +
          'color.rgba *= color2.rgba;\n' +
          'gl_FragColor = color;\n' +
        '}',
      mask: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform sampler2D uImage;\n' +
        'uniform vec4 uColor;\n' +
        'varying vec2 vTexCoord;\n' +
        'varying vec2 vTexCoord2;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'vec4 color2 = texture2D(uImage, vTexCoord2);\n' +
          'color.a = color2.a;\n' +
          'gl_FragColor = color;\n' +
        '}',
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var cacheKey = this.type + '_' + this.mode;
      var shaderSource = this.fragmentSource[this.mode];
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    applyToWebGL: function(options) {
      // load texture to blend.
      var gl = options.context,
          texture = this.createTexture(options.filterBackend, this.image);
      this.bindAdditionalTexture(gl, texture, gl.TEXTURE1);
      this.callSuper('applyToWebGL', options);
      this.unbindAdditionalTexture(gl, gl.TEXTURE1);
    },

    createTexture: function(backend, image) {
      return backend.getCachedTexture(image.cacheKey, image._element);
    },

    /**
     * Calculate a transformMatrix to adapt the image to blend over
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    calculateMatrix: function() {
      var image = this.image,
          width = image._element.width,
          height = image._element.height;
      return [
        1 / image.scaleX, 0, 0,
        0, 1 / image.scaleY, 0,
        -image.left / width, -image.top / height, 1
      ];
    },

    /**
     * Apply the Blend operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          resources = options.filterBackend.resources,
          data = imageData.data, iLen = data.length,
          width = imageData.width,
          height = imageData.height,
          tr, tg, tb, ta,
          r, g, b, a,
          canvas1, context, image = this.image, blendData;

      if (!resources.blendImage) {
        resources.blendImage = fabric.util.createCanvasElement();
      }
      canvas1 = resources.blendImage;
      context = canvas1.getContext('2d');
      if (canvas1.width !== width || canvas1.height !== height) {
        canvas1.width = width;
        canvas1.height = height;
      }
      else {
        context.clearRect(0, 0, width, height);
      }
      context.setTransform(image.scaleX, 0, 0, image.scaleY, image.left, image.top);
      context.drawImage(image._element, 0, 0, width, height);
      blendData = context.getImageData(0, 0, width, height).data;
      for (var i = 0; i < iLen; i += 4) {

        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3];

        tr = blendData[i];
        tg = blendData[i + 1];
        tb = blendData[i + 2];
        ta = blendData[i + 3];

        switch (this.mode) {
          case 'multiply':
            data[i] = r * tr / 255;
            data[i + 1] = g * tg / 255;
            data[i + 2] = b * tb / 255;
            data[i + 3] = a * ta / 255;
            break;
          case 'mask':
            data[i + 3] = ta;
            break;
        }
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uTransformMatrix: gl.getUniformLocation(program, 'uTransformMatrix'),
        uImage: gl.getUniformLocation(program, 'uImage'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var matrix = this.calculateMatrix();
      gl.uniform1i(uniformLocations.uImage, 1); // texture unit 1.
      gl.uniformMatrix3fv(uniformLocations.uTransformMatrix, false, matrix);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return {
        type: this.type,
        image: this.image && this.image.toObject(),
        mode: this.mode,
        alpha: this.alpha
      };
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} callback to be invoked after filter creation
   * @return {fabric.Image.filters.BlendImage} Instance of fabric.Image.filters.BlendImage
   */
  fabric.Image.filters.BlendImage.fromObject = function(object, callback) {
    fabric.Image.fromObject(object.image, function(image) {
      var options = fabric.util.object.clone(object);
      options.image = image;
      callback(new fabric.Image.filters.BlendImage(options));
    });
  };

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }), pow = Math.pow, floor = Math.floor,
      sqrt = Math.sqrt, abs = Math.abs, round = Math.round, sin = Math.sin,
      ceil = Math.ceil,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Resize image filter class
   * @class fabric.Image.filters.Resize
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Resize();
   * object.filters.push(filter);
   * object.applyFilters(canvas.renderAll.bind(canvas));
   */
  filters.Resize = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Resize.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Resize',

    /**
     * Resize type
     * for webgl resizeType is just lanczos, for canvas2d can be:
     * bilinear, hermite, sliceHack, lanczos.
     * @param {String} resizeType
     * @default
     */
    resizeType: 'hermite',

    /**
     * Scale factor for resizing, x axis
     * @param {Number} scaleX
     * @default
     */
    scaleX: 1,

    /**
     * Scale factor for resizing, y axis
     * @param {Number} scaleY
     * @default
     */
    scaleY: 1,

    /**
     * LanczosLobes parameter for lanczos filter, valid for resizeType lanczos
     * @param {Number} lanczosLobes
     * @default
     */
    lanczosLobes: 3,


    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uDelta: gl.getUniformLocation(program, 'uDelta'),
        uTaps: gl.getUniformLocation(program, 'uTaps'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform2fv(uniformLocations.uDelta, this.horizontal ? [1 / this.width, 0] : [0, 1 / this.height]);
      gl.uniform1fv(uniformLocations.uTaps, this.taps);
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var filterWindow = this.getFilterWindow(), cacheKey = this.type + '_' + filterWindow;
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        var fragmentShader = this.generateShader(filterWindow);
        options.programCache[cacheKey] = this.createProgram(options.context, fragmentShader);
      }
      return options.programCache[cacheKey];
    },

    getFilterWindow: function() {
      var scale = this.tempScale;
      return Math.ceil(this.lanczosLobes / scale);
    },

    getTaps: function() {
      var lobeFunction = this.lanczosCreate(this.lanczosLobes), scale = this.tempScale,
          filterWindow = this.getFilterWindow(), taps = new Array(filterWindow);
      for (var i = 1; i <= filterWindow; i++) {
        taps[i - 1] = lobeFunction(i * scale);
      }
      return taps;
    },

    /**
     * Generate vertex and shader sources from the necessary steps numbers
     * @param {Number} filterWindow
     */
    generateShader: function(filterWindow) {
      var offsets = new Array(filterWindow),
          fragmentShader = this.fragmentSourceTOP, filterWindow;

      for (var i = 1; i <= filterWindow; i++) {
        offsets[i - 1] = i + '.0 * uDelta';
      }

      fragmentShader += 'uniform float uTaps[' + filterWindow + '];\n';
      fragmentShader += 'void main() {\n';
      fragmentShader += '  vec4 color = texture2D(uTexture, vTexCoord);\n';
      fragmentShader += '  float sum = 1.0;\n';

      offsets.forEach(function(offset, i) {
        fragmentShader += '  color += texture2D(uTexture, vTexCoord + ' + offset + ') * uTaps[' + i + '];\n';
        fragmentShader += '  color += texture2D(uTexture, vTexCoord - ' + offset + ') * uTaps[' + i + '];\n';
        fragmentShader += '  sum += 2.0 * uTaps[' + i + '];\n';
      });
      fragmentShader += '  gl_FragColor = color / sum;\n';
      fragmentShader += '}';
      return fragmentShader;
    },

    fragmentSourceTOP: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform vec2 uDelta;\n' +
      'varying vec2 vTexCoord;\n',

    /**
     * Apply the resize filter to the image
     * Determines whether to use WebGL or Canvas2D based on the options.webgl flag.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be executed
     * @param {Boolean} options.webgl Whether to use webgl to render the filter.
     * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
     * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    applyTo: function(options) {
      if (options.webgl) {
        options.passes++;
        this.width = options.sourceWidth;
        this.horizontal = true;
        this.dW = Math.round(this.width * this.scaleX);
        this.dH = options.sourceHeight;
        this.tempScale = this.dW / this.width;
        this.taps = this.getTaps();
        options.destinationWidth = this.dW;
        this._setupFrameBuffer(options);
        this.applyToWebGL(options);
        this._swapTextures(options);
        options.sourceWidth = options.destinationWidth;

        this.height = options.sourceHeight;
        this.horizontal = false;
        this.dH = Math.round(this.height * this.scaleY);
        this.tempScale = this.dH / this.height;
        this.taps = this.getTaps();
        options.destinationHeight = this.dH;
        this._setupFrameBuffer(options);
        this.applyToWebGL(options);
        this._swapTextures(options);
        options.sourceHeight = options.destinationHeight;
      }
      else {
        this.applyTo2d(options);
      }
    },

    isNeutralState: function() {
      return this.scaleX === 1 && this.scaleY === 1;
    },

    lanczosCreate: function(lobes) {
      return function(x) {
        if (x >= lobes || x <= -lobes) {
          return 0.0;
        }
        if (x < 1.19209290E-07 && x > -1.19209290E-07) {
          return 1.0;
        }
        x *= Math.PI;
        var xx = x / lobes;
        return (sin(x) / x) * sin(xx) / xx;
      };
    },

    /**
     * Applies filter to canvas element
     * @memberOf fabric.Image.filters.Resize.prototype
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} scaleX
     * @param {Number} scaleY
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          scaleX = this.scaleX,
          scaleY = this.scaleY;

      this.rcpScaleX = 1 / scaleX;
      this.rcpScaleY = 1 / scaleY;

      var oW = imageData.width, oH = imageData.height,
          dW = round(oW * scaleX), dH = round(oH * scaleY),
          newData;

      if (this.resizeType === 'sliceHack') {
        newData = this.sliceByTwo(options, oW, oH, dW, dH);
      }
      else if (this.resizeType === 'hermite') {
        newData = this.hermiteFastResize(options, oW, oH, dW, dH);
      }
      else if (this.resizeType === 'bilinear') {
        newData = this.bilinearFiltering(options, oW, oH, dW, dH);
      }
      else if (this.resizeType === 'lanczos') {
        newData = this.lanczosResize(options, oW, oH, dW, dH);
      }
      options.imageData = newData;
    },

    /**
     * Filter sliceByTwo
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    sliceByTwo: function(options, oW, oH, dW, dH) {
      var imageData = options.imageData,
          mult = 0.5, doneW = false, doneH = false, stepW = oW * mult,
          stepH = oH * mult, resources = fabric.filterBackend.resources,
          tmpCanvas, ctx, sX = 0, sY = 0, dX = oW, dY = 0;
      if (!resources.sliceByTwo) {
        resources.sliceByTwo = document.createElement('canvas');
      }
      tmpCanvas = resources.sliceByTwo;
      if (tmpCanvas.width < oW * 1.5 || tmpCanvas.height < oH) {
        tmpCanvas.width = oW * 1.5;
        tmpCanvas.height = oH;
      }
      ctx = tmpCanvas.getContext('2d');
      ctx.clearRect(0, 0, oW * 1.5, oH);
      ctx.putImageData(imageData, 0, 0);

      dW = floor(dW);
      dH = floor(dH);

      while (!doneW || !doneH) {
        oW = stepW;
        oH = stepH;
        if (dW < floor(stepW * mult)) {
          stepW = floor(stepW * mult);
        }
        else {
          stepW = dW;
          doneW = true;
        }
        if (dH < floor(stepH * mult)) {
          stepH = floor(stepH * mult);
        }
        else {
          stepH = dH;
          doneH = true;
        }
        ctx.drawImage(tmpCanvas, sX, sY, oW, oH, dX, dY, stepW, stepH);
        sX = dX;
        sY = dY;
        dY += stepH;
      }
      return ctx.getImageData(sX, sY, dW, dH);
    },

    /**
     * Filter lanczosResize
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    lanczosResize: function(options, oW, oH, dW, dH) {

      function process(u) {
        var v, i, weight, idx, a, red, green,
            blue, alpha, fX, fY;
        center.x = (u + 0.5) * ratioX;
        icenter.x = floor(center.x);
        for (v = 0; v < dH; v++) {
          center.y = (v + 0.5) * ratioY;
          icenter.y = floor(center.y);
          a = 0; red = 0; green = 0; blue = 0; alpha = 0;
          for (i = icenter.x - range2X; i <= icenter.x + range2X; i++) {
            if (i < 0 || i >= oW) {
              continue;
            }
            fX = floor(1000 * abs(i - center.x));
            if (!cacheLanc[fX]) {
              cacheLanc[fX] = { };
            }
            for (var j = icenter.y - range2Y; j <= icenter.y + range2Y; j++) {
              if (j < 0 || j >= oH) {
                continue;
              }
              fY = floor(1000 * abs(j - center.y));
              if (!cacheLanc[fX][fY]) {
                cacheLanc[fX][fY] = lanczos(sqrt(pow(fX * rcpRatioX, 2) + pow(fY * rcpRatioY, 2)) / 1000);
              }
              weight = cacheLanc[fX][fY];
              if (weight > 0) {
                idx = (j * oW + i) * 4;
                a += weight;
                red += weight * srcData[idx];
                green += weight * srcData[idx + 1];
                blue += weight * srcData[idx + 2];
                alpha += weight * srcData[idx + 3];
              }
            }
          }
          idx = (v * dW + u) * 4;
          destData[idx] = red / a;
          destData[idx + 1] = green / a;
          destData[idx + 2] = blue / a;
          destData[idx + 3] = alpha / a;
        }

        if (++u < dW) {
          return process(u);
        }
        else {
          return destImg;
        }
      }

      var srcData = options.imageData.data,
          destImg = options.ctx.createImageData(dW, dH),
          destData = destImg.data,
          lanczos = this.lanczosCreate(this.lanczosLobes),
          ratioX = this.rcpScaleX, ratioY = this.rcpScaleY,
          rcpRatioX = 2 / this.rcpScaleX, rcpRatioY = 2 / this.rcpScaleY,
          range2X = ceil(ratioX * this.lanczosLobes / 2),
          range2Y = ceil(ratioY * this.lanczosLobes / 2),
          cacheLanc = { }, center = { }, icenter = { };

      return process(0);
    },

    /**
     * bilinearFiltering
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    bilinearFiltering: function(options, oW, oH, dW, dH) {
      var a, b, c, d, x, y, i, j, xDiff, yDiff, chnl,
          color, offset = 0, origPix, ratioX = this.rcpScaleX,
          ratioY = this.rcpScaleY,
          w4 = 4 * (oW - 1), img = options.imageData,
          pixels = img.data, destImage = options.ctx.createImageData(dW, dH),
          destPixels = destImage.data;
      for (i = 0; i < dH; i++) {
        for (j = 0; j < dW; j++) {
          x = floor(ratioX * j);
          y = floor(ratioY * i);
          xDiff = ratioX * j - x;
          yDiff = ratioY * i - y;
          origPix = 4 * (y * oW + x);

          for (chnl = 0; chnl < 4; chnl++) {
            a = pixels[origPix + chnl];
            b = pixels[origPix + 4 + chnl];
            c = pixels[origPix + w4 + chnl];
            d = pixels[origPix + w4 + 4 + chnl];
            color = a * (1 - xDiff) * (1 - yDiff) + b * xDiff * (1 - yDiff) +
                    c * yDiff * (1 - xDiff) + d * xDiff * yDiff;
            destPixels[offset++] = color;
          }
        }
      }
      return destImage;
    },

    /**
     * hermiteFastResize
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    hermiteFastResize: function(options, oW, oH, dW, dH) {
      var ratioW = this.rcpScaleX, ratioH = this.rcpScaleY,
          ratioWHalf = ceil(ratioW / 2),
          ratioHHalf = ceil(ratioH / 2),
          img = options.imageData, data = img.data,
          img2 = options.ctx.createImageData(dW, dH), data2 = img2.data;
      for (var j = 0; j < dH; j++) {
        for (var i = 0; i < dW; i++) {
          var x2 = (i + j * dW) * 4, weight = 0, weights = 0, weightsAlpha = 0,
              gxR = 0, gxG = 0, gxB = 0, gxA = 0, centerY = (j + 0.5) * ratioH;
          for (var yy = floor(j * ratioH); yy < (j + 1) * ratioH; yy++) {
            var dy = abs(centerY - (yy + 0.5)) / ratioHHalf,
                centerX = (i + 0.5) * ratioW, w0 = dy * dy;
            for (var xx = floor(i * ratioW); xx < (i + 1) * ratioW; xx++) {
              var dx = abs(centerX - (xx + 0.5)) / ratioWHalf,
                  w = sqrt(w0 + dx * dx);
              /* eslint-disable max-depth */
              if (w > 1 && w < -1) {
                continue;
              }
              //hermite filter
              weight = 2 * w * w * w - 3 * w * w + 1;
              if (weight > 0) {
                dx = 4 * (xx + yy * oW);
                //alpha
                gxA += weight * data[dx + 3];
                weightsAlpha += weight;
                //colors
                if (data[dx + 3] < 255) {
                  weight = weight * data[dx + 3] / 250;
                }
                gxR += weight * data[dx];
                gxG += weight * data[dx + 1];
                gxB += weight * data[dx + 2];
                weights += weight;
              }
              /* eslint-enable max-depth */
            }
          }
          data2[x2] = gxR / weights;
          data2[x2 + 1] = gxG / weights;
          data2[x2 + 2] = gxB / weights;
          data2[x2 + 3] = gxA / weightsAlpha;
        }
      }
      return img2;
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return {
        type: this.type,
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        resizeType: this.resizeType,
        lanczosLobes: this.lanczosLobes
      };
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Resize} Instance of fabric.Image.filters.Resize
   */
  fabric.Image.filters.Resize.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Contrast filter class
   * @class fabric.Image.filters.Contrast
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Contrast#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Contrast({
   *   contrast: 0.25
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Contrast = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Contrast.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Contrast',

    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform float uContrast;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'float contrastF = 1.015 * (uContrast + 1.0) / (1.0 * (1.015 - uContrast));\n' +
        'color.rgb = contrastF * (color.rgb - 0.5) + 0.5;\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * contrast value, range from -1 to 1.
     * @param {Number} contrast
     * @default 0
     */
    contrast: 0,

    mainParameter: 'contrast',

    /**
     * Constructor
     * @memberOf fabric.Image.filters.Contrast.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.contrast=0] Value to contrast the image up (-1...1)
     */

    /**
      * Apply the Contrast operation to a Uint8Array representing the pixels of an image.
      *
      * @param {Object} options
      * @param {ImageData} options.imageData The Uint8Array to be filtered.
      */
    applyTo2d: function(options) {
      if (this.contrast === 0) {
        return;
      }
      var imageData = options.imageData, i, len,
          data = imageData.data, len = data.length,
          contrast = Math.floor(this.contrast * 255),
          contrastF = 259 * (contrast + 255) / (255 * (259 - contrast));

      for (i = 0; i < len; i += 4) {
        data[i] = contrastF * (data[i] - 128) + 128;
        data[i + 1] = contrastF * (data[i + 1] - 128) + 128;
        data[i + 2] = contrastF * (data[i + 2] - 128) + 128;
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uContrast: gl.getUniformLocation(program, 'uContrast'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uContrast, this.contrast);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Contrast} Instance of fabric.Image.filters.Contrast
   */
  fabric.Image.filters.Contrast.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Saturate filter class
   * @class fabric.Image.filters.Saturation
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Saturation#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Saturation({
   *   saturation: 1
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Saturation = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Saturation.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Saturation',

    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform float uSaturation;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'float rgMax = max(color.r, color.g);\n' +
        'float rgbMax = max(rgMax, color.b);\n' +
        'color.r += rgbMax != color.r ? (rgbMax - color.r) * uSaturation : 0.00;\n' +
        'color.g += rgbMax != color.g ? (rgbMax - color.g) * uSaturation : 0.00;\n' +
        'color.b += rgbMax != color.b ? (rgbMax - color.b) * uSaturation : 0.00;\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * Saturation value, from -1 to 1.
     * Increases/decreases the color saturation.
     * A value of 0 has no effect.
     * 
     * @param {Number} saturation
     * @default
     */
    saturation: 0,

    mainParameter: 'saturation',

    /**
     * Constructor
     * @memberOf fabric.Image.filters.Saturate.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.saturate=0] Value to saturate the image (-1...1)
     */

    /**
     * Apply the Saturation operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      if (this.saturation === 0) {
        return;
      }
      var imageData = options.imageData,
          data = imageData.data, len = data.length,
          adjust = -this.saturation, i, max;

      for (i = 0; i < len; i += 4) {
        max = Math.max(data[i], data[i + 1], data[i + 2]);
        data[i] += max !== data[i] ? (max - data[i]) * adjust : 0;
        data[i + 1] += max !== data[i + 1] ? (max - data[i + 1]) * adjust : 0;
        data[i + 2] += max !== data[i + 2] ? (max - data[i + 2]) * adjust : 0;
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uSaturation: gl.getUniformLocation(program, 'uSaturation'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uSaturation, -this.saturation);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Saturation} Instance of fabric.Image.filters.Saturate
   */
  fabric.Image.filters.Saturation.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Blur filter class
   * @class fabric.Image.filters.Blur
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Blur#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Blur({
   *   blur: 0.5
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */
  filters.Blur = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Blur.prototype */ {

    type: 'Blur',

    /*
'gl_FragColor = vec4(0.0);',
'gl_FragColor += texture2D(texture, vTexCoord + -7 * uDelta)*0.0044299121055113265;',
'gl_FragColor += texture2D(texture, vTexCoord + -6 * uDelta)*0.00895781211794;',
'gl_FragColor += texture2D(texture, vTexCoord + -5 * uDelta)*0.0215963866053;',
'gl_FragColor += texture2D(texture, vTexCoord + -4 * uDelta)*0.0443683338718;',
'gl_FragColor += texture2D(texture, vTexCoord + -3 * uDelta)*0.0776744219933;',
'gl_FragColor += texture2D(texture, vTexCoord + -2 * uDelta)*0.115876621105;',
'gl_FragColor += texture2D(texture, vTexCoord + -1 * uDelta)*0.147308056121;',
'gl_FragColor += texture2D(texture, vTexCoord              )*0.159576912161;',
'gl_FragColor += texture2D(texture, vTexCoord + 1 * uDelta)*0.147308056121;',
'gl_FragColor += texture2D(texture, vTexCoord + 2 * uDelta)*0.115876621105;',
'gl_FragColor += texture2D(texture, vTexCoord + 3 * uDelta)*0.0776744219933;',
'gl_FragColor += texture2D(texture, vTexCoord + 4 * uDelta)*0.0443683338718;',
'gl_FragColor += texture2D(texture, vTexCoord + 5 * uDelta)*0.0215963866053;',
'gl_FragColor += texture2D(texture, vTexCoord + 6 * uDelta)*0.00895781211794;',
'gl_FragColor += texture2D(texture, vTexCoord + 7 * uDelta)*0.0044299121055113265;',
*/

    /* eslint-disable max-len */
    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform vec2 uDelta;\n' +
      'varying vec2 vTexCoord;\n' +
      'const float nSamples = 15.0;\n' +
      'vec3 v3offset = vec3(12.9898, 78.233, 151.7182);\n' +
      'float random(vec3 scale) {\n' +
        /* use the fragment position for a different seed per-pixel */
        'return fract(sin(dot(gl_FragCoord.xyz, scale)) * 43758.5453);\n' +
      '}\n' +
      'void main() {\n' +
        'vec4 color = vec4(0.0);\n' +
        'float total = 0.0;\n' +
        'float offset = random(v3offset);\n' +
        'for (float t = -nSamples; t <= nSamples; t++) {\n' +
          'float percent = (t + offset - 0.5) / nSamples;\n' +
          'float weight = 1.0 - abs(percent);\n' +
          'color += texture2D(uTexture, vTexCoord + uDelta * percent) * weight;\n' +
          'total += weight;\n' +
        '}\n' +
        'gl_FragColor = color / total;\n' +
      '}',
    /* eslint-enable max-len */

    /**
     * blur value, in percentage of image dimensions.
     * specific to keep the image blur constant at different resolutions
     * range between 0 and 1.
     * @type Number
     * @default
     */
    blur: 0,

    mainParameter: 'blur',

    applyTo: function(options) {
      if (options.webgl) {
        // this aspectRatio is used to give the same blur to vertical and horizontal
        this.aspectRatio = options.sourceWidth / options.sourceHeight;
        options.passes++;
        this._setupFrameBuffer(options);
        this.horizontal = true;
        this.applyToWebGL(options);
        this._swapTextures(options);
        this._setupFrameBuffer(options);
        this.horizontal = false;
        this.applyToWebGL(options);
        this._swapTextures(options);
      }
      else {
        this.applyTo2d(options);
      }
    },

    applyTo2d: function(options) {
      // paint canvasEl with current image data.
      //options.ctx.putImageData(options.imageData, 0, 0);
      options.imageData = this.simpleBlur(options);
    },

    simpleBlur: function(options) {
      var resources = options.filterBackend.resources, canvas1, canvas2,
          width = options.imageData.width,
          height = options.imageData.height;

      if (!resources.blurLayer1) {
        resources.blurLayer1 = fabric.util.createCanvasElement();
        resources.blurLayer2 = fabric.util.createCanvasElement();
      }
      canvas1 = resources.blurLayer1;
      canvas2 = resources.blurLayer2;
      if (canvas1.width !== width || canvas1.height !== height) {
        canvas2.width = canvas1.width = width;
        canvas2.height = canvas1.height = height;
      }
      var ctx1 = canvas1.getContext('2d'),
          ctx2 = canvas2.getContext('2d'),
          nSamples = 15,
          random, percent, j, i,
          blur = this.blur * 0.06 * 0.5;

      // load first canvas
      ctx1.putImageData(options.imageData, 0, 0);
      ctx2.clearRect(0, 0, width, height);

      for (i = -nSamples; i <= nSamples; i++) {
        random = (Math.random() - 0.5) / 4;
        percent = i / nSamples;
        j = blur * percent * width + random;
        ctx2.globalAlpha = 1 - Math.abs(percent);
        ctx2.drawImage(canvas1, j, random);
        ctx1.drawImage(canvas2, 0, 0);
        ctx2.globalAlpha = 1;
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      }
      for (i = -nSamples; i <= nSamples; i++) {
        random = (Math.random() - 0.5) / 4;
        percent = i / nSamples;
        j = blur * percent * height + random;
        ctx2.globalAlpha = 1 - Math.abs(percent);
        ctx2.drawImage(canvas1, random, j);
        ctx1.drawImage(canvas2, 0, 0);
        ctx2.globalAlpha = 1;
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      }
      options.ctx.drawImage(canvas1, 0, 0);
      var newImageData = options.ctx.getImageData(0, 0, canvas1.width, canvas1.height);
      ctx1.globalAlpha = 1;
      ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
      return newImageData;
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        delta: gl.getUniformLocation(program, 'uDelta'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var delta = this.chooseRightDelta();
      gl.uniform2fv(uniformLocations.delta, delta);
    },

    /**
     * choose right value of image percentage to blur with
     * @returns {Array} a numeric array with delta values
     */
    chooseRightDelta: function() {
      var blurScale = 1, delta = [0, 0], blur;
      if (this.horizontal) {
        if (this.aspectRatio > 1) {
          // image is wide, i want to shrink radius horizontal
          blurScale = 1 / this.aspectRatio;
        }
      }
      else {
        if (this.aspectRatio < 1) {
          // image is tall, i want to shrink radius vertical
          blurScale = this.aspectRatio;
        }
      }
      blur = blurScale * this.blur * 0.12;
      if (this.horizontal) {
        delta[0] = blur;
      }
      else {
        delta[1] = blur;
      }
      return delta;
    },
  });

  /**
   * Deserialize a JSON definition of a BlurFilter into a concrete instance.
   */
  filters.Blur.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Gamma filter class
   * @class fabric.Image.filters.Gamma
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Gamma#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Gamma({
   *   gamma: [1, 0.5, 2.1]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Gamma = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Gamma.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Gamma',

    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform vec3 uGamma;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'vec3 correction = (1.0 / uGamma);\n' +
        'color.r = pow(color.r, correction.r);\n' +
        'color.g = pow(color.g, correction.g);\n' +
        'color.b = pow(color.b, correction.b);\n' +
        'gl_FragColor = color;\n' +
        'gl_FragColor.rgb *= color.a;\n' +
      '}',

    /**
     * Gamma array value, from 0.01 to 2.2.
     * @param {Array} gamma
     * @default
     */
    gamma: [1, 1, 1],

    /**
     * Describe the property that is the filter parameter
     * @param {String} m
     * @default
     */
    mainParameter: 'gamma',

    /**
     * Constructor
     * @param {Object} [options] Options object
     */
    initialize: function(options) {
      this.gamma = [1, 1, 1];
      filters.BaseFilter.prototype.initialize.call(this, options);
    },

    /**
     * Apply the Gamma operation to a Uint8Array representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8Array to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData, data = imageData.data,
          gamma = this.gamma, len = data.length,
          rInv = 1 / gamma[0], gInv = 1 / gamma[1],
          bInv = 1 / gamma[2], i;

      if (!this.rVals) {
        // eslint-disable-next-line
        this.rVals = new Uint8Array(256);
        // eslint-disable-next-line
        this.gVals = new Uint8Array(256);
        // eslint-disable-next-line
        this.bVals = new Uint8Array(256);
      }

      // This is an optimization - pre-compute a look-up table for each color channel
      // instead of performing these pow calls for each pixel in the image.
      for (i = 0, len = 256; i < len; i++) {
        this.rVals[i] = Math.pow(i / 255, rInv) * 255;
        this.gVals[i] = Math.pow(i / 255, gInv) * 255;
        this.bVals[i] = Math.pow(i / 255, bInv) * 255;
      }
      for (i = 0, len = data.length; i < len; i += 4) {
        data[i] = this.rVals[data[i]];
        data[i + 1] = this.gVals[data[i + 1]];
        data[i + 2] = this.bVals[data[i + 2]];
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uGamma: gl.getUniformLocation(program, 'uGamma'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform3fv(uniformLocations.uGamma, this.gamma);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Gamma} Instance of fabric.Image.filters.Gamma
   */
  fabric.Image.filters.Gamma.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * A container class that knows how to apply a sequence of filters to an input image.
   */
  filters.Composed = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Composed.prototype */ {

    type: 'Composed',

    /**
     * A non sparse array of filters to apply
     */
    subFilters: [],

    /**
     * Constructor
     * @param {Object} [options] Options object
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
      // create a new array instead mutating the prototype with push
      this.subFilters = this.subFilters.slice(0);
    },

    /**
     * Apply this container's filters to the input image provided.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be applied.
     */
    applyTo: function(options) {
      options.passes += this.subFilters.length - 1;
      this.subFilters.forEach(function(filter) {
        filter.applyTo(options);
      });
    },

    /**
     * Serialize this filter into JSON.
     *
     * @returns {Object} A JSON representation of this filter.
     */
    toObject: function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        subFilters: this.subFilters.map(function(filter) { return filter.toObject(); }),
      });
    },

    isNeutralState: function() {
      return !this.subFilters.some(function(filter) { return !filter.isNeutralState(); });
    }
  });

  /**
   * Deserialize a JSON definition of a ComposedFilter into a concrete instance.
   */
  fabric.Image.filters.Composed.fromObject = function(object, callback) {
    var filters = object.subFilters || [],
        subFilters = filters.map(function(filter) {
          return new fabric.Image.filters[filter.type](filter);
        }),
        instance = new fabric.Image.filters.Composed({ subFilters: subFilters });
    callback && callback(instance);
    return instance;
  };
})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * HueRotation filter class
   * @class fabric.Image.filters.HueRotation
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.HueRotation#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.HueRotation({
   *   rotation: -0.5
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.HueRotation = createClass(filters.ColorMatrix, /** @lends fabric.Image.filters.HueRotation.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'HueRotation',

    /**
     * HueRotation value, from -1 to 1.
     * the unit is radians
     * @param {Number} myParameter
     * @default
     */
    rotation: 0,

    /**
     * Describe the property that is the filter parameter
     * @param {String} m
     * @default
     */
    mainParameter: 'rotation',

    calculateMatrix: function() {
      var rad = this.rotation * Math.PI, cos = fabric.util.cos(rad), sin = fabric.util.sin(rad),
          aThird = 1 / 3, aThirdSqtSin = Math.sqrt(aThird) * sin, OneMinusCos = 1 - cos;
      this.matrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
      ];
      this.matrix[0] = cos + OneMinusCos / 3;
      this.matrix[1] = aThird * OneMinusCos - aThirdSqtSin;
      this.matrix[2] = aThird * OneMinusCos + aThirdSqtSin;
      this.matrix[5] = aThird * OneMinusCos + aThirdSqtSin;
      this.matrix[6] = cos + aThird * OneMinusCos;
      this.matrix[7] = aThird * OneMinusCos - aThirdSqtSin;
      this.matrix[10] = aThird * OneMinusCos - aThirdSqtSin;
      this.matrix[11] = aThird * OneMinusCos + aThirdSqtSin;
      this.matrix[12] = cos + aThird * OneMinusCos;
    },

    /**
     * HueRotation isNeutralState implementation
     * Used only in image applyFilters to discard filters that will not have an effect
     * on the image
     * @param {Object} options
     **/
    isNeutralState: function(options) {
      this.calculateMatrix();
      return filters.BaseFilter.prototype.isNeutralState.call(this, options);
    },

    /**
     * Apply this filter to the input image data provided.
     *
     * Determines whether to use WebGL or Canvas2D based on the options.webgl flag.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be executed
     * @param {Boolean} options.webgl Whether to use webgl to render the filter.
     * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
     * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    applyTo: function(options) {
      this.calculateMatrix();
      filters.BaseFilter.prototype.applyTo.call(this, options);
    },

  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.HueRotation} Instance of fabric.Image.filters.HueRotation
   */
  fabric.Image.filters.HueRotation.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      clone = fabric.util.object.clone;

  if (fabric.Text) {
    fabric.warn('fabric.Text is already defined');
    return;
  }

  var additionalProps =
    ('fontFamily fontWeight fontSize text underline overline linethrough' +
    ' textAlign fontStyle lineHeight textBackgroundColor charSpacing styles' +
    ' direction path pathStartOffset pathSide pathAlign').split(' ');

  /**
   * Text class
   * @class fabric.Text
   * @extends fabric.Object
   * @return {fabric.Text} thisArg
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#text}
   * @see {@link fabric.Text#initialize} for constructor definition
   */
  fabric.Text = fabric.util.createClass(fabric.Object, /** @lends fabric.Text.prototype */ {

    /**
     * Properties which when set cause object to change dimensions
     * @type Array
     * @private
     */
    _dimensionAffectingProps: [
      'fontSize',
      'fontWeight',
      'fontFamily',
      'fontStyle',
      'lineHeight',
      'text',
      'charSpacing',
      'textAlign',
      'styles',
      'path',
      'pathStartOffset',
      'pathSide',
      'pathAlign'
    ],

    /**
     * @private
     */
    _reNewline: /\r?\n/,

    /**
     * Use this regular expression to filter for whitespaces that is not a new line.
     * Mostly used when text is 'justify' aligned.
     * @private
     */
    _reSpacesAndTabs: /[ \t\r]/g,

    /**
     * Use this regular expression to filter for whitespace that is not a new line.
     * Mostly used when text is 'justify' aligned.
     * @private
     */
    _reSpaceAndTab: /[ \t\r]/,

    /**
     * Use this regular expression to filter consecutive groups of non spaces.
     * Mostly used when text is 'justify' aligned.
     * @private
     */
    _reWords: /\S+/g,

    /**
     * Type of an object
     * @type String
     * @default
     */
    type:                 'text',

    /**
     * Font size (in pixels)
     * @type Number
     * @default
     */
    fontSize:             40,

    /**
     * Font weight (e.g. bold, normal, 400, 600, 800)
     * @type {(Number|String)}
     * @default
     */
    fontWeight:           'normal',

    /**
     * Font family
     * @type String
     * @default
     */
    fontFamily:           'Times New Roman',

    /**
     * Text decoration underline.
     * @type Boolean
     * @default
     */
    underline:       false,

    /**
     * Text decoration overline.
     * @type Boolean
     * @default
     */
    overline:       false,

    /**
     * Text decoration linethrough.
     * @type Boolean
     * @default
     */
    linethrough:       false,

    /**
     * Text alignment. Possible values: "left", "center", "right", "justify",
     * "justify-left", "justify-center" or "justify-right".
     * @type String
     * @default
     */
    textAlign:            'left',

    /**
     * Font style . Possible values: "", "normal", "italic" or "oblique".
     * @type String
     * @default
     */
    fontStyle:            'normal',

    /**
     * Line height
     * @type Number
     * @default
     */
    lineHeight:           1.16,

    /**
     * Superscript schema object (minimum overlap)
     * @type {Object}
     * @default
     */
    superscript: {
      size:      0.60, // fontSize factor
      baseline: -0.35  // baseline-shift factor (upwards)
    },

    /**
     * Subscript schema object (minimum overlap)
     * @type {Object}
     * @default
     */
    subscript: {
      size:      0.60, // fontSize factor
      baseline:  0.11  // baseline-shift factor (downwards)
    },

    /**
     * Background color of text lines
     * @type String
     * @default
     */
    textBackgroundColor:  '',

    /**
     * List of properties to consider when checking if
     * state of an object is changed ({@link fabric.Object#hasStateChanged})
     * as well as for history (undo/redo) purposes
     * @type Array
     */
    stateProperties: fabric.Object.prototype.stateProperties.concat(additionalProps),

    /**
     * List of properties to consider when checking if cache needs refresh
     * @type Array
     */
    cacheProperties: fabric.Object.prototype.cacheProperties.concat(additionalProps),

    /**
     * When defined, an object is rendered via stroke and this property specifies its color.
     * <b>Backwards incompatibility note:</b> This property was named "strokeStyle" until v1.1.6
     * @type String
     * @default
     */
    stroke:               null,

    /**
     * Shadow object representing shadow of this shape.
     * <b>Backwards incompatibility note:</b> This property was named "textShadow" (String) until v1.2.11
     * @type fabric.Shadow
     * @default
     */
    shadow:               null,

    /**
     * fabric.Path that the text should follow.
     * since 4.6.0 the path will be drawn automatically.
     * if you want to make the path visible, give it a stroke and strokeWidth or fill value
     * if you want it to be hidden, assign visible = false to the path.
     * This feature is in BETA, and SVG import/export is not yet supported.
     * @type fabric.Path
     * @example
     * var textPath = new fabric.Text('Text on a path', {
     *     top: 150,
     *     left: 150,
     *     textAlign: 'center',
     *     charSpacing: -50,
     *     path: new fabric.Path('M 0 0 C 50 -100 150 -100 200 0', {
     *         strokeWidth: 1,
     *         visible: false
     *     }),
     *     pathSide: 'left',
     *     pathStartOffset: 0
     * });
     * @default
     */
    path:               null,

    /**
     * Offset amount for text path starting position
     * Only used when text has a path
     * @type Number
     * @default
     */
    pathStartOffset:               0,

    /**
     * Which side of the path the text should be drawn on.
     * Only used when text has a path
     * @type {String} 'left|right'
     * @default
     */
    pathSide:               'left',

    /**
     * How text is aligned to the path. This property determines
     * the perpendicular position of each character relative to the path.
     * (one of "baseline", "center", "ascender", "descender")
     * This feature is in BETA, and its behavior may change
     * @type String
     * @default
     */
    pathAlign:               'baseline',

    /**
     * @private
     */
    _fontSizeFraction: 0.222,

    /**
     * @private
     */
    offsets: {
      underline: 0.10,
      linethrough: -0.315,
      overline: -0.88
    },

    /**
     * Text Line proportion to font Size (in pixels)
     * @type Number
     * @default
     */
    _fontSizeMult:             1.13,

    /**
     * additional space between characters
     * expressed in thousands of em unit
     * @type Number
     * @default
     */
    charSpacing:             0,

    /**
     * Object containing character styles - top-level properties -> line numbers,
     * 2nd-level properties - character numbers
     * @type Object
     * @default
     */
    styles: null,

    /**
     * Reference to a context to measure text char or couple of chars
     * the cacheContext of the canvas will be used or a freshly created one if the object is not on canvas
     * once created it will be referenced on fabric._measuringContext to avoid creating a canvas for every
     * text object created.
     * @type {CanvasRenderingContext2D}
     * @default
     */
    _measuringContext: null,

    /**
     * Baseline shift, styles only, keep at 0 for the main text object
     * @type {Number}
     * @default
     */
    deltaY: 0,

    /**
     * WARNING: EXPERIMENTAL. NOT SUPPORTED YET
     * determine the direction of the text.
     * This has to be set manually together with textAlign and originX for proper
     * experience.
     * some interesting link for the future
     * https://www.w3.org/International/questions/qa-bidi-unicode-controls
     * @since 4.5.0
     * @type {String} 'ltr|rtl'
     * @default
     */
    direction: 'ltr',

    /**
     * Array of properties that define a style unit (of 'styles').
     * @type {Array}
     * @default
     */
    _styleProperties: [
      'stroke',
      'strokeWidth',
      'fill',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'fontStyle',
      'underline',
      'overline',
      'linethrough',
      'deltaY',
      'textBackgroundColor',
    ],

    /**
     * contains characters bounding boxes
     */
    __charBounds: [],

    /**
     * use this size when measuring text. To avoid IE11 rounding errors
     * @type {Number}
     * @default
     * @readonly
     * @private
     */
    CACHE_FONT_SIZE: 400,

    /**
     * contains the min text width to avoid getting 0
     * @type {Number}
     * @default
     */
    MIN_TEXT_WIDTH: 2,

    /**
     * Constructor
     * @param {String} text Text string
     * @param {Object} [options] Options object
     * @return {fabric.Text} thisArg
     */
    initialize: function(text, options) {
      this.styles = options ? (options.styles || { }) : { };
      this.text = text;
      this.__skipDimension = true;
      this.callSuper('initialize', options);
      if (this.path) {
        this.setPathInfo();
      }
      this.__skipDimension = false;
      this.initDimensions();
      this.setCoords();
      this.setupState({ propertySet: '_dimensionAffectingProps' });
    },

    /**
     * If text has a path, it will add the extra information needed
     * for path and text calculations
     * @return {fabric.Text} thisArg
     */
    setPathInfo: function() {
      var path = this.path;
      if (path) {
        path.segmentsInfo = fabric.util.getPathSegmentsInfo(path.path);
      }
    },

    /**
     * Return a context for measurement of text string.
     * if created it gets stored for reuse
     * this is for internal use, please do not use it
     * @private
     * @param {String} text Text string
     * @param {Object} [options] Options object
     * @return {fabric.Text} thisArg
     */
    getMeasuringContext: function() {
      // if we did not return we have to measure something.
      if (!fabric._measuringContext) {
        fabric._measuringContext = this.canvas && this.canvas.contextCache ||
          fabric.util.createCanvasElement().getContext('2d');
      }
      return fabric._measuringContext;
    },

    /**
     * @private
     * Divides text into lines of text and lines of graphemes.
     */
    _splitText: function() {
      var newLines = this._splitTextIntoLines(this.text);
      this.textLines = newLines.lines;
      this._textLines = newLines.graphemeLines;
      this._unwrappedTextLines = newLines._unwrappedLines;
      this._text = newLines.graphemeText;
      return newLines;
    },

    /**
     * Initialize or update text dimensions.
     * Updates this.width and this.height with the proper values.
     * Does not return dimensions.
     */
    initDimensions: function() {
      if (this.__skipDimension) {
        return;
      }
      this._splitText();
      this._clearCache();
      if (this.path) {
        this.width = this.path.width;
        this.height = this.path.height;
      }
      else {
        this.width = this.calcTextWidth() || this.cursorWidth || this.MIN_TEXT_WIDTH;
        this.height = this.calcTextHeight();
      }
      if (this.textAlign.indexOf('justify') !== -1) {
        // once text is measured we need to make space fatter to make justified text.
        this.enlargeSpaces();
      }
      this.saveState({ propertySet: '_dimensionAffectingProps' });
    },

    /**
     * Enlarge space boxes and shift the others
     */
    enlargeSpaces: function() {
      var diffSpace, currentLineWidth, numberOfSpaces, accumulatedSpace, line, charBound, spaces;
      for (var i = 0, len = this._textLines.length; i < len; i++) {
        if (this.textAlign !== 'justify' && (i === len - 1 || this.isEndOfWrapping(i))) {
          continue;
        }
        accumulatedSpace = 0;
        line = this._textLines[i];
        currentLineWidth = this.getLineWidth(i);
        if (currentLineWidth < this.width && (spaces = this.textLines[i].match(this._reSpacesAndTabs))) {
          numberOfSpaces = spaces.length;
          diffSpace = (this.width - currentLineWidth) / numberOfSpaces;
          for (var j = 0, jlen = line.length; j <= jlen; j++) {
            charBound = this.__charBounds[i][j];
            if (this._reSpaceAndTab.test(line[j])) {
              charBound.width += diffSpace;
              charBound.kernedWidth += diffSpace;
              charBound.left += accumulatedSpace;
              accumulatedSpace += diffSpace;
            }
            else {
              charBound.left += accumulatedSpace;
            }
          }
        }
      }
    },

    /**
     * Detect if the text line is ended with an hard break
     * text and itext do not have wrapping, return false
     * @return {Boolean}
     */
    isEndOfWrapping: function(lineIndex) {
      return lineIndex === this._textLines.length - 1;
    },

    /**
     * Detect if a line has a linebreak and so we need to account for it when moving
     * and counting style.
     * It return always for text and Itext.
     * @return Number
     */
    missingNewlineOffset: function() {
      return 1;
    },

    /**
     * Returns string representation of an instance
     * @return {String} String representation of text object
     */
    toString: function() {
      return '#<fabric.Text (' + this.complexity() +
        '): { "text": "' + this.text + '", "fontFamily": "' + this.fontFamily + '" }>';
    },

    /**
     * Return the dimension and the zoom level needed to create a cache canvas
     * big enough to host the object to be cached.
     * @private
     * @param {Object} dim.x width of object to be cached
     * @param {Object} dim.y height of object to be cached
     * @return {Object}.width width of canvas
     * @return {Object}.height height of canvas
     * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
     */
    _getCacheCanvasDimensions: function() {
      var dims = this.callSuper('_getCacheCanvasDimensions');
      var fontSize = this.fontSize;
      dims.width += fontSize * dims.zoomX;
      dims.height += fontSize * dims.zoomY;
      return dims;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function(ctx) {
      var path = this.path;
      path && !path.isNotVisible() && path._render(ctx);
      this._setTextStyles(ctx);
      this._renderTextLinesBackground(ctx);
      this._renderTextDecoration(ctx, 'underline');
      this._renderText(ctx);
      this._renderTextDecoration(ctx, 'overline');
      this._renderTextDecoration(ctx, 'linethrough');
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderText: function(ctx) {
      if (this.paintFirst === 'stroke') {
        this._renderTextStroke(ctx);
        this._renderTextFill(ctx);
      }
      else {
        this._renderTextFill(ctx);
        this._renderTextStroke(ctx);
      }
    },

    /**
     * Set the font parameter of the context with the object properties or with charStyle
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} [charStyle] object with font style properties
     * @param {String} [charStyle.fontFamily] Font Family
     * @param {Number} [charStyle.fontSize] Font size in pixels. ( without px suffix )
     * @param {String} [charStyle.fontWeight] Font weight
     * @param {String} [charStyle.fontStyle] Font style (italic|normal)
     */
    _setTextStyles: function(ctx, charStyle, forMeasuring) {
      ctx.textBaseline = 'alphabetical';
      if (this.path) {
        switch (this.pathAlign) {
          case 'center':
            ctx.textBaseline = 'middle';
            break;
          case 'ascender':
            ctx.textBaseline = 'top';
            break;
          case 'descender':
            ctx.textBaseline = 'bottom';
            break;
        }
      }
      ctx.font = this._getFontDeclaration(charStyle, forMeasuring);
    },

    /**
     * calculate and return the text Width measuring each line.
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @return {Number} Maximum width of fabric.Text object
     */
    calcTextWidth: function() {
      var maxWidth = this.getLineWidth(0);

      for (var i = 1, len = this._textLines.length; i < len; i++) {
        var currentLineWidth = this.getLineWidth(i);
        if (currentLineWidth > maxWidth) {
          maxWidth = currentLineWidth;
        }
      }
      return maxWidth;
    },

    /**
     * @private
     * @param {String} method Method name ("fillText" or "strokeText")
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {String} line Text to render
     * @param {Number} left Left position of text
     * @param {Number} top Top position of text
     * @param {Number} lineIndex Index of a line in a text
     */
    _renderTextLine: function(method, ctx, line, left, top, lineIndex) {
      this._renderChars(method, ctx, line, left, top, lineIndex);
    },

    /**
     * Renders the text background for lines, taking care of style
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextLinesBackground: function(ctx) {
      if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor')) {
        return;
      }
      var heightOfLine,
          lineLeftOffset, originalFill = ctx.fillStyle,
          line, lastColor,
          leftOffset = this._getLeftOffset(),
          lineTopOffset = this._getTopOffset(),
          boxStart = 0, boxWidth = 0, charBox, currentColor, path = this.path,
          drawStart;

      for (var i = 0, len = this._textLines.length; i < len; i++) {
        heightOfLine = this.getHeightOfLine(i);
        if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor', i)) {
          lineTopOffset += heightOfLine;
          continue;
        }
        line = this._textLines[i];
        lineLeftOffset = this._getLineLeftOffset(i);
        boxWidth = 0;
        boxStart = 0;
        lastColor = this.getValueOfPropertyAt(i, 0, 'textBackgroundColor');
        for (var j = 0, jlen = line.length; j < jlen; j++) {
          charBox = this.__charBounds[i][j];
          currentColor = this.getValueOfPropertyAt(i, j, 'textBackgroundColor');
          if (path) {
            ctx.save();
            ctx.translate(charBox.renderLeft, charBox.renderTop);
            ctx.rotate(charBox.angle);
            ctx.fillStyle = currentColor;
            currentColor && ctx.fillRect(
              -charBox.width / 2,
              -heightOfLine / this.lineHeight * (1 - this._fontSizeFraction),
              charBox.width,
              heightOfLine / this.lineHeight
            );
            ctx.restore();
          }
          else if (currentColor !== lastColor) {
            drawStart = leftOffset + lineLeftOffset + boxStart;
            if (this.direction === 'rtl') {
              drawStart = this.width - drawStart - boxWidth;
            }
            ctx.fillStyle = lastColor;
            lastColor && ctx.fillRect(
              drawStart,
              lineTopOffset,
              boxWidth,
              heightOfLine / this.lineHeight
            );
            boxStart = charBox.left;
            boxWidth = charBox.width;
            lastColor = currentColor;
          }
          else {
            boxWidth += charBox.kernedWidth;
          }
        }
        if (currentColor && !path) {
          drawStart = leftOffset + lineLeftOffset + boxStart;
          if (this.direction === 'rtl') {
            drawStart = this.width - drawStart - boxWidth;
          }
          ctx.fillStyle = currentColor;
          ctx.fillRect(
            drawStart,
            lineTopOffset,
            boxWidth,
            heightOfLine / this.lineHeight
          );
        }
        lineTopOffset += heightOfLine;
      }
      ctx.fillStyle = originalFill;
      // if there is text background color no
      // other shadows should be casted
      this._removeShadow(ctx);
    },

    /**
     * @private
     * @param {Object} decl style declaration for cache
     * @param {String} decl.fontFamily fontFamily
     * @param {String} decl.fontStyle fontStyle
     * @param {String} decl.fontWeight fontWeight
     * @return {Object} reference to cache
     */
    getFontCache: function(decl) {
      var fontFamily = decl.fontFamily.toLowerCase();
      if (!fabric.charWidthsCache[fontFamily]) {
        fabric.charWidthsCache[fontFamily] = { };
      }
      var cache = fabric.charWidthsCache[fontFamily],
          cacheProp = decl.fontStyle.toLowerCase() + '_' + (decl.fontWeight + '').toLowerCase();
      if (!cache[cacheProp]) {
        cache[cacheProp] = { };
      }
      return cache[cacheProp];
    },

    /**
     * measure and return the width of a single character.
     * possibly overridden to accommodate different measure logic or
     * to hook some external lib for character measurement
     * @private
     * @param {String} _char, char to be measured
     * @param {Object} charStyle style of char to be measured
     * @param {String} [previousChar] previous char
     * @param {Object} [prevCharStyle] style of previous char
     */
    _measureChar: function(_char, charStyle, previousChar, prevCharStyle) {
      // first i try to return from cache
      var fontCache = this.getFontCache(charStyle), fontDeclaration = this._getFontDeclaration(charStyle),
          previousFontDeclaration = this._getFontDeclaration(prevCharStyle), couple = previousChar + _char,
          stylesAreEqual = fontDeclaration === previousFontDeclaration, width, coupleWidth, previousWidth,
          fontMultiplier = charStyle.fontSize / this.CACHE_FONT_SIZE, kernedWidth;

      if (previousChar && fontCache[previousChar] !== undefined) {
        previousWidth = fontCache[previousChar];
      }
      if (fontCache[_char] !== undefined) {
        kernedWidth = width = fontCache[_char];
      }
      if (stylesAreEqual && fontCache[couple] !== undefined) {
        coupleWidth = fontCache[couple];
        kernedWidth = coupleWidth - previousWidth;
      }
      if (width === undefined || previousWidth === undefined || coupleWidth === undefined) {
        var ctx = this.getMeasuringContext();
        // send a TRUE to specify measuring font size CACHE_FONT_SIZE
        this._setTextStyles(ctx, charStyle, true);
      }
      if (width === undefined) {
        kernedWidth = width = ctx.measureText(_char).width;
        fontCache[_char] = width;
      }
      if (previousWidth === undefined && stylesAreEqual && previousChar) {
        previousWidth = ctx.measureText(previousChar).width;
        fontCache[previousChar] = previousWidth;
      }
      if (stylesAreEqual && coupleWidth === undefined) {
        // we can measure the kerning couple and subtract the width of the previous character
        coupleWidth = ctx.measureText(couple).width;
        fontCache[couple] = coupleWidth;
        kernedWidth = coupleWidth - previousWidth;
      }
      return { width: width * fontMultiplier, kernedWidth: kernedWidth * fontMultiplier };
    },

    /**
     * Computes height of character at given position
     * @param {Number} line the line index number
     * @param {Number} _char the character index number
     * @return {Number} fontSize of the character
     */
    getHeightOfChar: function(line, _char) {
      return this.getValueOfPropertyAt(line, _char, 'fontSize');
    },

    /**
     * measure a text line measuring all characters.
     * @param {Number} lineIndex line number
     * @return {Number} Line width
     */
    measureLine: function(lineIndex) {
      var lineInfo = this._measureLine(lineIndex);
      if (this.charSpacing !== 0) {
        lineInfo.width -= this._getWidthOfCharSpacing();
      }
      if (lineInfo.width < 0) {
        lineInfo.width = 0;
      }
      return lineInfo;
    },

    /**
     * measure every grapheme of a line, populating __charBounds
     * @param {Number} lineIndex
     * @return {Object} object.width total width of characters
     * @return {Object} object.widthOfSpaces length of chars that match this._reSpacesAndTabs
     */
    _measureLine: function(lineIndex) {
      var width = 0, i, grapheme, line = this._textLines[lineIndex], prevGrapheme,
          graphemeInfo, numOfSpaces = 0, lineBounds = new Array(line.length),
          positionInPath = 0, startingPoint, totalPathLength, path = this.path,
          reverse = this.pathSide === 'right';

      this.__charBounds[lineIndex] = lineBounds;
      for (i = 0; i < line.length; i++) {
        grapheme = line[i];
        graphemeInfo = this._getGraphemeBox(grapheme, lineIndex, i, prevGrapheme);
        lineBounds[i] = graphemeInfo;
        width += graphemeInfo.kernedWidth;
        prevGrapheme = grapheme;
      }
      // this latest bound box represent the last character of the line
      // to simplify cursor handling in interactive mode.
      lineBounds[i] = {
        left: graphemeInfo ? graphemeInfo.left + graphemeInfo.width : 0,
        width: 0,
        kernedWidth: 0,
        height: this.fontSize
      };
      if (path) {
        totalPathLength = path.segmentsInfo[path.segmentsInfo.length - 1].length;
        startingPoint = fabric.util.getPointOnPath(path.path, 0, path.segmentsInfo);
        startingPoint.x += path.pathOffset.x;
        startingPoint.y += path.pathOffset.y;
        switch (this.textAlign) {
          case 'left':
            positionInPath = reverse ? (totalPathLength - width) : 0;
            break;
          case 'center':
            positionInPath = (totalPathLength - width) / 2;
            break;
          case 'right':
            positionInPath = reverse ? 0 : (totalPathLength - width);
            break;
          //todo - add support for justify
        }
        positionInPath += this.pathStartOffset * (reverse ? -1 : 1);
        for (i = reverse ? line.length - 1 : 0;
          reverse ? i >= 0 : i < line.length;
          reverse ? i-- : i++) {
          graphemeInfo = lineBounds[i];
          if (positionInPath > totalPathLength) {
            positionInPath %= totalPathLength;
          }
          else if (positionInPath < 0) {
            positionInPath += totalPathLength;
          }
          // it would probably much faster to send all the grapheme position for a line
          // and calculate path position/angle at once.
          this._setGraphemeOnPath(positionInPath, graphemeInfo, startingPoint);
          positionInPath += graphemeInfo.kernedWidth;
        }
      }
      return { width: width, numOfSpaces: numOfSpaces };
    },

    /**
     * Calculate the angle  and the left,top position of the char that follow a path.
     * It appends it to graphemeInfo to be reused later at rendering
     * @private
     * @param {Number} positionInPath to be measured
     * @param {Object} graphemeInfo current grapheme box information
     * @param {Object} startingPoint position of the point
     */
    _setGraphemeOnPath: function(positionInPath, graphemeInfo, startingPoint) {
      var centerPosition = positionInPath + graphemeInfo.kernedWidth / 2,
          path = this.path;

      // we are at currentPositionOnPath. we want to know what point on the path is.
      var info = fabric.util.getPointOnPath(path.path, centerPosition, path.segmentsInfo);
      graphemeInfo.renderLeft = info.x - startingPoint.x;
      graphemeInfo.renderTop = info.y - startingPoint.y;
      graphemeInfo.angle = info.angle + (this.pathSide ===  'right' ? Math.PI : 0);
    },

    /**
     * Measure and return the info of a single grapheme.
     * needs the the info of previous graphemes already filled
     * @private
     * @param {String} grapheme to be measured
     * @param {Number} lineIndex index of the line where the char is
     * @param {Number} charIndex position in the line
     * @param {String} [prevGrapheme] character preceding the one to be measured
     */
    _getGraphemeBox: function(grapheme, lineIndex, charIndex, prevGrapheme, skipLeft) {
      var style = this.getCompleteStyleDeclaration(lineIndex, charIndex),
          prevStyle = prevGrapheme ? this.getCompleteStyleDeclaration(lineIndex, charIndex - 1) : { },
          info = this._measureChar(grapheme, style, prevGrapheme, prevStyle),
          kernedWidth = info.kernedWidth,
          width = info.width, charSpacing;

      if (this.charSpacing !== 0) {
        charSpacing = this._getWidthOfCharSpacing();
        width += charSpacing;
        kernedWidth += charSpacing;
      }

      var box = {
        width: width,
        left: 0,
        height: style.fontSize,
        kernedWidth: kernedWidth,
        deltaY: style.deltaY,
      };
      if (charIndex > 0 && !skipLeft) {
        var previousBox = this.__charBounds[lineIndex][charIndex - 1];
        box.left = previousBox.left + previousBox.width + info.kernedWidth - info.width;
      }
      return box;
    },

    /**
     * Calculate height of line at 'lineIndex'
     * @param {Number} lineIndex index of line to calculate
     * @return {Number}
     */
    getHeightOfLine: function(lineIndex) {
      if (this.__lineHeights[lineIndex]) {
        return this.__lineHeights[lineIndex];
      }

      var line = this._textLines[lineIndex],
          // char 0 is measured before the line cycle because it nneds to char
          // emptylines
          maxHeight = this.getHeightOfChar(lineIndex, 0);
      for (var i = 1, len = line.length; i < len; i++) {
        maxHeight = Math.max(this.getHeightOfChar(lineIndex, i), maxHeight);
      }

      return this.__lineHeights[lineIndex] = maxHeight * this.lineHeight * this._fontSizeMult;
    },

    /**
     * Calculate text box height
     */
    calcTextHeight: function() {
      var lineHeight, height = 0;
      for (var i = 0, len = this._textLines.length; i < len; i++) {
        lineHeight = this.getHeightOfLine(i);
        height += (i === len - 1 ? lineHeight / this.lineHeight : lineHeight);
      }
      return height;
    },

    /**
     * @private
     * @return {Number} Left offset
     */
    _getLeftOffset: function() {
      return this.direction === 'ltr' ? -this.width / 2 : this.width / 2;
    },

    /**
     * @private
     * @return {Number} Top offset
     */
    _getTopOffset: function() {
      return -this.height / 2;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {String} method Method name ("fillText" or "strokeText")
     */
    _renderTextCommon: function(ctx, method) {
      ctx.save();
      var lineHeights = 0, left = this._getLeftOffset(), top = this._getTopOffset();
      for (var i = 0, len = this._textLines.length; i < len; i++) {
        var heightOfLine = this.getHeightOfLine(i),
            maxHeight = heightOfLine / this.lineHeight,
            leftOffset = this._getLineLeftOffset(i);
        this._renderTextLine(
          method,
          ctx,
          this._textLines[i],
          left + leftOffset,
          top + lineHeights + maxHeight,
          i
        );
        lineHeights += heightOfLine;
      }
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextFill: function(ctx) {
      if (!this.fill && !this.styleHas('fill')) {
        return;
      }

      this._renderTextCommon(ctx, 'fillText');
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextStroke: function(ctx) {
      if ((!this.stroke || this.strokeWidth === 0) && this.isEmptyStyles()) {
        return;
      }

      if (this.shadow && !this.shadow.affectStroke) {
        this._removeShadow(ctx);
      }

      ctx.save();
      this._setLineDash(ctx, this.strokeDashArray);
      ctx.beginPath();
      this._renderTextCommon(ctx, 'strokeText');
      ctx.closePath();
      ctx.restore();
    },

    /**
     * @private
     * @param {String} method fillText or strokeText.
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Array} line Content of the line, splitted in an array by grapheme
     * @param {Number} left
     * @param {Number} top
     * @param {Number} lineIndex
     */
    _renderChars: function(method, ctx, line, left, top, lineIndex) {
      // set proper line offset
      var lineHeight = this.getHeightOfLine(lineIndex),
          isJustify = this.textAlign.indexOf('justify') !== -1,
          actualStyle,
          nextStyle,
          charsToRender = '',
          charBox,
          boxWidth = 0,
          timeToRender,
          path = this.path,
          shortCut = !isJustify && this.charSpacing === 0 && this.isEmptyStyles(lineIndex) && !path,
          isLtr = this.direction === 'ltr', sign = this.direction === 'ltr' ? 1 : -1,
          drawingLeft, currentDirection = ctx.canvas.getAttribute('dir');
      ctx.save();
      if (currentDirection !== this.direction) {
        ctx.canvas.setAttribute('dir', isLtr ? 'ltr' : 'rtl');
        ctx.direction = isLtr ? 'ltr' : 'rtl';
        ctx.textAlign = isLtr ? 'left' : 'right';
      }
      top -= lineHeight * this._fontSizeFraction / this.lineHeight;
      if (shortCut) {
        // render all the line in one pass without checking
        // drawingLeft = isLtr ? left : left - this.getLineWidth(lineIndex);
        this._renderChar(method, ctx, lineIndex, 0, line.join(''), left, top, lineHeight);
        ctx.restore();
        return;
      }
      for (var i = 0, len = line.length - 1; i <= len; i++) {
        timeToRender = i === len || this.charSpacing || path;
        charsToRender += line[i];
        charBox = this.__charBounds[lineIndex][i];
        if (boxWidth === 0) {
          left += sign * (charBox.kernedWidth - charBox.width);
          boxWidth += charBox.width;
        }
        else {
          boxWidth += charBox.kernedWidth;
        }
        if (isJustify && !timeToRender) {
          if (this._reSpaceAndTab.test(line[i])) {
            timeToRender = true;
          }
        }
        if (!timeToRender) {
          // if we have charSpacing, we render char by char
          actualStyle = actualStyle || this.getCompleteStyleDeclaration(lineIndex, i);
          nextStyle = this.getCompleteStyleDeclaration(lineIndex, i + 1);
          timeToRender = fabric.util.hasStyleChanged(actualStyle, nextStyle, false);
        }
        if (timeToRender) {
          if (path) {
            ctx.save();
            ctx.translate(charBox.renderLeft, charBox.renderTop);
            ctx.rotate(charBox.angle);
            this._renderChar(method, ctx, lineIndex, i, charsToRender, -boxWidth / 2, 0, lineHeight);
            ctx.restore();
          }
          else {
            drawingLeft = left;
            this._renderChar(method, ctx, lineIndex, i, charsToRender, drawingLeft, top, lineHeight);
          }
          charsToRender = '';
          actualStyle = nextStyle;
          left += sign * boxWidth;
          boxWidth = 0;
        }
      }
      ctx.restore();
    },

    /**
     * This function try to patch the missing gradientTransform on canvas gradients.
     * transforming a context to transform the gradient, is going to transform the stroke too.
     * we want to transform the gradient but not the stroke operation, so we create
     * a transformed gradient on a pattern and then we use the pattern instead of the gradient.
     * this method has drawbacks: is slow, is in low resolution, needs a patch for when the size
     * is limited.
     * @private
     * @param {fabric.Gradient} filler a fabric gradient instance
     * @return {CanvasPattern} a pattern to use as fill/stroke style
     */
    _applyPatternGradientTransformText: function(filler) {
      var pCanvas = fabric.util.createCanvasElement(), pCtx,
          // TODO: verify compatibility with strokeUniform
          width = this.width + this.strokeWidth, height = this.height + this.strokeWidth;
      pCanvas.width = width;
      pCanvas.height = height;
      pCtx = pCanvas.getContext('2d');
      pCtx.beginPath(); pCtx.moveTo(0, 0); pCtx.lineTo(width, 0); pCtx.lineTo(width, height);
      pCtx.lineTo(0, height); pCtx.closePath();
      pCtx.translate(width / 2, height / 2);
      pCtx.fillStyle = filler.toLive(pCtx);
      this._applyPatternGradientTransform(pCtx, filler);
      pCtx.fill();
      return pCtx.createPattern(pCanvas, 'no-repeat');
    },

    handleFiller: function(ctx, property, filler) {
      var offsetX, offsetY;
      if (filler.toLive) {
        if (filler.gradientUnits === 'percentage' || filler.gradientTransform || filler.patternTransform) {
          // need to transform gradient in a pattern.
          // this is a slow process. If you are hitting this codepath, and the object
          // is not using caching, you should consider switching it on.
          // we need a canvas as big as the current object caching canvas.
          offsetX = -this.width / 2;
          offsetY = -this.height / 2;
          ctx.translate(offsetX, offsetY);
          ctx[property] = this._applyPatternGradientTransformText(filler);
          return { offsetX: offsetX, offsetY: offsetY };
        }
        else {
          // is a simple gradient or pattern
          ctx[property] = filler.toLive(ctx, this);
          return this._applyPatternGradientTransform(ctx, filler);
        }
      }
      else {
        // is a color
        ctx[property] = filler;
      }
      return { offsetX: 0, offsetY: 0 };
    },

    _setStrokeStyles: function(ctx, decl) {
      ctx.lineWidth = decl.strokeWidth;
      ctx.lineCap = this.strokeLineCap;
      ctx.lineDashOffset = this.strokeDashOffset;
      ctx.lineJoin = this.strokeLineJoin;
      ctx.miterLimit = this.strokeMiterLimit;
      return this.handleFiller(ctx, 'strokeStyle', decl.stroke);
    },

    _setFillStyles: function(ctx, decl) {
      return this.handleFiller(ctx, 'fillStyle', decl.fill);
    },

    /**
     * @private
     * @param {String} method
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @param {String} _char
     * @param {Number} left Left coordinate
     * @param {Number} top Top coordinate
     * @param {Number} lineHeight Height of the line
     */
    _renderChar: function(method, ctx, lineIndex, charIndex, _char, left, top) {
      var decl = this._getStyleDeclaration(lineIndex, charIndex),
          fullDecl = this.getCompleteStyleDeclaration(lineIndex, charIndex),
          shouldFill = method === 'fillText' && fullDecl.fill,
          shouldStroke = method === 'strokeText' && fullDecl.stroke && fullDecl.strokeWidth,
          fillOffsets, strokeOffsets;

      if (!shouldStroke && !shouldFill) {
        return;
      }
      ctx.save();

      shouldFill && (fillOffsets = this._setFillStyles(ctx, fullDecl));
      shouldStroke && (strokeOffsets = this._setStrokeStyles(ctx, fullDecl));

      ctx.font = this._getFontDeclaration(fullDecl);


      if (decl && decl.textBackgroundColor) {
        this._removeShadow(ctx);
      }
      if (decl && decl.deltaY) {
        top += decl.deltaY;
      }
      shouldFill && ctx.fillText(_char, left - fillOffsets.offsetX, top - fillOffsets.offsetY);
      shouldStroke && ctx.strokeText(_char, left - strokeOffsets.offsetX, top - strokeOffsets.offsetY);
      ctx.restore();
    },

    /**
     * Turns the character into a 'superior figure' (i.e. 'superscript')
     * @param {Number} start selection start
     * @param {Number} end selection end
     * @returns {fabric.Text} thisArg
     * @chainable
     */
    setSuperscript: function(start, end) {
      return this._setScript(start, end, this.superscript);
    },

    /**
     * Turns the character into an 'inferior figure' (i.e. 'subscript')
     * @param {Number} start selection start
     * @param {Number} end selection end
     * @returns {fabric.Text} thisArg
     * @chainable
     */
    setSubscript: function(start, end) {
      return this._setScript(start, end, this.subscript);
    },

    /**
     * Applies 'schema' at given position
     * @private
     * @param {Number} start selection start
     * @param {Number} end selection end
     * @param {Number} schema
     * @returns {fabric.Text} thisArg
     * @chainable
     */
    _setScript: function(start, end, schema) {
      var loc = this.get2DCursorLocation(start, true),
          fontSize = this.getValueOfPropertyAt(loc.lineIndex, loc.charIndex, 'fontSize'),
          dy = this.getValueOfPropertyAt(loc.lineIndex, loc.charIndex, 'deltaY'),
          style = { fontSize: fontSize * schema.size, deltaY: dy + fontSize * schema.baseline };
      this.setSelectionStyles(style, start, end);
      return this;
    },

    /**
     * @private
     * @param {Number} lineIndex index text line
     * @return {Number} Line left offset
     */
    _getLineLeftOffset: function(lineIndex) {
      var lineWidth = this.getLineWidth(lineIndex),
          lineDiff = this.width - lineWidth, textAlign = this.textAlign, direction = this.direction,
          isEndOfWrapping, leftOffset = 0, isEndOfWrapping = this.isEndOfWrapping(lineIndex);
      if (textAlign === 'justify'
        || (textAlign === 'justify-center' && !isEndOfWrapping)
        || (textAlign === 'justify-right' && !isEndOfWrapping)
        || (textAlign === 'justify-left' && !isEndOfWrapping)
      ) {
        return 0;
      }
      if (textAlign === 'center') {
        leftOffset = lineDiff / 2;
      }
      if (textAlign === 'right') {
        leftOffset = lineDiff;
      }
      if (textAlign === 'justify-center') {
        leftOffset = lineDiff / 2;
      }
      if (textAlign === 'justify-right') {
        leftOffset = lineDiff;
      }
      if (direction === 'rtl') {
        leftOffset -= lineDiff;
      }
      return leftOffset;
    },

    /**
     * @private
     */
    _clearCache: function() {
      this.__lineWidths = [];
      this.__lineHeights = [];
      this.__charBounds = [];
    },

    /**
     * @private
     */
    _shouldClearDimensionCache: function() {
      var shouldClear = this._forceClearCache;
      shouldClear || (shouldClear = this.hasStateChanged('_dimensionAffectingProps'));
      if (shouldClear) {
        this.dirty = true;
        this._forceClearCache = false;
      }
      return shouldClear;
    },

    /**
     * Measure a single line given its index. Used to calculate the initial
     * text bounding box. The values are calculated and stored in __lineWidths cache.
     * @private
     * @param {Number} lineIndex line number
     * @return {Number} Line width
     */
    getLineWidth: function(lineIndex) {
      if (this.__lineWidths[lineIndex] !== undefined) {
        return this.__lineWidths[lineIndex];
      }

      var lineInfo = this.measureLine(lineIndex);
      var width = lineInfo.width;
      this.__lineWidths[lineIndex] = width;
      return width;
    },

    _getWidthOfCharSpacing: function() {
      if (this.charSpacing !== 0) {
        return this.fontSize * this.charSpacing / 1000;
      }
      return 0;
    },

    /**
     * Retrieves the value of property at given character position
     * @param {Number} lineIndex the line number
     * @param {Number} charIndex the character number
     * @param {String} property the property name
     * @returns the value of 'property'
     */
    getValueOfPropertyAt: function(lineIndex, charIndex, property) {
      var charStyle = this._getStyleDeclaration(lineIndex, charIndex);
      if (charStyle && typeof charStyle[property] !== 'undefined') {
        return charStyle[property];
      }
      return this[property];
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextDecoration: function(ctx, type) {
      if (!this[type] && !this.styleHas(type)) {
        return;
      }
      var heightOfLine, size, _size,
          lineLeftOffset, dy, _dy,
          line, lastDecoration,
          leftOffset = this._getLeftOffset(),
          topOffset = this._getTopOffset(), top,
          boxStart, boxWidth, charBox, currentDecoration,
          maxHeight, currentFill, lastFill, path = this.path,
          charSpacing = this._getWidthOfCharSpacing(),
          offsetY = this.offsets[type];

      for (var i = 0, len = this._textLines.length; i < len; i++) {
        heightOfLine = this.getHeightOfLine(i);
        if (!this[type] && !this.styleHas(type, i)) {
          topOffset += heightOfLine;
          continue;
        }
        line = this._textLines[i];
        maxHeight = heightOfLine / this.lineHeight;
        lineLeftOffset = this._getLineLeftOffset(i);
        boxStart = 0;
        boxWidth = 0;
        lastDecoration = this.getValueOfPropertyAt(i, 0, type);
        lastFill = this.getValueOfPropertyAt(i, 0, 'fill');
        top = topOffset + maxHeight * (1 - this._fontSizeFraction);
        size = this.getHeightOfChar(i, 0);
        dy = this.getValueOfPropertyAt(i, 0, 'deltaY');
        for (var j = 0, jlen = line.length; j < jlen; j++) {
          charBox = this.__charBounds[i][j];
          currentDecoration = this.getValueOfPropertyAt(i, j, type);
          currentFill = this.getValueOfPropertyAt(i, j, 'fill');
          _size = this.getHeightOfChar(i, j);
          _dy = this.getValueOfPropertyAt(i, j, 'deltaY');
          if (path && currentDecoration && currentFill) {
            ctx.save();
            ctx.fillStyle = lastFill;
            ctx.translate(charBox.renderLeft, charBox.renderTop);
            ctx.rotate(charBox.angle);
            ctx.fillRect(
              -charBox.kernedWidth / 2,
              offsetY * _size + _dy,
              charBox.kernedWidth,
              this.fontSize / 15
            );
            ctx.restore();
          }
          else if (
            (currentDecoration !== lastDecoration || currentFill !== lastFill || _size !== size || _dy !== dy)
            && boxWidth > 0
          ) {
            var drawStart = leftOffset + lineLeftOffset + boxStart;
            if (this.direction === 'rtl') {
              drawStart = this.width - drawStart - boxWidth;
            }
            if (lastDecoration && lastFill) {
              ctx.fillStyle = lastFill;
              ctx.fillRect(
                drawStart,
                top + offsetY * size + dy,
                boxWidth,
                this.fontSize / 15
              );
            }
            boxStart = charBox.left;
            boxWidth = charBox.width;
            lastDecoration = currentDecoration;
            lastFill = currentFill;
            size = _size;
            dy = _dy;
          }
          else {
            boxWidth += charBox.kernedWidth;
          }
        }
        var drawStart = leftOffset + lineLeftOffset + boxStart;
        if (this.direction === 'rtl') {
          drawStart = this.width - drawStart - boxWidth;
        }
        ctx.fillStyle = currentFill;
        currentDecoration && currentFill && ctx.fillRect(
          drawStart,
          top + offsetY * size + dy,
          boxWidth - charSpacing,
          this.fontSize / 15
        );
        topOffset += heightOfLine;
      }
      // if there is text background color no
      // other shadows should be casted
      this._removeShadow(ctx);
    },

    /**
     * return font declaration string for canvas context
     * @param {Object} [styleObject] object
     * @returns {String} font declaration formatted for canvas context.
     */
    _getFontDeclaration: function(styleObject, forMeasuring) {
      var style = styleObject || this, family = this.fontFamily,
          fontIsGeneric = fabric.Text.genericFonts.indexOf(family.toLowerCase()) > -1;
      var fontFamily = family === undefined ||
      family.indexOf('\'') > -1 || family.indexOf(',') > -1 ||
      family.indexOf('"') > -1 || fontIsGeneric
        ? style.fontFamily : '"' + style.fontFamily + '"';
      return [
        // node-canvas needs "weight style", while browsers need "style weight"
        // verify if this can be fixed in JSDOM
        (fabric.isLikelyNode ? style.fontWeight : style.fontStyle),
        (fabric.isLikelyNode ? style.fontStyle : style.fontWeight),
        forMeasuring ? this.CACHE_FONT_SIZE + 'px' : style.fontSize + 'px',
        fontFamily
      ].join(' ');
    },

    /**
     * Renders text instance on a specified context
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    render: function(ctx) {
      // do not render if object is not visible
      if (!this.visible) {
        return;
      }
      if (this.canvas && this.canvas.skipOffscreen && !this.group && !this.isOnScreen()) {
        return;
      }
      if (this._shouldClearDimensionCache()) {
        this.initDimensions();
      }
      this.callSuper('render', ctx);
    },

    /**
     * Returns the text as an array of lines.
     * @param {String} text text to split
     * @returns {Array} Lines in the text
     */
    _splitTextIntoLines: function(text) {
      var lines = text.split(this._reNewline),
          newLines = new Array(lines.length),
          newLine = ['\n'],
          newText = [];
      for (var i = 0; i < lines.length; i++) {
        newLines[i] = fabric.util.string.graphemeSplit(lines[i]);
        newText = newText.concat(newLines[i], newLine);
      }
      newText.pop();
      return { _unwrappedLines: newLines, lines: lines, graphemeText: newText, graphemeLines: newLines };
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      var allProperties = additionalProps.concat(propertiesToInclude);
      var obj = this.callSuper('toObject', allProperties);
      obj.styles = fabric.util.stylesToArray(this.styles, this.text);
      if (obj.path) {
        obj.path = this.path.toObject();
      }
      return obj;
    },

    /**
     * Sets property to a given value. When changing position/dimension -related properties (left, top, scale, angle, etc.) `set` does not update position of object's borders/controls. If you need to update those, call `setCoords()`.
     * @param {String|Object} key Property name or object (if object, iterate over the object properties)
     * @param {Object|Function} value Property value (if function, the value is passed into it and its return value is used as a new one)
     * @return {fabric.Object} thisArg
     * @chainable
     */
    set: function(key, value) {
      this.callSuper('set', key, value);
      var needsDims = false;
      var isAddingPath = false;
      if (typeof key === 'object') {
        for (var _key in key) {
          if (_key === 'path') {
            this.setPathInfo();
          }
          needsDims = needsDims || this._dimensionAffectingProps.indexOf(_key) !== -1;
          isAddingPath = isAddingPath || _key === 'path';
        }
      }
      else {
        needsDims = this._dimensionAffectingProps.indexOf(key) !== -1;
        isAddingPath = key === 'path';
      }
      if (isAddingPath) {
        this.setPathInfo();
      }
      if (needsDims) {
        this.initDimensions();
        this.setCoords();
      }
      return this;
    },

    /**
     * Returns complexity of an instance
     * @return {Number} complexity
     */
    complexity: function() {
      return 1;
    }
  });

  

  /**
   * Returns fabric.Text instance from an object representation
   * @static
   * @memberOf fabric.Text
   * @param {Object} object plain js Object to create an instance from
   * @param {Function} [callback] Callback to invoke when an fabric.Text instance is created
   */
  fabric.Text.fromObject = function(object, callback) {
    var objectCopy = clone(object), path = object.path;
    delete objectCopy.path;
    return fabric.Object._fromObject('Text', objectCopy, function(textInstance) {
      textInstance.styles = fabric.util.stylesFromArray(object.styles, object.text);
      if (path) {
        fabric.Object._fromObject('Path', path, function(pathInstance) {
          textInstance.set('path', pathInstance);
          callback(textInstance);
        }, 'path');
      }
      else {
        callback(textInstance);
      }
    }, 'text');
  };

  fabric.Text.genericFonts = ['sans-serif', 'serif', 'cursive', 'fantasy', 'monospace'];

  fabric.util.createAccessors && fabric.util.createAccessors(fabric.Text);

})(typeof exports !== 'undefined' ? exports : this);
(function() {
  fabric.util.object.extend(fabric.Text.prototype, /** @lends fabric.Text.prototype */ {
    /**
     * Returns true if object has no styling or no styling in a line
     * @param {Number} lineIndex , lineIndex is on wrapped lines.
     * @return {Boolean}
     */
    isEmptyStyles: function(lineIndex) {
      if (!this.styles) {
        return true;
      }
      if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
        return true;
      }
      var obj = typeof lineIndex === 'undefined' ? this.styles : { line: this.styles[lineIndex] };
      for (var p1 in obj) {
        for (var p2 in obj[p1]) {
          // eslint-disable-next-line no-unused-vars
          for (var p3 in obj[p1][p2]) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * Returns true if object has a style property or has it ina specified line
     * This function is used to detect if a text will use a particular property or not.
     * @param {String} property to check for
     * @param {Number} lineIndex to check the style on
     * @return {Boolean}
     */
    styleHas: function(property, lineIndex) {
      if (!this.styles || !property || property === '') {
        return false;
      }
      if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
        return false;
      }
      var obj = typeof lineIndex === 'undefined' ? this.styles : { 0: this.styles[lineIndex] };
      // eslint-disable-next-line
      for (var p1 in obj) {
        // eslint-disable-next-line
        for (var p2 in obj[p1]) {
          if (typeof obj[p1][p2][property] !== 'undefined') {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Check if characters in a text have a value for a property
     * whose value matches the textbox's value for that property.  If so,
     * the character-level property is deleted.  If the character
     * has no other properties, then it is also deleted.  Finally,
     * if the line containing that character has no other characters
     * then it also is deleted.
     *
     * @param {string} property The property to compare between characters and text.
     */
    cleanStyle: function(property) {
      if (!this.styles || !property || property === '') {
        return false;
      }
      var obj = this.styles, stylesCount = 0, letterCount, stylePropertyValue,
          allStyleObjectPropertiesMatch = true, graphemeCount = 0, styleObject;
      // eslint-disable-next-line
      for (var p1 in obj) {
        letterCount = 0;
        // eslint-disable-next-line
        for (var p2 in obj[p1]) {
          var styleObject = obj[p1][p2],
              stylePropertyHasBeenSet = styleObject.hasOwnProperty(property);

          stylesCount++;

          if (stylePropertyHasBeenSet) {
            if (!stylePropertyValue) {
              stylePropertyValue = styleObject[property];
            }
            else if (styleObject[property] !== stylePropertyValue) {
              allStyleObjectPropertiesMatch = false;
            }

            if (styleObject[property] === this[property]) {
              delete styleObject[property];
            }
          }
          else {
            allStyleObjectPropertiesMatch = false;
          }

          if (Object.keys(styleObject).length !== 0) {
            letterCount++;
          }
          else {
            delete obj[p1][p2];
          }
        }

        if (letterCount === 0) {
          delete obj[p1];
        }
      }
      // if every grapheme has the same style set then
      // delete those styles and set it on the parent
      for (var i = 0; i < this._textLines.length; i++) {
        graphemeCount += this._textLines[i].length;
      }
      if (allStyleObjectPropertiesMatch && stylesCount === graphemeCount) {
        this[property] = stylePropertyValue;
        this.removeStyle(property);
      }
    },

    /**
     * Remove a style property or properties from all individual character styles
     * in a text object.  Deletes the character style object if it contains no other style
     * props.  Deletes a line style object if it contains no other character styles.
     *
     * @param {String} props The property to remove from character styles.
     */
    removeStyle: function(property) {
      if (!this.styles || !property || property === '') {
        return;
      }
      var obj = this.styles, line, lineNum, charNum;
      for (lineNum in obj) {
        line = obj[lineNum];
        for (charNum in line) {
          delete line[charNum][property];
          if (Object.keys(line[charNum]).length === 0) {
            delete line[charNum];
          }
        }
        if (Object.keys(line).length === 0) {
          delete obj[lineNum];
        }
      }
    },

    /**
     * @private
     */
    _extendStyles: function(index, styles) {
      var loc = this.get2DCursorLocation(index);

      if (!this._getLineStyle(loc.lineIndex)) {
        this._setLineStyle(loc.lineIndex);
      }

      if (!this._getStyleDeclaration(loc.lineIndex, loc.charIndex)) {
        this._setStyleDeclaration(loc.lineIndex, loc.charIndex, {});
      }

      fabric.util.object.extend(this._getStyleDeclaration(loc.lineIndex, loc.charIndex), styles);
    },

    /**
     * Returns 2d representation (lineIndex and charIndex) of cursor (or selection start)
     * @param {Number} [selectionStart] Optional index. When not given, current selectionStart is used.
     * @param {Boolean} [skipWrapping] consider the location for unwrapped lines. useful to manage styles.
     */
    get2DCursorLocation: function(selectionStart, skipWrapping) {
      if (typeof selectionStart === 'undefined') {
        selectionStart = this.selectionStart;
      }
      var lines = skipWrapping ? this._unwrappedTextLines : this._textLines,
          len = lines.length;
      for (var i = 0; i < len; i++) {
        if (selectionStart <= lines[i].length) {
          return {
            lineIndex: i,
            charIndex: selectionStart
          };
        }
        selectionStart -= lines[i].length + this.missingNewlineOffset(i);
      }
      return {
        lineIndex: i - 1,
        charIndex: lines[i - 1].length < selectionStart ? lines[i - 1].length : selectionStart
      };
    },

    /**
     * Gets style of a current selection/cursor (at the start position)
     * if startIndex or endIndex are not provided, selectionStart or selectionEnd will be used.
     * @param {Number} [startIndex] Start index to get styles at
     * @param {Number} [endIndex] End index to get styles at, if not specified selectionEnd or startIndex + 1
     * @param {Boolean} [complete] get full style or not
     * @return {Array} styles an array with one, zero or more Style objects
     */
    getSelectionStyles: function(startIndex, endIndex, complete) {
      if (typeof startIndex === 'undefined') {
        startIndex = this.selectionStart || 0;
      }
      if (typeof endIndex === 'undefined') {
        endIndex = this.selectionEnd || startIndex;
      }
      var styles = [];
      for (var i = startIndex; i < endIndex; i++) {
        styles.push(this.getStyleAtPosition(i, complete));
      }
      return styles;
    },

    /**
     * Gets style of a current selection/cursor position
     * @param {Number} position  to get styles at
     * @param {Boolean} [complete] full style if true
     * @return {Object} style Style object at a specified index
     * @private
     */
    getStyleAtPosition: function(position, complete) {
      var loc = this.get2DCursorLocation(position),
          style = complete ? this.getCompleteStyleDeclaration(loc.lineIndex, loc.charIndex) :
            this._getStyleDeclaration(loc.lineIndex, loc.charIndex);
      return style || {};
    },

    /**
     * Sets style of a current selection, if no selection exist, do not set anything.
     * @param {Object} [styles] Styles object
     * @param {Number} [startIndex] Start index to get styles at
     * @param {Number} [endIndex] End index to get styles at, if not specified selectionEnd or startIndex + 1
     * @return {fabric.IText} thisArg
     * @chainable
     */
    setSelectionStyles: function(styles, startIndex, endIndex) {
      if (typeof startIndex === 'undefined') {
        startIndex = this.selectionStart || 0;
      }
      if (typeof endIndex === 'undefined') {
        endIndex = this.selectionEnd || startIndex;
      }
      for (var i = startIndex; i < endIndex; i++) {
        this._extendStyles(i, styles);
      }
      /* not included in _extendStyles to avoid clearing cache more than once */
      this._forceClearCache = true;
      return this;
    },

    /**
     * get the reference, not a clone, of the style object for a given character
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @return {Object} style object
     */
    _getStyleDeclaration: function(lineIndex, charIndex) {
      var lineStyle = this.styles && this.styles[lineIndex];
      if (!lineStyle) {
        return null;
      }
      return lineStyle[charIndex];
    },

    /**
     * return a new object that contains all the style property for a character
     * the object returned is newly created
     * @param {Number} lineIndex of the line where the character is
     * @param {Number} charIndex position of the character on the line
     * @return {Object} style object
     */
    getCompleteStyleDeclaration: function(lineIndex, charIndex) {
      var style = this._getStyleDeclaration(lineIndex, charIndex) || { },
          styleObject = { }, prop;
      for (var i = 0; i < this._styleProperties.length; i++) {
        prop = this._styleProperties[i];
        styleObject[prop] = typeof style[prop] === 'undefined' ? this[prop] : style[prop];
      }
      return styleObject;
    },

    /**
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @param {Object} style
     * @private
     */
    _setStyleDeclaration: function(lineIndex, charIndex, style) {
      this.styles[lineIndex][charIndex] = style;
    },

    /**
     *
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @private
     */
    _deleteStyleDeclaration: function(lineIndex, charIndex) {
      delete this.styles[lineIndex][charIndex];
    },

    /**
     * @param {Number} lineIndex
     * @return {Boolean} if the line exists or not
     * @private
     */
    _getLineStyle: function(lineIndex) {
      return !!this.styles[lineIndex];
    },

    /**
     * Set the line style to an empty object so that is initialized
     * @param {Number} lineIndex
     * @private
     */
    _setLineStyle: function(lineIndex) {
      this.styles[lineIndex] = {};
    },

    /**
     * @param {Number} lineIndex
     * @private
     */
    _deleteLineStyle: function(lineIndex) {
      delete this.styles[lineIndex];
    }
  });
})();
(function() {

  var controlsUtils = fabric.controlsUtils,
      scaleSkewStyleHandler = controlsUtils.scaleSkewCursorStyleHandler,
      scaleStyleHandler = controlsUtils.scaleCursorStyleHandler,
      scalingEqually = controlsUtils.scalingEqually,
      scalingYOrSkewingX = controlsUtils.scalingYOrSkewingX,
      scalingXOrSkewingY = controlsUtils.scalingXOrSkewingY,
      scaleOrSkewActionName = controlsUtils.scaleOrSkewActionName,
      objectControls = fabric.Object.prototype.controls;

  objectControls.ml = new fabric.Control({
    x: -0.5,
    y: 0,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.mr = new fabric.Control({
    x: 0.5,
    y: 0,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.mb = new fabric.Control({
    x: 0,
    y: 0.5,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.mt = new fabric.Control({
    x: 0,
    y: -0.5,
    cursorStyleHandler: scaleSkewStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  });

  objectControls.tl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.tr = new fabric.Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.bl = new fabric.Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.br = new fabric.Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleStyleHandler,
    actionHandler: scalingEqually
  });

  objectControls.mtr = new fabric.Control({
    x: 0,
    y: -0.5,
    actionHandler: controlsUtils.rotationWithSnapping,
    cursorStyleHandler: controlsUtils.rotationStyleHandler,
    offsetY: -40,
    withConnection: true,
    actionName: 'rotate',
  });

  if (fabric.Textbox) {
    // this is breaking the prototype inheritance, no time / ideas to fix it.
    // is important to document that if you want to have all objects to have a
    // specific custom control, you have to add it to Object prototype and to Textbox
    // prototype. The controls are shared as references. So changes to control `tr`
    // can still apply to all objects if needed.
    var textBoxControls = fabric.Textbox.prototype.controls = { };

    textBoxControls.mtr = objectControls.mtr;
    textBoxControls.tr = objectControls.tr;
    textBoxControls.br = objectControls.br;
    textBoxControls.tl = objectControls.tl;
    textBoxControls.bl = objectControls.bl;
    textBoxControls.mt = objectControls.mt;
    textBoxControls.mb = objectControls.mb;

    textBoxControls.mr = new fabric.Control({
      x: 0.5,
      y: 0,
      actionHandler: controlsUtils.changeWidth,
      cursorStyleHandler: scaleSkewStyleHandler,
      actionName: 'resizing',
    });

    textBoxControls.ml = new fabric.Control({
      x: -0.5,
      y: 0,
      actionHandler: controlsUtils.changeWidth,
      cursorStyleHandler: scaleSkewStyleHandler,
      actionName: 'resizing',
    });
  }
})();
(function () {
  /** ERASER_START */

  /**
   * add `eraser` to enlivened props
   */
  fabric.Object.ENLIVEN_PROPS.push('eraser');

  var __drawClipPath = fabric.Object.prototype._drawClipPath;
  var _needsItsOwnCache = fabric.Object.prototype.needsItsOwnCache;
  var _toObject = fabric.Object.prototype.toObject;
  var _getSvgCommons = fabric.Object.prototype.getSvgCommons;
  var __createBaseClipPathSVGMarkup = fabric.Object.prototype._createBaseClipPathSVGMarkup;
  var __createBaseSVGMarkup = fabric.Object.prototype._createBaseSVGMarkup;

  fabric.Object.prototype.cacheProperties.push('eraser');
  fabric.Object.prototype.stateProperties.push('eraser');

  /**
   * @fires erasing:end
   */
  fabric.util.object.extend(fabric.Object.prototype, {
    /**
     * Indicates whether this object can be erased by {@link fabric.EraserBrush}
     * The `deep` option introduces fine grained control over a group's `erasable` property.
     * When set to `deep` the eraser will erase nested objects if they are erasable, leaving the group and the other objects untouched.
     * When set to `true` the eraser will erase the entire group. Once the group changes the eraser is propagated to its children for proper functionality.
     * When set to `false` the eraser will leave all objects including the group untouched.
     * @tutorial {@link http://fabricjs.com/erasing#erasable_property}
     * @type boolean | 'deep'
     * @default true
     */
    erasable: true,

    /**
     * @tutorial {@link http://fabricjs.com/erasing#eraser}
     * @type fabric.Eraser
     */
    eraser: undefined,

    /**
     * @override
     * @returns Boolean
     */
    needsItsOwnCache: function () {
      return _needsItsOwnCache.call(this) || !!this.eraser;
    },

    /**
     * draw eraser above clip path
     * @override
     * @private
     * @param {CanvasRenderingContext2D} ctx
     * @param {fabric.Object} clipPath
     */
    _drawClipPath: function (ctx, clipPath) {
      __drawClipPath.call(this, ctx, clipPath);
      if (this.eraser) {
        //  update eraser size to match instance
        var size = this._getNonTransformedDimensions();
        this.eraser.isType('eraser') && this.eraser.set({
          width: size.x,
          height: size.y
        });
        __drawClipPath.call(this, ctx, this.eraser);
      }
    },

    /**
     * Returns an object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toObject: function (propertiesToInclude) {
      var object = _toObject.call(this, ['erasable'].concat(propertiesToInclude));
      if (this.eraser && !this.eraser.excludeFromExport) {
        object.eraser = this.eraser.toObject(propertiesToInclude);
      }
      return object;
    },

    
  });

  var __restoreObjectsState = fabric.Group.prototype._restoreObjectsState;
  fabric.util.object.extend(fabric.Group.prototype, {
    /**
     * @private
     * @param {fabric.Path} path
     */
    _addEraserPathToObjects: function (path) {
      this._objects.forEach(function (object) {
        fabric.EraserBrush.prototype._addPathToObjectEraser.call(
          fabric.EraserBrush.prototype,
          object,
          path
        );
      });
    },

    /**
     * Applies the group's eraser to its objects
     * @tutorial {@link http://fabricjs.com/erasing#erasable_property}
     */
    applyEraserToObjects: function () {
      var _this = this, eraser = this.eraser;
      if (eraser) {
        delete this.eraser;
        var transform = _this.calcTransformMatrix();
        eraser.clone(function (eraser) {
          var clipPath = _this.clipPath;
          eraser.getObjects('path')
            .forEach(function (path) {
              //  first we transform the path from the group's coordinate system to the canvas'
              var originalTransform = fabric.util.multiplyTransformMatrices(
                transform,
                path.calcTransformMatrix()
              );
              fabric.util.applyTransformToObject(path, originalTransform);
              if (clipPath) {
                clipPath.clone(function (_clipPath) {
                  var eraserPath = fabric.EraserBrush.prototype.applyClipPathToPath.call(
                    fabric.EraserBrush.prototype,
                    path,
                    _clipPath,
                    transform
                  );
                  _this._addEraserPathToObjects(eraserPath);
                }, ['absolutePositioned', 'inverted']);
              }
              else {
                _this._addEraserPathToObjects(path);
              }
            });
        });
      }
    },

    /**
     * Propagate the group's eraser to its objects, crucial for proper functionality of the eraser within the group and nested objects.
     * @private
     */
    _restoreObjectsState: function () {
      this.erasable === true && this.applyEraserToObjects();
      return __restoreObjectsState.call(this);
    }
  });

  /**
   * An object's Eraser
   * @private
   * @class fabric.Eraser
   * @extends fabric.Group
   * @memberof fabric
   */
  fabric.Eraser = fabric.util.createClass(fabric.Group, {
    /**
     * @readonly
     * @static
     */
    type: 'eraser',

    /**
     * @default
     */
    originX: 'center',

    /**
     * @default
     */
    originY: 'center',

    drawObject: function (ctx) {
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
      this.callSuper('drawObject', ctx);
    },

    /**
     * eraser should retain size
     * dimensions should not change when paths are added or removed
     * handled by {@link fabric.Object#_drawClipPath}
     * @override
     * @private
     */
    _getBounds: function () {
      //  noop
    },

    
  });

  /**
   * Returns {@link fabric.Eraser} instance from an object representation
   * @static
   * @memberOf fabric.Eraser
   * @param {Object} object Object to create an Eraser from
   * @param {Function} [callback] Callback to invoke when an eraser instance is created
   */
  fabric.Eraser.fromObject = function (object, callback) {
    var objects = object.objects;
    fabric.util.enlivenObjects(objects, function (enlivenedObjects) {
      var options = fabric.util.object.clone(object, true);
      delete options.objects;
      fabric.util.enlivenObjectEnlivables(object, options, function () {
        callback && callback(new fabric.Eraser(enlivenedObjects, options, true));
      });
    });
  };

  var __renderOverlay = fabric.Canvas.prototype._renderOverlay;
  /**
   * @fires erasing:start
   * @fires erasing:end
   */
  fabric.util.object.extend(fabric.Canvas.prototype, {
    /**
     * Used by {@link #renderAll}
     * @returns boolean
     */
    isErasing: function () {
      return (
        this.isDrawingMode &&
        this.freeDrawingBrush &&
        this.freeDrawingBrush.type === 'eraser' &&
        this.freeDrawingBrush._isErasing
      );
    },

    /**
     * While erasing the brush clips out the erasing path from canvas
     * so we need to render it on top of canvas every render
     * @param {CanvasRenderingContext2D} ctx
     */
    _renderOverlay: function (ctx) {
      __renderOverlay.call(this, ctx);
      if (this.isErasing() && !this.freeDrawingBrush.inverted) {
        this.freeDrawingBrush._render();
      }
    }
  });

  /**
   * EraserBrush class
   * Supports selective erasing meaning that only erasable objects are affected by the eraser brush.
   * Supports **inverted** erasing meaning that the brush can "undo" erasing.
   *
   * In order to support selective erasing, the brush clips the entire canvas
   * and then draws all non-erasable objects over the erased path using a pattern brush so to speak (masking).
   * If brush is **inverted** there is no need to clip canvas. The brush draws all erasable objects without their eraser.
   * This achieves the desired effect of seeming to erase or unerase only erasable objects.
   * After erasing is done the created path is added to all intersected objects' `eraser` property.
   *
   * In order to update the EraserBrush call `preparePattern`.
   * It may come in handy when canvas changes during erasing (i.e animations) and you want the eraser to reflect the changes.
   *
   * @tutorial {@link http://fabricjs.com/erasing}
   * @class fabric.EraserBrush
   * @extends fabric.PencilBrush
   * @memberof fabric
   */
  fabric.EraserBrush = fabric.util.createClass(
    fabric.PencilBrush,
    /** @lends fabric.EraserBrush.prototype */ {
      type: 'eraser',

      /**
       * When set to `true` the brush will create a visual effect of undoing erasing
       */
      inverted: false,

      /**
       * @private
       */
      _isErasing: false,

      /**
       *
       * @private
       * @param {fabric.Object} object
       * @returns boolean
       */
      _isErasable: function (object) {
        return object.erasable !== false;
      },

      /**
       * @private
       * This is designed to support erasing a collection with both erasable and non-erasable objects.
       * Iterates over collections to allow nested selective erasing.
       * Prepares the pattern brush that will draw on the top context to achieve the desired visual effect.
       * If brush is **NOT** inverted render all non-erasable objects.
       * If brush is inverted render all erasable objects that have been erased with their clip path inverted.
       * This will render the erased parts as if they were not erased.
       *
       * @param {fabric.Collection} collection
       * @param {CanvasRenderingContext2D} ctx
       * @param {{ visibility: fabric.Object[], eraser: fabric.Object[], collection: fabric.Object[] }} restorationContext
       */
      _prepareCollectionTraversal: function (collection, ctx, restorationContext) {
        collection.forEachObject(function (obj) {
          if (obj.forEachObject && obj.erasable === 'deep') {
            //  traverse
            this._prepareCollectionTraversal(obj, ctx, restorationContext);
          }
          else if (!this.inverted && obj.erasable && obj.visible) {
            //  render only non-erasable objects
            obj.visible = false;
            collection.dirty = true;
            restorationContext.visibility.push(obj);
            restorationContext.collection.push(collection);
          }
          else if (this.inverted && obj.visible) {
            //  render only erasable objects that were erased
            if (obj.erasable && obj.eraser) {
              obj.eraser.inverted = true;
              obj.dirty = true;
              collection.dirty = true;
              restorationContext.eraser.push(obj);
              restorationContext.collection.push(collection);
            }
            else {
              obj.visible = false;
              collection.dirty = true;
              restorationContext.visibility.push(obj);
              restorationContext.collection.push(collection);
            }
          }
        }, this);
      },

      /**
       * Prepare the pattern for the erasing brush
       * This pattern will be drawn on the top context, achieving a visual effect of erasing only erasable objects
       * @todo decide how overlay color should behave when `inverted === true`, currently draws over it which is undesirable
       * @private
       */
      preparePattern: function () {
        if (!this._patternCanvas) {
          this._patternCanvas = fabric.util.createCanvasElement();
        }
        var canvas = this._patternCanvas;
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        var patternCtx = canvas.getContext('2d');
        if (this.canvas._isRetinaScaling()) {
          var retinaScaling = this.canvas.getRetinaScaling();
          this.canvas.__initRetinaScaling(retinaScaling, canvas, patternCtx);
        }
        var backgroundImage = this.canvas.backgroundImage,
            bgErasable = backgroundImage && this._isErasable(backgroundImage),
            overlayImage = this.canvas.overlayImage,
            overlayErasable = overlayImage && this._isErasable(overlayImage);
        if (!this.inverted && ((backgroundImage && !bgErasable) || !!this.canvas.backgroundColor)) {
          if (bgErasable) { this.canvas.backgroundImage = undefined; }
          this.canvas._renderBackground(patternCtx);
          if (bgErasable) { this.canvas.backgroundImage = backgroundImage; }
        }
        else if (this.inverted && (backgroundImage && bgErasable)) {
          var color = this.canvas.backgroundColor;
          this.canvas.backgroundColor = undefined;
          this.canvas._renderBackground(patternCtx);
          this.canvas.backgroundColor = color;
        }
        patternCtx.save();
        patternCtx.transform.apply(patternCtx, this.canvas.viewportTransform);
        var restorationContext = { visibility: [], eraser: [], collection: [] };
        this._prepareCollectionTraversal(this.canvas, patternCtx, restorationContext);
        this.canvas._renderObjects(patternCtx, this.canvas._objects);
        restorationContext.visibility.forEach(function (obj) { obj.visible = true; });
        restorationContext.eraser.forEach(function (obj) {
          obj.eraser.inverted = false;
          obj.dirty = true;
        });
        restorationContext.collection.forEach(function (obj) { obj.dirty = true; });
        patternCtx.restore();
        if (!this.inverted && ((overlayImage && !overlayErasable) || !!this.canvas.overlayColor)) {
          if (overlayErasable) { this.canvas.overlayImage = undefined; }
          __renderOverlay.call(this.canvas, patternCtx);
          if (overlayErasable) { this.canvas.overlayImage = overlayImage; }
        }
        else if (this.inverted && (overlayImage && overlayErasable)) {
          var color = this.canvas.overlayColor;
          this.canvas.overlayColor = undefined;
          __renderOverlay.call(this.canvas, patternCtx);
          this.canvas.overlayColor = color;
        }
      },

      /**
       * Sets brush styles
       * @private
       * @param {CanvasRenderingContext2D} ctx
       */
      _setBrushStyles: function (ctx) {
        this.callSuper('_setBrushStyles', ctx);
        ctx.strokeStyle = 'black';
      },

      /**
       * **Customiztion**
       *
       * if you need the eraser to update on each render (i.e animating during erasing) override this method by **adding** the following (performance may suffer):
       * @example
       * ```
       * if(ctx === this.canvas.contextTop) {
       *  this.preparePattern();
       * }
       * ```
       *
       * @override fabric.BaseBrush#_saveAndTransform
       * @param {CanvasRenderingContext2D} ctx
       */
      _saveAndTransform: function (ctx) {
        this.callSuper('_saveAndTransform', ctx);
        this._setBrushStyles(ctx);
        ctx.globalCompositeOperation = ctx === this.canvas.getContext() ? 'destination-out' : 'source-over';
      },

      /**
       * We indicate {@link fabric.PencilBrush} to repaint itself if necessary
       * @returns
       */
      needsFullRender: function () {
        return true;
      },

      /**
       *
       * @param {fabric.Point} pointer
       * @param {fabric.IEvent} options
       * @returns
       */
      onMouseDown: function (pointer, options) {
        if (!this.canvas._isMainEvent(options.e)) {
          return;
        }
        this._prepareForDrawing(pointer);
        // capture coordinates immediately
        // this allows to draw dots (when movement never occurs)
        this._captureDrawingPath(pointer);

        //  prepare for erasing
        this.preparePattern();
        this._isErasing = true;
        this.canvas.fire('erasing:start');
        this._render();
      },

      /**
       * Rendering Logic:
       * 1. Use brush to clip canvas by rendering it on top of canvas (unnecessary if `inverted === true`)
       * 2. Render brush with canvas pattern on top context
       *
       */
      _render: function () {
        var ctx;
        if (!this.inverted) {
          //  clip canvas
          ctx = this.canvas.getContext();
          this.callSuper('_render', ctx);
        }
        //  render brush and mask it with image of non erasables
        ctx = this.canvas.contextTop;
        this.canvas.clearContext(ctx);
        this.callSuper('_render', ctx);
        ctx.save();
        var t = this.canvas.getRetinaScaling(), s = 1 / t;
        ctx.scale(s, s);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(this._patternCanvas, 0, 0);
        ctx.restore();
      },

      /**
       * Creates fabric.Path object
       * @override
       * @private
       * @param {(string|number)[][]} pathData Path data
       * @return {fabric.Path} Path to add on canvas
       * @returns
       */
      createPath: function (pathData) {
        var path = this.callSuper('createPath', pathData);
        path.globalCompositeOperation = this.inverted ? 'source-over' : 'destination-out';
        path.stroke = this.inverted ? 'white' : 'black';
        return path;
      },

      /**
       * Utility to apply a clip path to a path.
       * Used to preserve clipping on eraser paths in nested objects.
       * Called when a group has a clip path that should be applied to the path before applying erasing on the group's objects.
       * @param {fabric.Path} path The eraser path in canvas coordinate plane
       * @param {fabric.Object} clipPath The clipPath to apply to the path
       * @param {number[]} clipPathContainerTransformMatrix The transform matrix of the object that the clip path belongs to
       * @returns {fabric.Path} path with clip path
       */
      applyClipPathToPath: function (path, clipPath, clipPathContainerTransformMatrix) {
        var pathInvTransform = fabric.util.invertTransform(path.calcTransformMatrix()),
            clipPathTransform = clipPath.calcTransformMatrix(),
            transform = clipPath.absolutePositioned ?
              pathInvTransform :
              fabric.util.multiplyTransformMatrices(
                pathInvTransform,
                clipPathContainerTransformMatrix
              );
        //  when passing down a clip path it becomes relative to the parent
        //  so we transform it acoordingly and set `absolutePositioned` to false
        clipPath.absolutePositioned = false;
        fabric.util.applyTransformToObject(
          clipPath,
          fabric.util.multiplyTransformMatrices(
            transform,
            clipPathTransform
          )
        );
        //  We need to clip `path` with both `clipPath` and it's own clip path if existing (`path.clipPath`)
        //  so in turn `path` erases an object only where it overlaps with all it's clip paths, regardless of how many there are.
        //  this is done because both clip paths may have nested clip paths of their own (this method walks down a collection => this may reccur),
        //  so we can't assign one to the other's clip path property.
        path.clipPath = path.clipPath ? fabric.util.mergeClipPaths(clipPath, path.clipPath) : clipPath;
        return path;
      },

      /**
       * Utility to apply a clip path to a path.
       * Used to preserve clipping on eraser paths in nested objects.
       * Called when a group has a clip path that should be applied to the path before applying erasing on the group's objects.
       * @param {fabric.Path} path The eraser path
       * @param {fabric.Object} object The clipPath to apply to path belongs to object
       * @param {Function} callback Callback to be invoked with the cloned path after applying the clip path
       */
      clonePathWithClipPath: function (path, object, callback) {
        var objTransform = object.calcTransformMatrix();
        var clipPath = object.clipPath;
        var _this = this;
        path.clone(function (_path) {
          clipPath.clone(function (_clipPath) {
            callback(_this.applyClipPathToPath(_path, _clipPath, objTransform));
          }, ['absolutePositioned', 'inverted']);
        });
      },

      /**
       * Adds path to object's eraser, walks down object's descendants if necessary
       *
       * @fires erasing:end on object
       * @param {fabric.Object} obj
       * @param {fabric.Path} path
       */
      _addPathToObjectEraser: function (obj, path) {
        var _this = this;
        //  object is collection, i.e group
        if (obj.forEachObject && obj.erasable === 'deep') {
          var targets = obj._objects.filter(function (_obj) {
            return _obj.erasable;
          });
          if (targets.length > 0 && obj.clipPath) {
            this.clonePathWithClipPath(path, obj, function (_path) {
              targets.forEach(function (_obj) {
                _this._addPathToObjectEraser(_obj, _path);
              });
            });
          }
          else if (targets.length > 0) {
            targets.forEach(function (_obj) {
              _this._addPathToObjectEraser(_obj, path);
            });
          }
          return;
        }
        //  prepare eraser
        var eraser = obj.eraser;
        if (!eraser) {
          eraser = new fabric.Eraser();
          obj.eraser = eraser;
        }
        //  clone and add path
        path.clone(function (path) {
          // http://fabricjs.com/using-transformations
          var desiredTransform = fabric.util.multiplyTransformMatrices(
            fabric.util.invertTransform(
              obj.calcTransformMatrix()
            ),
            path.calcTransformMatrix()
          );
          fabric.util.applyTransformToObject(path, desiredTransform);
          eraser.addWithUpdate(path);
          obj.set('dirty', true);
          obj.fire('erasing:end', {
            path: path
          });
          if (obj.group && Array.isArray(_this.__subTargets)) {
            _this.__subTargets.push(obj);
          }
        });
      },

      /**
       * Add the eraser path to canvas drawables' clip paths
       *
       * @param {fabric.Canvas} source
       * @param {fabric.Canvas} path
       * @returns {Object} canvas drawables that were erased by the path
       */
      applyEraserToCanvas: function (path) {
        var canvas = this.canvas;
        var drawables = {};
        [
          'backgroundImage',
          'overlayImage',
        ].forEach(function (prop) {
          var drawable = canvas[prop];
          if (drawable && drawable.erasable) {
            this._addPathToObjectEraser(drawable, path);
            drawables[prop] = drawable;
          }
        }, this);
        return drawables;
      },

      /**
       * On mouseup after drawing the path on contextTop canvas
       * we use the points captured to create an new fabric path object
       * and add it to every intersected erasable object.
       */
      _finalizeAndAddPath: function () {
        var ctx = this.canvas.contextTop, canvas = this.canvas;
        ctx.closePath();
        if (this.decimate) {
          this._points = this.decimatePoints(this._points, this.decimate);
        }

        // clear
        canvas.clearContext(canvas.contextTop);
        this._isErasing = false;

        var pathData = this._points && this._points.length > 1 ?
          this.convertPointsToSVGPath(this._points) :
          null;
        if (!pathData || this._isEmptySVGPath(pathData)) {
          canvas.fire('erasing:end');
          // do not create 0 width/height paths, as they are
          // rendered inconsistently across browsers
          // Firefox 4, for example, renders a dot,
          // whereas Chrome 10 renders nothing
          canvas.requestRenderAll();
          return;
        }

        var path = this.createPath(pathData);
        //  needed for `intersectsWithObject`
        path.setCoords();
        //  commense event sequence
        canvas.fire('before:path:created', { path: path });

        // finalize erasing
        var drawables = this.applyEraserToCanvas(path);
        var _this = this;
        this.__subTargets = [];
        var targets = [];
        canvas.forEachObject(function (obj) {
          if (obj.erasable && obj.intersectsWithObject(path, true, true)) {
            _this._addPathToObjectEraser(obj, path);
            targets.push(obj);
          }
        });
        //  fire erasing:end
        canvas.fire('erasing:end', {
          path: path,
          targets: targets,
          subTargets: this.__subTargets,
          drawables: drawables
        });
        delete this.__subTargets;

        canvas.requestRenderAll();
        this._resetShadow();

        // fire event 'path' created
        canvas.fire('path:created', { path: path });
      }
    }
  );

  /** ERASER_END */
})();
