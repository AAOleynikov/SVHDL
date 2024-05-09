import "d3";
import "@fortawesome/free-solid-svg-icons";
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports", "d3", "@fortawesome/free-solid-svg-icons"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      factory(
        (global.d3 = global.d3 || {}),
        global.d3,
        global["free-solid-svg-icons"]
      ));
})(this, function (exports, d3, freeSolidSvgIcons) {
  "use strict";

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== "default") {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(
            n,
            k,
            d.get
              ? d
              : {
                  enumerable: true,
                  get: function () {
                    return e[k];
                  },
                }
          );
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var d3__namespace = /*#__PURE__*/ _interopNamespaceDefault(d3);

  class RowRendererBase {
    constructor(waveGraph) {
      this.waveGraph = waveGraph;
      this.FORMATTERS = {};
      this.DEFAULT_FORMAT = undefined;
    }
    /*eslint no-unused-vars: ["error", { "args": "none" }]*/
    select(typeInfo) {
      throw new Error("Should be overriden in class implementation");
    }
    render(parent, data, typeInfo, formatter) {
      var waveRowHeight = this.waveGraph.sizes.row.height;
      // var waveRowYpadding = this.waveGraph.sizes.row.ypadding;
      var waveRowX = this.waveGraph.waveRowX;
      if (!waveRowX)
        throw new Error("waveRowX on waveGraph must be initialized");
      parent
        .selectAll(".value-background")
        .remove()
        .exit()
        .data([typeInfo])
        .enter()
        .append("rect")
        .attr("class", "value-background")
        .attr("x", -2)
        .attr("width", this.waveGraph.sizes.width)
        .attr("height", waveRowHeight + 4)
        .classed("selected", (d) => !!d.isSelected);
    }
  }

  const NUM_FORMATS = {
    b: 2,
    o: 8,
    d: 10,
    x: 16,
  };
  function genFormatter(newBase) {
    return function (d) {
      if (typeof d === "number") return d.toString(newBase);
      if (d === "X") return d;
      let baseChar = d[0];
      d = d.substring(1);
      let base = NUM_FORMATS[baseChar];
      if (base === newBase) {
        return d;
      }
      d = d.toUpperCase();
      let containsX = d.indexOf("X") >= 0;
      if (containsX && newBase === 10) {
        return "X";
      }
      let origD = d;
      if (containsX) {
        d = d.replace(/X/g, "0");
      }
      let num = BigInt("0" + baseChar + d).toString(newBase);
      if (newBase === 2) {
        newBase = 1;
      }
      if (base === 2) {
        base = 1;
      }
      if (containsX) {
        let _num = [];
        for (let i = 0; i < num.length; i++) {
          _num.push(num[i]);
        }
        // set digits which are not valid to X
        if (base < newBase) {
          // e.g. bin -> hex
          let digitRatio = newBase / base;
          for (let i = 0; i < num.length; i++) {
            let offset = i * digitRatio;
            for (var i2 = 0; i2 < digitRatio; i2++) {
              if (origD[offset + i2] === "X") {
                // invalidate corresponding digit if there was a X in original value
                _num[i] = "X";
                break;
              }
            }
          }
        } else {
          // e.g. hex -> bin
          let digitRatio = base / newBase;
          for (let i = 0; i < origD.length; i++) {
            if (origD[i] === "X") {
              let end = i * digitRatio;
              // invalidate all corresponding digits if there was a X in original value
              for (let i2 = i * digitRatio; i2 < end; i2++) {
                _num[i2] = "X";
              }
            }
          }
        }
        num = _num.join("");
      }
      return num;
    };
  }
  function genVectorFormatter(newBase) {
    var itemFormat = genFormatter(newBase);
    return function (d) {
      if (typeof d === "string") return itemFormat(d);
      // @param d: [[index list], value]
      var buff = [];
      var indexes = d[0];
      indexes.forEach(function (i) {
        buff.push("[");
        buff.push(i);
        buff.push("]");
      });
      buff.push("=");
      buff.push(itemFormat(d[1]));
      return buff.join("");
    };
  }
  const SCALAR_FORMAT = {
    UINT_BIN: genFormatter(2),
    UINT_OCT: genFormatter(8),
    UINT_DEC: genFormatter(10),
    UINT_HEX: genFormatter(16),
  };
  const VECTOR_FORMAT = {
    UINT_BIN: genVectorFormatter(2),
    UINT_OCT: genVectorFormatter(8),
    UINT_DEC: genVectorFormatter(10),
    UINT_HEX: genVectorFormatter(16),
  };

  /**
   * A renderer for bit vector value rows.
   * Value is supposed to be a number or based string without leading 0 (eg. "x10" instead of "0x10" )
   */
  class RowRendererBits extends RowRendererBase {
    constructor(waveGraph) {
      super(waveGraph);
      this.FORMATTERS = SCALAR_FORMAT;
      this.DEFAULT_FORMAT = SCALAR_FORMAT.UINT_HEX;
    }
    select(typeInfo) {
      return typeInfo.name === "wire" && typeInfo.width > 1;
    }
    isValid(d) {
      return d[1].indexOf("X") < 0;
    }
    /*eslint no-unused-vars: ["error", { "args": "none" }]*/
    render(parent, data, typeInfo, formatter) {
      super.render(parent, data, typeInfo, formatter);
      var waveRowHeight = this.waveGraph.sizes.row.height;
      var waveRowYpadding = this.waveGraph.sizes.row.ypadding;
      var waveRowX = this.waveGraph.waveRowX;
      if (!waveRowX)
        throw new Error("waveRowX on waveGraph must be initialized");
      if (!formatter || typeof formatter === "string")
        throw new Error("Unsupported formater");
      var rect = parent.selectAll("g .value-rect").remove().exit().data(data);
      var newRects = rect.enter().append("g");
      var renderer = this;
      newRects
        .attr("transform", function (d) {
          if (!waveRowX)
            throw new Error("waveRowX on waveGraph must be initialized");
          var t = waveRowX(d[0]);
          return "translate(" + [t, 0] + ")";
        })
        .attr("class", function (d) {
          if (renderer.isValid(d)) {
            return "value-rect value-rect-valid";
          }
          return "value-rect value-rect-invalid";
        });
      var x0 = waveRowX.domain()[0];
      // can not use index from d function because it is always 0
      newRects.append("path").attr("d", function (d) {
        var duration = d[2];
        if (!waveRowX)
          throw new Error("waveRowX on waveGraph must be initialized");
        var right = waveRowX(x0 + duration);
        var top = waveRowHeight;
        if (right < 0) {
          throw new Error(`${right}, ${d}`);
        }
        //  <==> like shape
        var edgeW = 2;
        return (
          "M " +
          [0, top / 2] +
          " L " +
          [edgeW, top] +
          " L " +
          [right - edgeW, top] +
          " L " +
          [right, top / 2] +
          " L " +
          [right - edgeW, 0] +
          " L " +
          [edgeW, 0] +
          " Z"
        );
      });
      // can not use index from d function because it is always 0
      newRects
        .append("text")
        .attr("x", function (d) {
          var duration = d[2];
          if (!waveRowX)
            throw new Error("waveRowX on waveGraph must be initialized");
          var x = waveRowX(x0 + duration / 2);
          if (x < 0) {
            throw new Error(x.toString());
          }
          return x;
        })
        .attr("y", waveRowHeight / 2 + waveRowYpadding)
        .text(function (d) {
          let fontSizeStr = window.getComputedStyle(this).fontSize;
          let fontSize = NaN;
          if (fontSizeStr === "") {
            // default font size
            fontSize = 16;
          } else if (fontSizeStr.substr(fontSizeStr.length - 2) !== "px") {
            throw new Error(fontSizeStr);
          } else {
            fontSize = Number(fontSizeStr.substr(0, fontSizeStr.length - 2));
          }
          var formatedText = formatter(d[1]);
          var duration = d[2];
          if (!waveRowX)
            throw new Error("waveRowX on waveGraph must be initialized");
          var width = waveRowX(x0 + duration) - waveRowX(x0);
          if (width < 0) {
            throw new Error(`${x0}, ${duration}, ${width}`);
          }
          if (formatedText.length * fontSize > width) {
            var chars = Math.ceil(width / fontSize);
            return formatedText.substr(0, chars);
          }
          return formatedText;
        });
    }
  }

  const STRING_FORMAT = {
    STRING: (d) => d.toString(),
  };
  /**
   * A renderer for enum value rows, enum value is a string, "" is resolved as invalid value
   * and is rendered with red color
   */
  class RowRendererEnum extends RowRendererBits {
    constructor(waveGraph) {
      super(waveGraph);
      this.FORMATTERS = STRING_FORMAT;
      this.DEFAULT_FORMAT = STRING_FORMAT.STRING;
    }
    select(typeInfo) {
      return typeInfo.name === "enum";
    }
    isValid(d) {
      return d[1] !== "";
    }
  }

  /**
   * A renderer for a label which poses no data and it is only a form of separator between value rows
   */
  class RowRendererLabel extends RowRendererBase {
    select(typeInfo) {
      return typeInfo.name === "label";
    }
  }

  /**
   * Reneers nothig, it is used for hierarchical signals as a parent container.
   */
  class RowRendererStruct extends RowRendererBase {
    select(typeInfo) {
      return typeInfo.name === "struct";
    }
  }

  class SignalLabelManipulation {
    constructor(ROW_Y, signalList) {
      this.previouslyClicked = null;
      this.signalList = signalList;
      this.labels = null;
      this.ROW_Y = ROW_Y;
      this.dropLocator = null;
    }
    resolveInsertTarget(y) {
      var _a;
      let targetParentNode = null;
      let onParentI = 0;
      const nodes = this.signalList.visibleNodes();
      if (y < 0) {
        throw new Error();
      }
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        const isUpperHalfOfTheRow = y > n.y && y <= n.y + this.ROW_Y * 0.5;
        if (isUpperHalfOfTheRow && n.parent) {
          // position in upper half of the row
          // insert before n (parent is checked to exists)
          const siblings = n.parent.children;
          targetParentNode = n.parent;
          if (!siblings)
            throw new Error(
              "siblings must be specified because we are searching in siblings"
            );
          onParentI = siblings.indexOf(n);
          break;
        } else if (y <= n.y + this.ROW_Y) {
          // insert after
          // if n is hierarchical insert into
          if (n.children) {
            targetParentNode = n;
            onParentI = 0;
            break;
          } else {
            targetParentNode = n.parent;
            if (!targetParentNode)
              throw new Error(
                "Parent must be specified because we are searching in siblings"
              );
            const siblings = targetParentNode.children;
            if (!siblings)
              throw new Error(
                "siblings must be specified because we are searching in siblings"
              );
            onParentI = siblings.indexOf(n) + 1;
            break;
          }
        }
      }
      if (!targetParentNode) {
        targetParentNode = nodes[0];
        onParentI =
          ((_a = targetParentNode.children) === null || _a === void 0
            ? void 0
            : _a.length) || 0;
      }
      return [targetParentNode, onParentI];
    }
    // select and de-select all "g"
    // signal labels dragging, reordering
    dragStarted(ev, elm, d) {
      // move to front to make it virtually on top of all others
      elm.raise();
      // d = index of clicked signal
      var current = d;
      var currentlySelected = current.data.type.isSelected;
      var shiftKey = ev.sourceEvent.shiftKey;
      if (shiftKey && this.previouslyClicked) {
        // select all between last selected and clicked
        // de-select all
        if (this.signalList) {
          var prevId = this.previouslyClicked.id;
          this.signalList.visibleNodes().forEach(function (d) {
            const i = d.id;
            const curId = current.id;
            if (prevId < curId) {
              d.data.type.isSelected = prevId <= i && i <= curId;
            } else {
              d.data.type.isSelected = prevId >= i && i >= curId;
            }
          });
        }
        if (this.labels)
          this.labels.classed("selected", (d) => !!d.data.type.isSelected);
        return;
      }
      var altKey = ev.sourceEvent.altKey;
      if (!altKey) {
        if (this.signalList) {
          this.signalList.visibleNodes().forEach(function (d) {
            d.data.type.isSelected = false;
          });
        }
      }
      // toggle selection
      current.data.type.isSelected = !currentlySelected;
      if (this.labels) {
        this.labels.classed("selected", (d) => !!d.data.type.isSelected);
      }
    }
    /* take ale  */
    _getXYforItemOnIndex(parentItem, i) {
      var _a;
      const children = parentItem.children;
      if (!children || children.length == 0 || i == 0)
        return [parentItem.x, parentItem.y];
      else if (i < children.length) {
        const c = children[i];
        return [c.x, c.y];
      } else {
        if (i != children.length)
          throw new Error("Must be append or in children");
        let lastItem = children[children.length - 1];
        while (
          (_a = lastItem.children) === null || _a === void 0
            ? void 0
            : _a.length
        ) {
          lastItem = lastItem.children[lastItem.children.length - 1];
        }
        return [parentItem.x, (lastItem.y || 0) + this.ROW_Y];
      }
    }
    dragged(ev, elm, d) {
      const labelG = this.signalList.labelG;
      if (!labelG) throw new Error("labelG must be constructed before labels");
      let dropLocator = this.dropLocator;
      if (!dropLocator) {
        this.dropLocator = dropLocator = labelG.append("g");
        dropLocator.attr("class", "drop-locator");
        const rect = dropLocator.append("rect");
        rect
          .attr("height", 4)
          .attr("width", this.signalList.width || 10)
          .style("fill", "blue");
      }
      const [insParent, insIndex] = this.resolveInsertTarget(ev.y);
      let [insPointX, insPointY] = this._getXYforItemOnIndex(
        insParent ? insParent : this.signalList.root,
        insIndex || 0
      );
      dropLocator.attr("transform", `translate(${insPointX}, ${insPointY})`);
      elm.attr("transform", `translate(${d.x}, ${ev.y})`);
    }
    regenerateDepth(d) {
      var offset = d.depth;
      (d.children || []).forEach((d2) => {
        d2.depth = offset + 1;
        this.regenerateDepth(d2);
      });
    }
    dragEnded(ev, elm, d) {
      var _a;
      // move to front to make it virtually on top of all others
      elm.lower();
      let dropLocator = this.dropLocator;
      if (dropLocator) {
        dropLocator.remove();
        this.dropLocator = null;
      }
      const insertTarget = this.resolveInsertTarget(ev.y);
      const shiftKey = ev.sourceEvent.shiftKey;
      if (
        !(this.previouslyClicked != null && shiftKey) &&
        d.data.type.isSelected
      ) {
        this.previouslyClicked = d;
      } else {
        this.previouslyClicked = null;
      }
      // check if inserting to it self
      var newParent = insertTarget[0];
      var newIndex = insertTarget[1];
      var _newParent = newParent;
      var insertingToItself = false;
      while (_newParent) {
        if (_newParent === d) {
          insertingToItself = true;
          break;
        }
        _newParent = _newParent.parent;
      }
      if (
        !insertingToItself &&
        (newParent !== d.parent ||
          (d.parent &&
            d.parent.children &&
            newIndex !== d.parent.children.indexOf(d)))
      ) {
        // moving on new place
        elm.classed("selected", false);
        d.data.type.isSelected = false;
        // insert on new place (we do it first, because we do not want to break indexing)
        var oldSiblings =
          ((_a = d.parent) === null || _a === void 0 ? void 0 : _a.children) ||
          [];
        var oldIndex = oldSiblings.indexOf(d);
        var newSiblings = insertTarget[0].children || [];
        newSiblings.splice(newIndex, 0, d);
        // remove from original possition
        if (newSiblings === oldSiblings && newIndex < oldIndex) {
          oldIndex += 1;
        }
        oldSiblings.splice(oldIndex, 1);
        d.parent = insertTarget[0];
        d.depth = d.parent.depth + 1;
        this.regenerateDepth(d);
        if (this.signalList) {
          this.signalList.update();
        }
      } else {
        // put label back to it's original possition
        elm.attr("transform", `translate(${d.x}, ${d.y})`);
      }
    }
    registerDrag(labels) {
      var _this = this;
      this.labels = labels;
      labels.call(
        d3__namespace
          .drag()
          .on("start", function (ev, d) {
            return _this.dragStarted(ev, d3__namespace.select(this), d);
          })
          .on("drag", function (ev, d) {
            return _this.dragged(ev, d3__namespace.select(this), d);
          })
          .on("end", function (ev, d) {
            return _this.dragEnded(ev, d3__namespace.select(this), d);
          })
      );
    }
  }

  const TIME_UNITS = [
    [1, "ps"],
    [1000, "ns"],
    [1000000, "us"],
    [1000000000, "ms"],
    [1000000000000, "s"],
  ];
  function createTimeFormatter(divider, unitName) {
    return function (d, i) {
      var v = d / divider;
      if (Number.isInteger(v)) {
        return v + " " + unitName;
      }
      return v.toFixed(2) + " " + unitName;
    };
  }
  function createTimeFormatterForTimeRange(timeRange) {
    const _timeRange = timeRange[1] - timeRange[0];
    for (var i = 0; i < TIME_UNITS.length; i++) {
      var u = TIME_UNITS[i];
      if (_timeRange < 1000 * u[0] || i === TIME_UNITS.length - 1) {
        return createTimeFormatter(u[0], u[1]);
      }
    }
    throw new Error("Time out of range of defined units");
  }

  /**
   * @param compareFn: example (a, b) => { return a - b; }
   * @param boundaryCheckFn: a function used to check array boundaris
   *        before main alg, example:
   *        function (ar, el) {
   *           if (el < ar[0]) { return 0; }
   *           if (el > ar[ar.length - 1]) { return ar.length; }
   *           return -1;
   *        }
   */
  function binarySearch(ar, el, compareFn, boundaryCheckFn) {
    if (ar.length === 0) return -1;
    var res = boundaryCheckFn(ar, el);
    if (res >= 0) return res;
    var m = 0;
    var n = ar.length - 1;
    while (m <= n) {
      var k = (n + m) >> 1; // floor(n+m/2)
      var cmp = compareFn(el, ar[k]);
      if (cmp > 0) {
        m = k + 1;
      } else if (cmp < 0) {
        n = k - 1;
      } else {
        return k;
      }
    }
    return m - 1;
  }

  function filterDataByTime(data, rowRange) {
    // return list ([time, value, duration])
    var min = rowRange[0];
    if (min < 0) {
      throw new Error("min time has to be >= 0");
    }
    var max = rowRange[1];
    var _data = [];
    function boundaryCheckFn(ar, el) {
      if (el[0] < ar[0][0]) {
        return 0;
      }
      if (el[0] > ar[ar.length - 1][0]) {
        return ar.length;
      }
      return -1;
    }
    for (
      var i = binarySearch(
        data,
        [min, "", 0],
        (a, b) => {
          return a[0] - b[0];
        },
        boundaryCheckFn
      );
      i < data.length;
      i++
    ) {
      if (i < 0) break;
      var d = data[i];
      var t = d[0];
      if (t < min);
      else if (t <= max) {
        let prev = data[i - 1];
        if (_data.length === 0 && t !== min) {
          // first data, unaligned
          let prevVal;
          if (!prev) {
            prevVal = "bX";
          } else {
            prevVal = prev[1];
          }
          _data.push([min, prevVal, t - min]);
        }
        // normal data in range
        var next = data[i + 1];
        var nextTime;
        if (next) {
          nextTime = Math.min(max, next[0]);
        } else {
          nextTime = max;
        }
        _data.push([t, d[1], nextTime - t]);
      } else {
        if (_data.length === 0) {
          // selection range smaller than one data item
          let prev = data[i - 1];
          let prevVal;
          if (!prev) {
            prevVal = "bX";
          } else {
            prevVal = prev[1];
          }
          _data.push([min, prevVal, max - min]);
        }
        // after selected range
        break;
      }
    }
    if (_data.length === 0) {
      // no new data after selected range
      var last = data[data.length - 1];
      var lastVal;
      if (!last) {
        lastVal = "bX";
      } else {
        lastVal = last[1];
      }
      _data.push([min, lastVal, max - min]);
    }
    return _data;
  }

  class RowRendererBit extends RowRendererBase {
    select(typeInfo) {
      return typeInfo.name === "wire" && typeInfo.width === 1;
    }
    render(parent, data, typeInfo, formatter) {
      super.render(parent, data, typeInfo, formatter);
      var waveRowHeight = this.waveGraph.sizes.row.height;
      // var waveRowYpadding = this.waveGraph.sizes.row.ypadding;
      var waveRowX = this.waveGraph.waveRowX;
      var waveRowY = this.waveGraph.waveRowY;
      if (!waveRowX)
        throw new Error("waveRowX on waveGraph must be initialized");
      if (!waveRowY)
        throw new Error("waveRowY on waveGraph must be initialized");
      const linePoints = [];
      const invalidRanges = [];
      data.forEach(function (d) {
        let val = d[1];
        let valInt = NaN;
        if (typeof val === "string") {
          if (val.indexOf("X") >= 0) {
            invalidRanges.push(d);
            return;
          } else {
            valInt = Number.parseInt(val);
          }
        } else {
          valInt = val;
        }
        linePoints.push([d[0], valInt]);
        linePoints.push([d[0] + d[2], valInt]);
      });
      var line = d3__namespace
        .line()
        .x(function (d) {
          if (!waveRowX)
            throw new Error("waveRowX on waveGraph must be initialized");
          return waveRowX(d[0]);
        })
        .y(function (d) {
          if (!waveRowY)
            throw new Error("waveRowY on waveGraph must be initialized");
          return waveRowY(d[1]);
        })
        .curve(d3__namespace.curveStepAfter);
      // wave line
      parent.attr("clip-path", "url(#clip)");
      var lines = parent.selectAll("path").data([linePoints]);
      lines
        .enter()
        .append("path")
        .attr("class", "value-line")
        .merge(lines)
        .attr("d", line);
      // Add the scatterplot for invalid values
      parent
        .selectAll(".value-rect-invalid")
        .remove()
        .exit()
        .data(invalidRanges)
        .enter()
        .append("g")
        .attr("class", "value-rect-invalid")
        .append("rect")
        .attr("height", waveRowHeight)
        .attr("width", function (d) {
          if (!waveRowX)
            throw new Error("waveRowX on waveGraph must be initialized");
          return waveRowX(waveRowX.domain()[0] + d[2]);
        })
        .attr("x", function (d) {
          if (!waveRowX)
            throw new Error("waveRowX on waveGraph must be initialized");
          return waveRowX(d[0]);
        })
        .attr("y", function () {
          if (!waveRowY)
            throw new Error("waveRowY on waveGraph must be initialized");
          return waveRowY(1);
        });
    }
  }

  /**
   * A renderer for value rows with data of array type.
   * The record of data is of following format: [[<indexes>], <new value>]
   */
  class RowRendererArray extends RowRendererBits {
    constructor(waveGraph) {
      super(waveGraph);
      this.FORMATTERS = VECTOR_FORMAT;
      this.DEFAULT_FORMAT = VECTOR_FORMAT.UINT_HEX;
    }
    select(typeInfo) {
      return typeInfo.name === "array";
    }
    isValid(d) {
      if (typeof d === "string") return d.indexOf("X") < 0;
      else return d[1][1].indexOf("X") < 0;
    }
  }

  /**
   * Implementation of SVG based scrollbar component which has a histogram like columns which are showing the
   * depth of the items in signal list.
   */
  class Scrollbar {
    constructor(barHeight, _scrollbarG) {
      this.barHeight = barHeight;
      this.selectorWidth = 20;
      this._onDrag = null;
      this.scrollbarG = _scrollbarG;
      this.moverElm = null;
      this.width = 0;
      this.height = 0;
      this._isScrollDisplayed = false;
      this.flatenedData = [];
      this.maxDepth = -1;
      this._startPerc = 0.0;
    }
    onDrag(fn) {
      if (arguments.length) {
        this._onDrag = fn;
        return this;
      }
      return this._onDrag;
    }
    render() {
      if (this._isScrollDisplayed) {
        var numBars = Math.round(this.height / this.barHeight);
        var xOverview = d3__namespace
          .scaleLinear()
          .domain([0, this.maxDepth + 1])
          .range([0, this.selectorWidth]);
        var yOverview = d3__namespace
          .scaleLinear()
          .domain([0, this.flatenedData.length])
          .range([0, this.height]);
        var subBars = this.scrollbarG
          .selectAll(".subBar")
          .data(this.flatenedData);
        const _this = this;
        subBars.exit().remove();
        // small rectangles in scroll preview representing the values on that posssion
        subBars
          .enter()
          .append("rect")
          .classed("subBar", true)
          .merge(subBars)
          .attr("height", function () {
            return yOverview(1);
          })
          .attr("width", function (d) {
            return xOverview(d.depth + 1);
          })
          .attr("x", function () {
            return _this.width - _this.selectorWidth;
          })
          .attr("y", function (d, i) {
            return yOverview(i);
          });
        // dragable rect representing currently viewed window
        if (!this.moverElm) {
          this.moverElm = this.scrollbarG
            .selectAll(".mover")
            .data([null])
            .enter()
            .append("rect");
        }
        this.moverElm
          .classed("mover", true)
          .attr(
            "transform",
            "translate(" + (this.width - this.selectorWidth) + ",0)"
          )
          .attr("class", "mover")
          .attr("x", 0)
          .attr("y", this._startPerc * this.height)
          .attr(
            "height",
            Math.round((numBars / this.flatenedData.length) * this.height)
          )
          .attr("width", this.selectorWidth);
        this.moverElm.call(
          d3__namespace.drag().on("drag", function (ev) {
            var moverElm = d3__namespace.select(this);
            var y = parseInt(moverElm.attr("y"));
            var ny = y + ev.dy;
            var h = parseInt(moverElm.attr("height"));
            if (ny < 0 || ny + h > _this.height) {
              // out of range
              return;
            }
            moverElm.attr("y", ny);
            _this._startPerc = ny / _this.height;
            if (_this._onDrag) {
              _this._onDrag(_this._startPerc);
            }
          })
        );
      } else {
        this.moverElm = null;
        this.scrollbarG.selectAll("*").remove();
      }
    }
    registerWheel(elm) {
      const _this = this;
      elm.on("wheel", function (ev) {
        if (!_this.moverElm) return;
        var step = ev.deltaY > 0 ? 1 : -1;
        ev.preventDefault();
        ev.stopPropagation();
        var y = parseInt(_this.moverElm.attr("y"));
        var ny = Math.max(0, y + _this.barHeight * step);
        var h = parseInt(_this.moverElm.attr("height"));
        if (ny < 0 || ny + h > _this.height) {
          // out of range
          return;
        }
        _this.moverElm.attr("y", ny);
        _this._startPerc = ny / _this.height;
        if (_this._onDrag) {
          _this._onDrag(_this._startPerc);
        }
      });
      return this;
    }
    size(_width, _height) {
      this.width = _width;
      this.height = _height;
      if (!Number.isFinite(this.height)) {
        throw new Error("Can not resolve height of scrollbar");
      }
      if (!Number.isFinite(this.width)) {
        throw new Error("Can not resolve width of scrollbar");
      }
      this.isScrollDisplayed();
      if (this.scrollbarG) {
        // redraw on size change
        this.render();
      }
      if (this._onDrag) {
        this._onDrag(this._startPerc);
      }
      return this;
    }
    isScrollDisplayed() {
      if (this.flatenedData) {
        this._isScrollDisplayed =
          this.barHeight * this.flatenedData.length > this.height;
      }
      return this._isScrollDisplayed;
    }
    data(_flatenedData, _maxDepth) {
      this.flatenedData = _flatenedData;
      this.maxDepth = _maxDepth;
      this.isScrollDisplayed();
      if (this.scrollbarG) {
        // redraw on size change
        this.render();
      }
      return this;
    }
    startPerc() {
      return this._startPerc;
    }
  }

  /*
   * :ivar barHeight: Height of a single item in the list.
   * :ivar labelMoving: Object which is implementing moving of bars (drag&drop)
   * :ivar width: total width of a whole emement with a tree list
   * :ivar height: total height of a whole emement with a tree list
   * :ivar root: object whith hierarchical data which is displayed
   * :ivar rootElm: element where this element is placed
   * :ivar labelG: main SVG G
   *
   **/
  class TreeList {
    constructor(barHeight, contextMenu) {
      this.barHeight = barHeight;
      this.contextMenu = contextMenu;
      this.root = null;
      this.rootElm = null;
      this.labelG = null;
      this.scrollbarG = null;
      this.scroll = null;
      this.width = undefined;
      this.height = undefined;
      this._onChange = null;
      this.nodes = [];
      this.labelMoving = new SignalLabelManipulation(barHeight, this);
    }
    static getExpandCollapseIcon(d) {
      if (d.data.children || d.data._children) {
        var ico = freeSolidSvgIcons.faChevronRight;
        if (d.children != null) {
          ico = freeSolidSvgIcons.faChevronDown;
        }
        return ico.icon[4];
      }
      return "";
    }
    registerExpandHandler(elm) {
      var clickExpandCollapse = this.clickExpandCollapse.bind(this);
      elm
        .on("click", function (ev, d) {
          clickExpandCollapse(ev, d, this);
        })
        .on("mousedown", function (ev) {
          ev.stopPropagation();
        })
        .on("mouseup", function (ev) {
          ev.stopPropagation();
        });
      return elm;
    }
    clickExpandCollapse(ev, d, elm) {
      ev.stopPropagation();
      if (d.children || d._children) {
        if (d.children) {
          d._children = d.children;
          d.children = undefined;
        } else {
          d.children = d._children;
          d._children = undefined;
        }
        d3__namespace
          .select(elm.parentElement)
          .select("path")
          .attr("d", TreeList.getExpandCollapseIcon);
        this.update();
      }
    }
    resolveSelection() {
      // Compute the flattened node list.
      if (!this.root) {
        // no data
        return;
      }
      const barHeight = this.barHeight;
      const nodeTotalCnt = this.root.value;
      const scrollPerc = this.scroll ? this.scroll.startPerc() : 0;
      const start = Math.round(scrollPerc * nodeTotalCnt);
      const end = Math.min(start + this.height / barHeight, nodeTotalCnt);
      let index = -1;
      let i = 0;
      const nodes = this.nodes;
      nodes.splice(0, nodes.length); // clear
      this.root.eachBefore((n) => {
        if (i >= start && i <= end) {
          n.x = n.depth * 20;
          n.y = ++index * barHeight;
          nodes.push(n);
        }
        i++;
      });
    }
    draw(_rootElm) {
      this.rootElm = _rootElm;
      this.labelG = _rootElm.append("g");
      this.update();
      // construct scrollbar after main list in order to have in top
      this.scrollbarG = this.rootElm.append("g").attr("class", "scrollbar");
      this.scroll = new Scrollbar(this.barHeight, this.scrollbarG);
      this._bindScrollData();
      var update = this.update.bind(this);
      this.scroll.registerWheel(this.rootElm).onDrag(function (startPrec) {
        update();
      });
      this.scroll.size(this.width, this.height);
    }
    _setLabelWidth(_width) {
      var barHeight = this.barHeight;
      // udpate width on all labels
      if (this.labelG) {
        this.labelG.selectAll(".labelcell rect").attr("width", function (d) {
          return _width - d.depth * 20 - barHeight / 2;
        });
        this.labelG.selectAll(".labelcell").style("clip-path", function (d) {
          var width = _width - d.depth * 20 - barHeight / 2;
          return [
            "polygon(",
            0,
            "px ",
            0,
            "px, ",
            0,
            "px ",
            barHeight,
            "px, ",
            width,
            "px ",
            barHeight,
            "px, ",
            width,
            "px ",
            0,
            "px)",
          ].join("");
        });
      }
    }
    size(_width, _height) {
      if (!arguments.length) {
        return [this.width, this.height];
      }
      if (this.labelG && this.width !== _width) {
        this._setLabelWidth(_width);
      }
      this.width = _width;
      this.height = _height;
      if (this.scroll) {
        // also automatically renders also this list
        this.scroll.size(this.width, this.height);
      }
      return this;
    }
    _bindScrollData() {
      if (!this.root)
        throw new Error("this.root should be already initialized");
      if (this.scroll) {
        const flatenedData = [];
        let maxDepth = 0;
        this.root.eachBefore(function (d) {
          flatenedData.push(d);
          maxDepth = Math.max(maxDepth, d.depth);
        });
        this.scroll.data(flatenedData, maxDepth);
      }
    }
    data(_data) {
      this.root = d3__namespace.hierarchy(_data, function (d) {
        return d.children;
      });
      // Compute the flattened node list.
      this.root.sum(() => 1);
      var i = 0;
      this.root.eachBefore((n) => {
        n.id = i++;
      });
      this._bindScrollData();
      if (this.rootElm) {
        // update rendered
        if (this.labelG) this.labelG.selectAll(".labelcell").remove();
        this.update();
      } else {
        // update before rendering
        this.resolveSelection();
        if (this._onChange) {
          this._onChange(this.nodes);
        }
      }
      return this;
    }
    onChange(fn) {
      if (arguments.length) {
        this._onChange = fn;
        return this;
      }
      return this._onChange;
    }
    visibleNodes() {
      return this.nodes;
    }
    filter(predicate) {
      if (!this.root) return;
      function remove(d) {
        if (d.parent) {
          if (!d.parent.children) {
            throw new Error(
              "Parent must have children because we are searching it because of children"
            );
          }
          const index = d.parent.children.indexOf(d);
          if (index < 0) {
            throw new Error("Deleting something which is not there");
          }
          // remove an item from a children on parent
          d.parent.children.splice(index, 1);
        }
      }
      var updated = false;
      this.root.eachBefore(function (d) {
        if (!predicate(d.data)) {
          remove(d);
          updated = true;
        }
      });
      if (updated) {
        this.update();
      }
    }
    update() {
      this.resolveSelection();
      if (!this.labelG) return;
      // Update the nodes
      var node = this.labelG.selectAll(".labelcell").data(this.nodes, (d) => {
        var _a;
        return (_a = d.id) === null || _a === void 0 ? void 0 : _a.toString();
      });
      var nodeEnter = node
        .enter()
        .append("g")
        .classed("labelcell", true)
        // .attr("transform", () => "translate(" + source.y0 + "," + source.x0 + ")") // for transition
        .classed("selected", function (d) {
          return !!d.data.type.isSelected;
        });
      var barHeight = this.barHeight;
      // background rectangle for highlight
      nodeEnter
        .append("rect")
        .attr("height", barHeight)
        .attr("x", barHeight / 2)
        .attr("y", -0.5 * barHeight);
      // adding arrows
      nodeEnter
        .append("path")
        .attr(
          "transform",
          "translate(0," +
            -(barHeight / 2) +
            ")" +
            " scale(" +
            (barHeight / freeSolidSvgIcons.faChevronDown.icon[1]) * 0.5 +
            ")"
        )
        .attr("d", TreeList.getExpandCollapseIcon)
        .call(this.registerExpandHandler.bind(this));
      // background for expand arrow
      nodeEnter
        .append("rect")
        .classed("expandable", function (d) {
          return !!(d.data.children || d.data._children);
        })
        .attr("width", barHeight / 2)
        .attr("height", barHeight)
        .attr("transform", "translate(0," + -(barHeight / 2) + ")")
        .style("opacity", 0)
        .call(this.registerExpandHandler.bind(this));
      // adding file or folder names
      nodeEnter
        .append("text")
        .attr("dy", 3.5)
        .attr("dx", 15)
        .text((d) => d.data.name);
      nodeEnter
        .on("mouseover", function (event, d) {
          if (!this) return;
          d3__namespace.select(this).classed("highlight", true);
        })
        .on("mouseout", function (event, d) {
          nodeEnter.classed("highlight", false);
        });
      // Transition nodes to their new position.
      nodeEnter.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
      node.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
      node.exit().remove();
      const contextmenu = this.contextMenu.render.bind(this.contextMenu);
      nodeEnter.on("contextmenu", function (ev, d) {
        contextmenu(this, ev, d);
      });
      this._setLabelWidth(this.width);
      if (this._onChange) {
        this._onChange(this.nodes);
      }
      this.labelMoving.registerDrag(this.labelG.selectAll(".labelcell"));
    }
  }

  // http://bl.ocks.org/mccannf/1629464
  class DragBarVertical {
    constructor(parentGElm, size, range, init_pos) {
      this._onDrag = undefined;
      [this.xMin, this.xMax] = range;
      [this.x, this.y] = init_pos;
      this.dragBehavior = d3__namespace
        .drag()
        .on("drag", this._onDragDelegate.bind(this));
      this.dragHandle = parentGElm
        .append("rect")
        .data([this])
        .classed("dragbar-vertical", true)
        .attr("fill", "lightblue")
        .attr("fill-opacity", 0.5)
        .attr("cursor", "ew-resize")
        .call(this.dragBehavior);
      this._size = [size[0], size[1]];
      this.size(size[0], size[1]);
    }
    range(xMin, xMax) {
      if (arguments.length) {
        [this.xMin, this.xMax] = [xMin, xMax];
      } else {
        return [this.xMin, this.xMax];
      }
    }
    size(width, height) {
      if (arguments.length) {
        this._size = [width, height];
        if (width > 0 && height > 0) {
          this.dragHandle
            .attr("x", function (d) {
              return d.x - width / 2;
            })
            .attr("y", function (d) {
              return d.y;
            })
            .attr("height", height)
            .attr("width", width);
        }
      } else {
        return this._size;
      }
    }
    _onDragDelegate(ev, d) {
      var width = this._size[0];
      var dragx = Math.max(
        this.xMin + width / 2,
        Math.min(this.xMax, d.x + ev.dx + width / 2)
      );
      this.x = dragx - width / 2;
      this.dragHandle.attr("x", function (d) {
        return d.x;
      });
      if (this._onDrag) this._onDrag(this);
    }
    onDrag(_onDrag) {
      if (arguments.length) {
        this._onDrag = _onDrag;
        return this;
      } else {
        return this._onDrag;
      }
    }
  }

  // https://stackoverflow.com/questions/15181452/how-to-save-export-inline-svg-styled-with-css-from-browser-to-image-file
  function inlineStylesToSvgCopy(
    parentNode,
    origData,
    CONTAINER_ELEMENTS,
    RELEVANT_STYLES
  ) {
    if (parentNode.tagName in RELEVANT_STYLES) {
      var StyleDef = window.getComputedStyle(origData);
      var styleStrBuff = [];
      var relStyles = RELEVANT_STYLES[parentNode.tagName];
      for (var st = 0; st < relStyles.length; st++) {
        styleStrBuff.push(relStyles[st]);
        styleStrBuff.push(":");
        styleStrBuff.push(StyleDef.getPropertyValue(relStyles[st]));
        styleStrBuff.push("; ");
      }
      parentNode.setAttribute("style", styleStrBuff.join(""));
    }
    if (CONTAINER_ELEMENTS.indexOf(parentNode.tagName) === -1) return;
    const children = parentNode.childNodes;
    const origChildDat = origData.childNodes;
    for (let cd = 0; cd < children.length; cd++) {
      const c = children[cd];
      inlineStylesToSvgCopy(
        c,
        origChildDat[cd],
        CONTAINER_ELEMENTS,
        RELEVANT_STYLES
      );
    }
  }
  const CONTAINER_ELEMENTS = ["svg", "g"];
  const RELEVANT_STYLES = {
    svg: ["background-color"],
    rect: ["fill", "stroke", "stroke-width", "opacity"],
    path: ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity"],
    circle: ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity"],
    line: ["stroke", "stroke-width", "stroke-dasharray", "opacity"],
    text: ["fill", "font-size", "text-anchor", "opacity"],
    polygon: ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity"],
  };
  function exportStyledSvgToBlob(svgElm) {
    const oDOM = svgElm.cloneNode(true);
    inlineStylesToSvgCopy(oDOM, svgElm, CONTAINER_ELEMENTS, RELEVANT_STYLES);
    const data = new XMLSerializer().serializeToString(oDOM);
    const svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    return svg;
  }

  function styleInject(css, ref) {
    if (ref === void 0) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === "undefined") {
      return;
    }

    var head = document.head || document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    style.type = "text/css";

    if (insertAt === "top") {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z$1 =
    '/* Layout\n------------ */\n\n.d3-context-menu {\n\tposition: absolute;\n\tmin-width: 150px;\n\tz-index: 1200;\n}\n\n.d3-context-menu ul,\n.d3-context-menu ul li {\n\tmargin: 0;\n\tpadding: 0;\n}\n\n.d3-context-menu ul {\n\tlist-style-type: none;\n\tcursor: default;\n}\n\n.d3-context-menu ul li {\n\t-webkit-touch-callout: none; /* iOS Safari */\n\t-webkit-user-select: none;   /* Chrome/Safari/Opera */\n\t-khtml-user-select: none;    /* Konqueror */\n\t-moz-user-select: none;      /* Firefox */\n\t-ms-user-select: none;       /* Internet Explorer/Edge */\n\tuser-select: none;\n}\n\n/*\n\tDisabled\n*/\n\n.d3-context-menu ul li.is-disabled,\n.d3-context-menu ul li.is-disabled:hover {\n\tcursor: not-allowed;\n}\n\n/*\n\tDivider\n*/\n\n.d3-context-menu ul li.is-divider {\n\tpadding: 0;\n}\n\n/* Theming\n------------ */\n\n.d3-context-menu-theme {\n\tbackground-color: #f2f2f2;\n\tborder-radius: 4px;\n\n\tfont-family: Arial, sans-serif;\n\tfont-size: 14px;\n\tborder: 1px solid #d4d4d4;\n}\n\n.d3-context-menu-theme ul {\n\tmargin: 4px 0;\n}\n\n.d3-context-menu-theme ul li {\n\tpadding: 4px 16px;\n}\n\n.d3-context-menu-theme ul li:hover {\n\tbackground-color: #4677f8;\n\tcolor: #fefefe;\n}\n\n/*\n\tHeader\n*/\n\n.d3-context-menu-theme ul li.is-header,\n.d3-context-menu-theme ul li.is-header:hover {\n\tbackground-color: #f2f2f2;\n\tcolor: #444;\n\tfont-weight: bold;\n\tfont-style: italic;\n}\n\n/*\n\tDisabled\n*/\n\n.d3-context-menu-theme ul li.is-disabled,\n.d3-context-menu-theme ul li.is-disabled:hover {\n\tbackground-color: #f2f2f2;\n\tcolor: #888;\n}\n\n/*\n\tDivider\n*/\n\n.d3-context-menu-theme ul li.is-divider:hover {\n\tbackground-color: #f2f2f2;\n}\n\n.d3-context-menu-theme ul hr {\n\tborder: 0;\n\theight: 0;\n\tborder-top: 1px solid rgba(0, 0, 0, 0.1);\n\tborder-bottom: 1px solid rgba(255, 255, 255, 0.3);\n}\n\n/*\n\tNested Menu\n*/\n.d3-context-menu-theme ul li.is-parent:after {\n\tborder-left: 7px solid transparent;\n\tborder-top: 7px solid red;\n\tcontent: "";\n\theight: 0;\n\tposition: absolute;\n\tright: 8px;\n\ttop: 35%;\n\ttransform: rotate(45deg);\n\twidth: 0;\n}\n\n.d3-context-menu-theme ul li.is-parent {\n\tpadding-right: 20px;\n\tposition: relative;\n}\n\n.d3-context-menu-theme ul.is-children {\n\tbackground-color: #f2f2f2;\n\tborder: 1px solid #d4d4d4;\n\tcolor: black;\n\tdisplay: none;\n\tleft: 100%;\n\tmargin: -5px 0;\n\tpadding: 4px 0;\n\tposition: absolute;\n\ttop: 0;\n\twidth: 100%;\n}\n\n.d3-context-menu-theme li.is-parent:hover > ul.is-children {\n\tdisplay: block;\n}\n';
  styleInject(css_248z$1);

  // https://github.com/patorjk/d3-context-menu v1.1.2 modified to be bundable
  class ContextMenuItem {
    constructor(title, data, children, divider, disabled, action) {
      this.title = title;
      this.children = children;
      this.divider = divider;
      this.disabled = disabled;
      this.action = action;
      this.data = data;
    }
  }
  let ContextMenu_currentlyShownInstance = null;
  class ContextMenu {
    constructor() {}
    //public static noop() { }
    static isFn(value) {
      return typeof value === "function";
    }
    //public static const(value: any): () => any {
    //	return function() { return value; };
    //}
    //public static toFactory<T>(value: T, fallback: T): T {
    //	value = (value === undefined) ? fallback : value;
    //	return ContextMenu.isFn(value) ? value : ContextMenu.const(value) as T;
    //}
    getMenuItems(d) {
      throw new Error(
        "Override this method in your implementation of this class"
      );
    }
    onOpen(element, data) {
      return true;
    }
    onClose() {}
    getTheme(element, data) {
      return "d3-context-menu-theme";
    }
    getPosition(element, data) {
      return undefined;
    }
    closeMenu() {
      // global state is populated if a menu is currently opened
      if (ContextMenu_currentlyShownInstance) {
        d3__namespace.select(".d3-context-menu").remove();
        d3__namespace.select("body").on("mousedown.d3-context-menu", null);
        ContextMenu_currentlyShownInstance.onClose();
        ContextMenu_currentlyShownInstance = null;
      }
    }
    /**
     * Context menu event handler
     * @param {*} data
     */
    render(element, ev, data) {
      // close any menu that's already opened
      this.closeMenu();
      // store close callback already bound to the correct args and scope
      ContextMenu_currentlyShownInstance = this;
      // create the div element that will hold the context menu
      d3__namespace
        .selectAll(".d3-context-menu")
        .data([new ContextMenuItem("", data, [], false, false, null)])
        .enter()
        .append("div")
        .attr("class", "d3-context-menu " + this.getTheme(element, data));
      const closeMenu = this.closeMenu.bind(this);
      // close menu on mousedown outside
      d3__namespace.select("body").on("mousedown.d3-context-menu", closeMenu);
      d3__namespace.select("body").on("click.d3-context-menu", closeMenu);
      const parent = d3__namespace
        .selectAll(".d3-context-menu")
        .on("contextmenu", function (ev) {
          closeMenu();
          ev.preventDefault();
          ev.stopPropagation();
        })
        .append("ul");
      parent.call(this._renderNestedMenu.bind(this), element);
      // the openCallback allows an action to fire before the menu is displayed
      // an example usage would be closing a tooltip
      if (this.onOpen(element, data) === false) {
        return;
      }
      // Use this if you want to align your menu from the containing element, otherwise aligns towards center of window
      //console.log(this.parentNode.parentNode.parentNode);//.getBoundingClientRect());
      // get position
      const position = this.getPosition(element, data);
      const doc = document.documentElement;
      const pageWidth = window.innerWidth || doc.clientWidth;
      const pageHeight = window.innerHeight || doc.clientHeight;
      let horizontalAlignment = "left";
      let horizontalAlignmentReset = "right";
      let horizontalValue = position ? position.left : ev.pageX - 2;
      if (ev.pageX > pageWidth / 2) {
        horizontalAlignment = "right";
        horizontalAlignmentReset = "left";
        horizontalValue = position
          ? pageWidth - position.left
          : pageWidth - ev.pageX - 2;
      }
      let verticalAlignment = "top";
      let verticalAlignmentReset = "bottom";
      let verticalValue = position ? position.top : ev.pageY - 2;
      if (ev.pageY > pageHeight / 2) {
        verticalAlignment = "bottom";
        verticalAlignmentReset = "top";
        verticalValue = position
          ? pageHeight - position.top
          : pageHeight - ev.pageY - 2;
      }
      // display context menu
      d3__namespace
        .select(".d3-context-menu")
        .style(horizontalAlignment, horizontalValue + "px")
        .style(horizontalAlignmentReset, null)
        .style(verticalAlignment, verticalValue + "px")
        .style(verticalAlignmentReset, null)
        .style("display", "block");
      ev.preventDefault();
      ev.stopPropagation();
    }
    _renderNestedMenu(parent, root, depth = 0) {
      const _this = this;
      function resolve(value, data, index) {
        if (ContextMenu.isFn(value)) {
          const valFn = value;
          return valFn(_this, root, data, index);
        } else {
          return value;
        }
      }
      const closeMenu = this.closeMenu.bind(this);
      parent
        .selectAll("li")
        .data((d) => {
          if (depth == 0) {
            return _this.getMenuItems(d);
          } else {
            return resolve(d.children, d, 0);
          }
        })
        .enter()
        .append("li")
        .each(function (d, i) {
          // get value of each data
          var isDivider = !!resolve(d.divider, d, i);
          var isDisabled = !!resolve(d.disabled, d, i);
          var hasChildren = resolve(d.children, d, i).length != 0;
          var hasAction = !!d.action;
          var text = isDivider ? "<hr/>" : resolve(d.title, d, i);
          var listItem = d3__namespace
            .select(this)
            .classed("is-divider", isDivider)
            .classed("is-disabled", isDisabled)
            .classed("is-header", !hasChildren && !hasAction)
            .classed("is-parent", hasChildren)
            .html(text)
            .on("click", function (ev, data) {
              // do nothing if disabled or no action
              if (isDisabled || !hasAction) return;
              if (!d.action) return;
              d.action(_this, root, data, 0);
              closeMenu();
            });
          if (!isDisabled && hasChildren) {
            // create children(`next parent`) and call recursive
            var children = listItem.append("ul").classed("is-children", true);
            _this._renderNestedMenu(children, root, ++depth);
          }
        });
    }
  }

  class SignalContextMenu extends ContextMenu {
    constructor(waveGraph) {
      super();
      this.waveGraph = waveGraph;
    }
    getMenuItems(d) {
      var _a;
      let waveGraph = this.waveGraph;
      let formatOptions = [];
      // construct format options from values in formatters dictionary
      var formatters =
        ((_a = d.data.data.type.renderer) === null || _a === void 0
          ? void 0
          : _a.FORMATTERS) || {};
      function formatChanger(cm, elm, data, index) {
        var _a;
        const key = data.data;
        // function which switches data format function on every currently selected signals
        const newFormatter = formatters[key];
        d.data.data.type.formatter = newFormatter;
        const currentRenderrer = d.data.data.type.renderer;
        (_a = waveGraph.treelist) === null || _a === void 0
          ? void 0
          : _a.visibleNodes().forEach(function (d) {
              if (
                d.data.type.isSelected &&
                d.data.type.renderer === currentRenderrer
              ) {
                // === currentRenderrer because we do not want to change format on signals
                // which do not support this format option
                d.data.type.formatter = newFormatter;
              }
            });
        waveGraph.draw();
      }
      for (var key in formatters) {
        if (formatters.hasOwnProperty(key)) {
          formatOptions.push(
            new ContextMenuItem(
              /*title*/ key,
              key,
              [],
              /* divider */ false,
              /* disabled */ false,
              /*action*/ formatChanger
            )
          );
        }
      }
      return [
        new ContextMenuItem(
          "Remove",
          d.data,
          [],
          false,
          false,
          /*action*/ (cm, elm, data, index) => {
            var _a;
            d.data.data.type.isSelected = true;
            return (_a = waveGraph.treelist) === null || _a === void 0
              ? void 0
              : _a.filter((d) => {
                  return !d.type.isSelected;
                });
          }
        ),
        new ContextMenuItem(
          "Format",
          d.data,
          /* children */ formatOptions,
          /* divider */ false,
          /* disabled */ formatOptions.length == 0,
          /*action*/ null
        ),
      ];
    }
  }

  class Tooltip {
    constructor(tooltipHtmlGetter) {
      this.tooltipHtmlGetter = tooltipHtmlGetter;
      this.tooltipDiv = d3__namespace
        .select("body")
        .append("div")
        .attr("class", "d3-wave tooltip")
        .style("opacity", 0)
        .style("display", "none");
    }
    addToElm(selection) {
      var tooltipDiv = this.tooltipDiv;
      var tooltipHtmlGetter = this.tooltipHtmlGetter;
      return selection
        .on("mouseover", function (ev, d) {
          tooltipDiv
            .transition()
            .duration(200)
            .style("display", "block")
            .style("opacity", 0.9);
          var tootipHtml = tooltipHtmlGetter(d);
          tooltipDiv
            .html(tootipHtml)
            .style("left", ev.pageX + "px")
            .style("top", ev.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltipDiv
            .transition()
            .duration(500)
            .style("opacity", 0)
            .style("display", "none");
        });
    }
  }

  class WaveGraphSizesRow {
    constructor() {
      this.range = [0, 1];
      this.height = 20;
      this.ypadding = 5;
    }
  }
  class WaveGraphSizesMargin {
    constructor() {
      this.top = 20;
      this.right = 20;
      this.bottom = 20;
      this.left = 180;
    }
  }
  class WaveGraphSizes {
    constructor() {
      this.row = new WaveGraphSizesRow();
      this.margin = new WaveGraphSizesMargin();
      this.dragWidth = 5;
      this.width = -1;
      this.height = -1;
    }
  }

  var css_248z =
    ".d3-wave .value-line {\n\tfill: none;\n\tstroke: lime;\n\tstroke-width: 1.5px;\n}\n\n.d3-wave .grid-line-x {\n\tstroke: lightgrey;\n\topacity: 0.7;\n\tstroke-dasharray: 5, 5;\n}\n\n.d3-wave .grid path {\n\tstroke-width: 0;\n}\n\n.d3-wave .value-rect-invalid path {\n\tfill: darkred;\n\tstroke: red;\n}\n\n.d3-wave .value-rect-invalid rect {\n\tfill: darkred;\n\tstroke: red;\n}\n\n.d3-wave .value-rect-valid path {\n\tfill: green;\n\tstroke: lime;\n}\n\n.d3-wave .value-rect-valid text {\n\ttext-anchor: middle;\n\tfill: white;\n}\n\n.d3-wave .value-rect-invalid text {\n\ttext-anchor: middle;\n\tfill: white;\n}\n\n.d3-wave {\n\tbackground-color: black;\n}\n\n.d3-wave .domain {\n\tstroke: yellow;\n\tstroke-width: 1.5px;\n\tshape-rendering: crispEdges;\n\tvector-effect: non-scaling-stroke;\n}\n\n.d3-wave .tick line {\n\tstroke-width: 1.5px;\n\tstroke: yellow;\n}\n\n.d3-wave .axis text {\n\tshape-rendering: crispEdges;\n\tfill: yellow;\n}\n\n\n.d3-wave .axis-y path {\n\tshape-rendering: crispEdges;\n\tfill: yellow;\n}\n\n.d3-wave .axis-y .highlight text {\n    fill: #ff751a;\n    font-weight: bold;\n}\n\n.d3-wave .scrollbar .mover {\n  fill: steelblue;\n  pointer-events: all;\n  cursor: ns-resize;\n  opacity: 0.5;\n}\n\n.d3-wave .scrollbar .subBar { \n  fill: gray;\n  opacity: 0.5;\n}\n\n.d3-wave .vertical-help-line {\n\tstroke: white;\n\tstroke-width: 2;\n}\n\n.d3-wave .labelcell.selected rect {\n\topacity: 30%;\n\tfill: aqua;\n}\n\n.d3-wave .labelcell text {\n\tcursor:grabbing;\n}\n\n.d3-wave .labelcell .expandable {\n\tcursor:pointer;\n}\n\n.d3-wave.tooltip {\t\n    position: absolute;\t\t\t\n    text-align: center;\t\t\t\n    width: 60px;\t\t\t\t\t\n    height: 28px;\t\t\t\t\t\n    padding: 2px;\t\t\t\t\n    font: 12px sans-serif;\t\t\n    background-color: lightsteelblue;\t\n    border: 0px;\t\t\n    border-radius: 8px;\t\t\t\n    pointer-events: none;\t\t\t\n}\n\n.d3-wave .axis .icons {\n    fill: white;\n}\n\n.d3-wave .value-background {\n\topacity: 0%;\n}\n.d3-wave .value-background.selected {\n\topacity: 30%;\n\tfill: aqua;\n}";
  styleInject(css_248z);

  // main class which constructs the signal wave viewer
  class WaveGraph {
    constructor(svg) {
      this.svg = svg;
      svg.classed("d3-wave", true);
      this.dataG = svg.append("g");
      this.xAxis = null;
      this.yAxisG = null;
      this.xAxisG = null;
      this.waveRowX = null;
      this.waveRowY = null;
      this.verticalHelpLine = null;
      // total time range
      this.xRange = [0, 1];
      this.sizes = new WaveGraphSizes();
      this.TICKS_PER_X_AXIS = 10; // number of ticks in X (time) axis
      this.data = [];
      this._allData = undefined;
      // list of renderers for value rows
      this.rowRenderers = [
        new RowRendererBit(this),
        new RowRendererBits(this),
        new RowRendererEnum(this),
        new RowRendererLabel(this),
        new RowRendererStruct(this),
        new RowRendererArray(this),
      ];
      this.timeZoom = null;
      this.labelAreaSizeDragBar = null;
      this.labelContextMenu = new SignalContextMenu(this);
      this.setSizes();
      this.treelist = null;
    }
    _setZoom() {
      const timeRange = this.xRange;
      this.timeZoom = d3__namespace
        .zoom()
        .scaleExtent([1 / Math.max(1, timeRange[1]), 1.1])
        .translateExtent([
          [timeRange[0], 0],
          [timeRange[1], 0],
        ])
        .on("zoom", this._zoomed.bind(this));
      this.dataG.call(this.timeZoom);
    }
    _zoomed(ev) {
      // https://stackoverflow.com/questions/69109270/updating-d3-zoom-behavior-from-v3
      var range = this.xRange;
      var t = ev.transform;
      range[1] - range[0];
      if (!this.xAxisG) return;
      const domainElm = this.xAxisG.select(".domain");
      if (!domainElm) return;
      const domainElmNode = domainElm.node();
      if (!domainElmNode) return;
      const sizes = this.sizes;
      const xAxisScale = d3__namespace
        .scaleLinear()
        .domain(this.xRange)
        .range([0, sizes.width]);
      let zoomedScale = t.rescaleX(xAxisScale);
      //if (zoomedScale.domain()[0] < 0) {
      //	zoomedScale.domain([0, Math.max(zoomedScale.domain()[1], 0)])
      //}
      const xAxis = this.xAxis;
      if (!xAxis) return;
      xAxis.scale(zoomedScale);
      this.sizes.row.range = zoomedScale.domain();
      // update tick formatter becase time range has changed
      // and we may want to use a different time unit
      xAxis.tickFormat(createTimeFormatterForTimeRange(this.sizes.row.range));
      this.draw();
    }
    /*
     * extract width/height from svg and apply margin to main "g"
     */
    setSizes() {
      var svg = this.svg;
      var s = this.sizes;
      const _w = svg.style("width") || svg.attr("width");
      const w = parseInt(_w);
      if (!Number.isFinite(w)) {
        throw new Error("Can not resolve width of main SVG element");
      }
      var h = parseInt(svg.style("height") || svg.attr("height"));
      if (!Number.isFinite(h)) {
        throw new Error("Can not resolve height of main SVG element");
      }
      s.width = w - s.margin.left - s.margin.right;
      if (s.width <= 0) {
        throw new Error("Width too small for main SVG element " + s.width);
      }
      s.height = h - s.margin.top - s.margin.bottom;
      if (s.height <= 0) {
        throw new Error("Height too small for main SVG element " + s.height);
      }
      this.dataG.attr(
        "transform",
        "translate(" + s.margin.left + "," + s.margin.top + ")"
      );
      if (this.treelist) {
        this.treelist.size(s.margin.left, s.height);
      }
      if (this.labelAreaSizeDragBar)
        this.labelAreaSizeDragBar.size(s.dragWidth, s.height);
    }
    drawYHelpLine() {
      const height = this.sizes.height;
      const vhl = this.verticalHelpLine;
      const svg = this.svg;
      const graph = this;
      function moveVerticalHelpLine(ev) {
        const svgNode = svg.node();
        if (!svgNode) {
          throw new Error("SVG Node should be constructed");
        }
        var boundingRect = svgNode.getBoundingClientRect();
        var xPos = ev.clientX - boundingRect.left - graph.sizes.margin.left; //x position within the element.
        if (xPos < 0) {
          xPos = 0;
        }
        svg
          .select(".vertical-help-line")
          .attr("transform", function () {
            return "translate(" + xPos + ",0)";
          })
          .attr("y2", graph.sizes.height);
      }
      if (vhl) {
        vhl.attr("y2", height);
      } else {
        // construct new help line
        this.verticalHelpLine = this.dataG
          .append("line")
          .attr("class", "vertical-help-line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", height);
        svg.on("mousemove", moveVerticalHelpLine);
      }
    }
    drawGridLines() {
      // simple graph with grid lines in d3v4
      // https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
      const height = this.sizes.height;
      const xAxisScale = this.waveRowX;
      if (!xAxisScale) return;
      const xValues = xAxisScale.ticks(this.TICKS_PER_X_AXIS).map(function (d) {
        return xAxisScale(d);
      });
      // add the X gridlines (parallel with x axis)
      let gridLines = this.dataG.selectAll(".grid-line-x").data(xValues);
      if (!gridLines) throw new Error("Can not find grid-line-x");
      gridLines
        .enter()
        .append("line")
        .attr("class", "grid-line-x")
        .merge(gridLines)
        .attr("x1", function (d) {
          return d;
        })
        .attr("y1", 0)
        .attr("x2", function (d) {
          return d;
        })
        .attr("y2", height);
      gridLines.exit().remove();
    }
    drawXAxis() {
      const sizes = this.sizes;
      const xAxisScale = (this.waveRowX = d3__namespace
        .scaleLinear()
        .domain(sizes.row.range)
        .range([0, sizes.width]));
      // var axisX = g.selectAll(".axis-x")
      // https://bl.ocks.org/HarryStevens/54d01f118bc8d1f2c4ccd98235f33848
      // General Update Pattern, I https://bl.ocks.org/mbostock/3808218
      // http://bl.ocks.org/nnattawat/9054068
      var xaxisG = this.xAxisG;
      if (xaxisG) {
        // update xaxisG
        var xAxis = this.xAxis;
        if (!xAxis) {
          throw new Error("xAxis should exists if xAxisG exists");
        }
        xaxisG.call(xAxis.scale(xAxisScale));
      } else {
        // create xaxisG
        this.xAxis = d3__namespace
          .axisTop(xAxisScale)
          .tickFormat(createTimeFormatterForTimeRange(this.sizes.row.range));
        this.xAxisG = this.dataG
          .append("g")
          .attr("class", "axis axis-x")
          .call(this.xAxis);
      }
    }
    drawControlIcons() {
      const _this = this;
      const sizes = this.sizes;
      const ROW_Y = sizes.row.height + sizes.row.ypadding;
      // Define the div for the tooltip
      const icons = [
        {
          icon: freeSolidSvgIcons.faQuestion,
          tooltip: "d3-wave help placeholder[TODO]",
        },
        {
          icon: freeSolidSvgIcons.faDownload,
          tooltip: "Download current screen as SVG image",
          onclick: function () {
            const svgNode = _this.svg.node();
            if (!svgNode) {
              throw new Error("svgNode should exist");
            }
            const svg = exportStyledSvgToBlob(svgNode);
            const url = URL.createObjectURL(svg);
            window.open(url);
          },
        },
        {
          icon: freeSolidSvgIcons.faArrowsH,
          tooltip: "Reset time zoom to fit screen",
          onclick: function () {
            _this.zoomReset();
          },
        },
        {
          icon: freeSolidSvgIcons.faFilter,
          tooltip: "Filter signals to display",
          onclick: function () {},
        },
      ];
      const tooltip = new Tooltip((d) => d.tooltip);
      if (!this.yAxisG)
        throw new Error("The yAxisG should be constructed at this point");
      this.yAxisG
        .selectAll("text")
        .data(icons)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
          return (
            "translate(" +
            i * ROW_Y +
            "," +
            -ROW_Y * 1 +
            ") scale(" +
            (ROW_Y / d.icon.icon[1]) * 0.5 +
            ")"
          );
        })
        .call(tooltip.addToElm.bind(tooltip))
        .on("click", function (ev, d) {
          if (d.onclick) {
            return d.onclick();
          }
          return null;
        })
        .append("path")
        .classed("icons", true)
        .attr("d", function (d) {
          return d.icon.icon[4];
        });
    }
    drawYAxis() {
      var sizes = this.sizes;
      var ROW_Y = sizes.row.height + sizes.row.ypadding;
      // drawWaveLabels
      this.waveRowY = d3__namespace
        .scaleLinear()
        .domain([0, 1])
        .range([sizes.row.height, 0]);
      // y axis
      if (!this.yAxisG) {
        // this.yaxisG.remove();
        this.yAxisG = this.svg.append("g").classed("axis axis-y", true);
        this.yAxisG.attr(
          "transform",
          "translate(0," + (sizes.margin.top + ROW_Y / 2) + ")"
        );
        this.drawControlIcons();
        if (this.treelist)
          this.yAxisG.call(this.treelist.draw.bind(this.treelist));
      }
      if (!this.labelAreaSizeDragBar) {
        var graph = this;
        this.labelAreaSizeDragBar = new DragBarVertical(
          this.yAxisG,
          [sizes.dragWidth, sizes.height],
          [0, sizes.width + sizes.margin.left],
          [sizes.margin.left, sizes.margin.top]
        );
        this.labelAreaSizeDragBar.onDrag(function (drag) {
          sizes.margin.left = drag.x;
          graph.setSizes();
        });
      }
    }
    // draw whole graph
    draw() {
      this.drawXAxis();
      this.drawGridLines();
      this.drawYHelpLine();
      this.drawYAxis();
      var sizes = this.sizes;
      var graph = this;
      // drawWaves
      // remove previously rendered row data
      this.dataG.selectAll(".value-row").remove();
      var valueRows = this.dataG.selectAll(".value-row").data(graph.data);
      function renderWaveRows(selection) {
        // Select correct renderer function based on type of data series
        selection.each(function (d) {
          // var name = d[0];
          const signalType = d.type;
          let data = d.data;
          if (data && data.length) {
            const parent = d3__namespace.select(this);
            const range = graph.sizes.row.range;
            data = filterDataByTime(data, [
              Math.max(range[0], 0),
              Math.max(range[1], 1),
            ]);
            if (!signalType.renderer) {
              throw new Error("Signal must have renderer already assinged");
            }
            signalType.renderer.render(
              parent,
              data,
              signalType,
              signalType.formatter
            );
          }
        });
      }
      // move value row to it's possition
      var ROW_Y = sizes.row.height + sizes.row.ypadding;
      valueRows
        .enter()
        .append("g")
        .attr("class", "value-row")
        .merge(valueRows)
        .call(renderWaveRows)
        .attr("transform", (d, i) => "translate(0," + i * ROW_Y + ")");
    }
    bindData(_signalData) {
      if (_signalData.constructor !== Object) {
        throw new Error(
          "Data in invalid format (should be dictionary and is " +
            _signalData +
            ")"
        );
      }
      this._allData = _signalData;
      var maxT = 0;
      const rowRenderers = this.rowRenderers;
      function findRendererAndDiscoverMaxT(d) {
        const dData = d.data;
        if (dData && dData.length) {
          const lastTimeInData = dData[dData.length - 1][0];
          maxT = Math.max(maxT, lastTimeInData);
        }
        const signalType = d.type;
        for (const renderer of rowRenderers) {
          if (renderer.select(signalType)) {
            var formatter = signalType.formatter;
            if (!formatter) {
              formatter = renderer.DEFAULT_FORMAT;
            } else if (typeof formatter === "string") {
              formatter = renderer.FORMATTERS[formatter];
              if (!formatter) {
                throw new Error(
                  "Formatter value invalid " +
                    signalType.formatter +
                    "(" +
                    d.name +
                    ")"
                );
              }
            }
            signalType.formatter = formatter;
            signalType.renderer = renderer;
            break;
          }
        }
        if (!signalType.renderer) {
          throw new Error(
            "None of installed renderers supports signalType:" + signalType
          );
        }
        (d.children || d._children || []).forEach(findRendererAndDiscoverMaxT);
      }
      findRendererAndDiscoverMaxT(this._allData);
      var sizes = this.sizes;
      this.xRange[1] = sizes.row.range[1] = maxT;
      this._setZoom();
      var ROW_Y = sizes.row.height + sizes.row.ypadding;
      var graph = this;
      if (!this.treelist) {
        this.treelist = new TreeList(ROW_Y, this.labelContextMenu);
        this.treelist.onChange(function (selection) {
          graph.data = selection.map((d) => {
            return d.data;
          });
          graph.draw();
        });
      }
      this.setSizes();
      if (!this.treelist)
        throw new Error("treelist should be already allocated");
      this.treelist.data(this._allData);
    }
    zoomReset() {
      if (!this.timeZoom) throw new Error("timeZoom was not initialized");
      this.dataG.call(this.timeZoom.transform, d3__namespace.zoomIdentity);
    }
  }

  /**
   * Returns an array with strings of the given size.
   *
   * @param str  string to split
   * @param chunkSize Size of every group
   */
  function chunkString(str, chunkSize) {
    return Array(Math.ceil(str.length / chunkSize))
      .fill(undefined)
      .map(function (_, i) {
        return str.slice(i * chunkSize, i * chunkSize + chunkSize);
      });
  }
  const PREVIEW_TYPE = Object.assign(
    {
      HEX_BYTES: function (d, size) {
        var res = SCALAR_FORMAT.UINT_HEX(d[1]);
        var extend = "0";
        if (res[0] == "X") {
          extend = "X";
        }
        res = res.padStart(2 * size, extend);
        return chunkString(res, 2);
      },
      ASCII: "ASCII",
    },
    SCALAR_FORMAT
  );
  class HexEdit {
    constructor(parent) {
      // view config
      this.addrRange = [0, 8 * 4];
      this.addrStep = 4;
      this.addrPos = 0;
      this.dataWordCellCnt = 4;
      // data
      this._data = null;
      this.currentData = [];
      this.currentTime = 0;
      // html elements
      this.parent = parent;
      this.mainTable = null;
      this.dataAreas = []; // list of td elements in the rows which are displaying the data
    }
    /**
     * Get or set data to this viewer
     */
    data(data) {
      if (arguments.length) {
        var w = data.type.width;
        if (!w || w.length != 2)
          throw new Error(
            "NotImplementedv (only 1 level of index and width of element)"
          );
        this.dataWordCellCnt = this.addrStep = Math.ceil(w[w.length - 1] / 8);
        this.addrRange = [0, w[0] * this.addrStep];
        this._data = data;
      } else {
        return this._data;
      }
    }
    // update select of data based on time
    setTime(newTime) {
      if (this.currentTime === newTime) {
        return;
      }
      // build currentData from update informations from data
      let cd = this.currentData;
      const t = this.currentTime;
      if (!this._data) return;
      const data = this._data.data;
      let startI = 0;
      if (newTime > t) {
        // update current data
        startI = binarySearch(
          data,
          [t, "", 0],
          (el0, el1) => {
            return el0[0] > el1[0];
          },
          function (ar, el) {
            if (el < ar[0]) {
              return 0;
            }
            if (el > ar[ar.length - 1]) {
              return ar.length;
            }
            return -1;
          }
        );
      } else {
        // create completly new data
        cd = this.currentData = [];
      }
      for (var i = startI; i < data.length && data[i][0] <= newTime; i++) {
        const d = data[i][1]; // [0] is time,
        const addr = d[0];
        const val = d[1];
        if (typeof addr === "number") cd[addr] = val;
        else {
          if (addr.length != 1)
            throw new Error("NotImplemented - array with multiple dimensions");
          cd[addr[0]] = val;
        }
      }
    }
    draw() {
      if (!this.mainTable) {
        const t = (this.mainTable = this.parent
          .append("table")
          .classed("d3-wave-hexedit", true));
        var inWordAddrTitles = [];
        for (var i = 0; i < this.dataWordCellCnt + 1; i++) {
          // the first one is padding for address column
          var title;
          if (i == 0) {
            title = "";
          } else {
            title = (i - 1).toString(16).padStart(2, "0");
          }
          inWordAddrTitles.push(title);
        }
        t.append("tr")
          .selectAll("td")
          .data(inWordAddrTitles)
          .enter()
          .append("td")
          .classed("word-addr", true)
          .text(function (d) {
            return d;
          });
        this.dataAreas = [];
        var first = true;
        for (
          var a = this.addrRange[0];
          a < this.addrRange[1];
          a += this.addrStep
        ) {
          // construct the rows of the table
          var tr = t.append("tr");
          // print first column with address
          tr.append("td")
            .classed("addr", true)
            .text("0x" + a.toString(16).padStart(2, "0"));
          if (first) {
            // first row contains the dell with data which spans over whole table
            // the data is in another table because we want to exclude the address
            // column from text selection in data area
            first = false;
            const da = tr.append("td");
            da.classed("data", true)
              .attr("colspan", this.dataWordCellCnt)
              .attr(
                "rowspan",
                (this.addrRange[1] - this.addrRange[0]) / this.addrStep
              );
            this.dataAreas.push(da);
          }
        }
        const dtable =
          this.dataAreas[this.dataAreas.length - 1].append("table");
        this.dataAreas[0];
        const maxI = this.addrRange[1] / this.addrStep;
        for (var i = this.addrRange[0] / this.addrStep; i < maxI; i++) {
          let d = this.currentData[i];
          if (d === undefined) {
            d = "X";
          }
          var byteStrings = PREVIEW_TYPE.HEX_BYTES(
            d,
            this.dataWordCellCnt
          ).reverse();
          dtable
            .append("tr")
            .selectAll("td")
            .data(byteStrings)
            .enter()
            .append("td")
            .classed("invalid", (d) => d.indexOf("X") >= 0)
            .text((d) => d);
        }
      }
    }
  }

  exports.HexEdit = HexEdit;
  exports.RowRendererBit = RowRendererBit;
  exports.RowRendererBits = RowRendererBits;
  exports.WaveGraph = WaveGraph;
  exports.filterDataByTime = filterDataByTime;
});
//# sourceMappingURL=d3-wave.js.map
