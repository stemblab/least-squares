(function() {
  var Plot, Slider, T, add, d3Object, dot, linspace, pi, pow, rep,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  pi = Math.PI;

  T = numeric.transpose;

  rep = numeric.rep;

  pow = numeric.pow;

  dot = numeric.dot;

  add = numeric.add;

  linspace = numeric.linspace;

  d3Object = (function() {
    function d3Object(id) {
      this.element = d3.select("#" + id);
      this.element.selectAll("svg").remove();
      this.obj = this.element.append("svg");
      this.initAxes();
      ({
        append: function(obj) {
          return this.obj.append(obj);
        },
        initAxes: function() {}
      });
    }

    return d3Object;

  })();

  Plot = (function(superClass) {
    var height, margin, width;

    extend(Plot, superClass);

    margin = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    };

    width = 480 - margin.left - margin.right;

    height = 480 - margin.top - margin.bottom;

    function Plot(k1, k2) {
      var A0, c0, pline, plot, ref, x, xd, xp, yd, yk, yp;
      this.k1 = k1 != null ? k1 : 0.25;
      this.k2 = k2 != null ? k2 : 0.75;
      Plot.__super__.constructor.call(this, "plot");
      xd = [0.3, 0.5, 0.7, 0.9];
      yd = [0.3, 0.4, 0.4, 0.9];
      this.dd = this.d3Format(xd, yd);
      xp = linspace(0, 1, 100);
      yp = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = xp.length; i < len; i++) {
          x = xp[i];
          results.push(this.k1 * x + this.k2 * x * x);
        }
        return results;
      }).call(this);
      this.dp = this.d3Format(xp, yp);
      ref = this.polyLeastSquares(xd, yd), c0 = ref[0], A0 = ref[1];
      yk = dot(T(A0), [this.k1, this.k2]);
      this.squareData = this.squarify(xd, yd, yk);
      this.obj.attr("id", "plot").attr('width', 480).attr('height', 480);
      this.obj.append("rect").attr("x", 0).attr("y", 0).attr("height", 480).attr("width", 480).style("stroke", "blue").style("fill", "none").style("stroke-width", 10);
      plot = this.obj.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').attr('width', width).attr('height', height).attr('id', 'plot');
      plot.append("g").attr("id", "x-axis").attr("class", "axis").attr("transform", "translate(0, " + (height + 10) + ")").call(this.xAxis);
      plot.append("g").attr("id", "y-axis").attr("class", "axis").attr("transform", "translate(-10, 0)").call(this.yAxis);
      pline = d3.line().x((function(_this) {
        return function(d) {
          return _this.x(d.x);
        };
      })(this)).y((function(_this) {
        return function(d) {
          return _this.y(d.y);
        };
      })(this));
      plot.append("path").datum(this.dp).attr("class", "line").attr("d", pline);
      plot.selectAll("dot").data(this.dd).enter().append("circle").attr("r", 5).attr("cx", (function(_this) {
        return function(d) {
          return _this.x(d.x);
        };
      })(this)).attr("cy", (function(_this) {
        return function(d) {
          return _this.y(d.y);
        };
      })(this));
      plot.selectAll("square").data(this.squareData).enter().append("rect").attr("x", (function(_this) {
        return function(d) {
          return d.x;
        };
      })(this)).attr("y", (function(_this) {
        return function(d) {
          return d.y;
        };
      })(this)).attr("height", (function(_this) {
        return function(d) {
          return d.e;
        };
      })(this)).attr("width", (function(_this) {
        return function(d) {
          return d.e;
        };
      })(this)).style("stroke", "green").style("fill", "none").style("stroke-width", 1);
    }

    Plot.prototype.polyLeastSquares = function(x, y) {
      var A, AAT, Ay;
      A = pow(rep([2], x), T(rep([4], [1, 2])));
      AAT = dot(A, T(A));
      Ay = dot(A, y);
      return [numeric.solve(AAT, Ay), A];
    };

    Plot.prototype.d3Format = function(x, y) {
      var i, idx, len, results, u;
      results = [];
      for (idx = i = 0, len = x.length; i < len; idx = ++i) {
        u = x[idx];
        results.push({
          x: u,
          y: y[idx]
        });
      }
      return results;
    };

    Plot.prototype.squarify = function(xd, yd, yk) {
      var e, i, idx, len, u, w, x, y;
      w = [];
      for (idx = i = 0, len = xd.length; i < len; idx = ++i) {
        u = xd[idx];
        x = this.x(u);
        y = Math.min(this.y(yd[idx]), this.y(yk[idx]));
        e = Math.abs(this.y(yk[idx]) - this.y(yd[idx]));
        if (yk[idx] < yd[idx]) {
          x = x - e;
        }
        w[idx] = {
          x: x,
          y: y,
          e: e
        };
      }
      return w;
    };

    Plot.prototype.initAxes = function() {
      this.x = d3.scaleLinear().domain([0, 1]).range([0, width]);
      this.y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
      this.xAxis = d3.axisBottom().scale(this.x);
      return this.yAxis = d3.axisLeft().scale(this.y);
    };

    return Plot;

  })(d3Object);

  Slider = (function() {
    function Slider(id1, change) {
      this.id = id1;
      this.change = change;
      this.slider = $("#" + id);
      this.sliderDisp = $("#" + id + "-value");
      this.slider.unbind();
      this.slider.on("change", (function(_this) {
        return function() {
          var val;
          val = _this.val();
          _this.change(val);
          _this.sliderDisp.html(val);
          return {
            val: function() {
              return this.slider.val();
            }
          };
        };
      })(this));
    }

    return Slider;

  })();

  new Plot;

}).call(this);

//# sourceMappingURL=main.js.map
