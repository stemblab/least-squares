(function() {
  var Plot, d3Object, nm, pi, raw,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  pi = Math.PI;

  raw = omni.dataFn();

  nm = numeric;

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

    function Plot() {
      var T, V, VVT, Vy, add, c, delta, dot, pline, plot, pow, rep, x, x0, xf, y0, y1, yf;
      Plot.__super__.constructor.call(this, "plot");
      x0 = [0.3, 0.5, 0.7, 0.9];
      y0 = [0.3, 0.4, 0.4, 0.9];
      T = numeric.transpose;
      rep = numeric.rep;
      pow = numeric.pow;
      dot = numeric.dot;
      add = numeric.add;
      V = pow(rep([2], x0), T(rep([4], [1, 2])));
      VVT = dot(V, T(V));
      Vy = dot(V, y0);
      c = numeric.solve(VVT, Vy);
      console.log("c", c);
      y1 = dot(T(V), c);
      xf = nm.linspace(0, 1, 100);
      yf = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = xf.length; i < len; i++) {
          x = xf[i];
          results.push(c[0] * x + c[1] * x * x);
        }
        return results;
      })();
      delta = nm.sub(y0, y1);
      this.approx = this.d3Format(xf, yf);
      this.ref = this.d3Format(x0, y0);
      this.squareData = this.squarify(x0, y0, y1);
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
      plot.append("path").datum(this.approx).attr("class", "line").attr("d", pline);
      plot.selectAll("dot").data(this.ref).enter().append("circle").attr("r", 5).attr("cx", (function(_this) {
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

    Plot.prototype.squarify = function(x0, y0, y1) {
      var e, i, idx, len, u, w, x, y;
      w = [];
      for (idx = i = 0, len = x0.length; i < len; idx = ++i) {
        u = x0[idx];
        x = this.x(u);
        y = Math.min(this.y(y0[idx]), this.y(y1[idx]));
        e = Math.abs(this.y(y1[idx]) - this.y(y0[idx]));
        if (y1[idx] < y0[idx]) {
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

  new Plot;

}).call(this);

//# sourceMappingURL=main.js.map
