(function() {
  var Plot, Slider, T, add, d3Object, dot, linspace, norm, pi, plot, pow, rep, sub,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  pi = Math.PI;

  T = numeric.transpose;

  rep = numeric.rep;

  pow = numeric.pow;

  dot = numeric.dot;

  add = numeric.add;

  sub = numeric.sub;

  norm = numeric.norm2;

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

    function Plot(k11, k21) {
      var D, E, K1, K2, c0, dk1, dk2, i, j, k, k1, k2, len, len1, u, xAxis;
      this.k1 = k11 != null ? k11 : 0.25;
      this.k2 = k21 != null ? k21 : 0.75;
      Plot.__super__.constructor.call(this, "board");

      /*
      x = [-0.7 -0.5 0.3 0.9].';
      y = 0.4*f1(x) + 0.6*f2(x);
       */
      this.xd = [-0.7, -0.5, 0.3, 0.9];
      this.yd = add((function() {
        var j, len, ref, results;
        ref = this.xd;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          u = ref[j];
          results.push(0.4 * u + 0.6 * u * u);
        }
        return results;
      }).call(this), [0, 0, 0, 0]);
      this.dd = this.d3Format(this.xd, this.yd);
      this.A = pow(rep([2], this.xd), T(rep([4], [1, 2])));
      this.AAT = dot(this.A, T(this.A));
      c0 = this.polyLeastSquares(this.yd);
      console.log(norm(dot(T(this.A), [this.k1, this.k2])), this.polyError(this.k1, this.k2));
      dk1 = 1 / 10;
      dk2 = 1 / 10;
      K1 = (function() {
        var j, results;
        results = [];
        for (i = j = 1; j <= 9; i = ++j) {
          results.push(i * dk1);
        }
        return results;
      })();
      K2 = (function() {
        var j, results;
        results = [];
        for (i = j = 1; j <= 9; i = ++j) {
          results.push(i * dk2);
        }
        return results;
      })();
      E = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = K2.length; j < len; j++) {
          k2 = K2[j];
          results.push((function() {
            var k, len1, results1;
            results1 = [];
            for (k = 0, len1 = K1.length; k < len1; k++) {
              k1 = K1[k];
              results1.push(this.polyError(k1, k2));
            }
            return results1;
          }).call(this));
        }
        return results;
      }).call(this);
      D = [];
      for (j = 0, len = K1.length; j < len; j++) {
        k1 = K1[j];
        for (k = 0, len1 = K2.length; k < len1; k++) {
          k2 = K2[k];
          D.push({
            e: this.polyError(k1, k2),
            k1: k1,
            k2: k2
          });
        }
      }
      console.log("D", D);
      this.obj.attr("id", "svg").attr('width', 960).attr('height', 480);
      this.obj.append("rect").attr("x", 0).attr("y", 0).attr("height", 480).attr("width", 960).style("stroke", "blue").style("fill", "none").style("stroke-width", 10);
      this.space = this.obj.append('g').attr('transform', "translate(" + 480. + "," + 50. + ")").attr('width', width).attr('height', height).attr('id', 'space');
      xAxis = this.space.append("g").attr("id", "x-axis").attr("class", "axis").attr("transform", "translate(0, " + (height + 10) + ")").call(this.xAxis);
      this.space.append("g").attr("id", "y-axis").attr("class", "axis").attr("transform", "translate(-10, 0)").call(this.yAxis);
      this.cursor = this.space.append("circle").attr("r", 5).attr("cx", 77).attr("cy", 99);
      console.log("domain", [
        0, d3.max(D, function(d) {
          return d.e;
        })
      ]);
      this.z.domain([
        0, d3.max(D, function(d) {
          return d.e;
        })
      ]);
      this.space.selectAll(".tile").data(D).enter().append("rect").attr("class", "tile").attr("x", (function(_this) {
        return function(d) {
          return _this.x(d.k1 - dk1 / 2);
        };
      })(this)).attr("y", (function(_this) {
        return function(d) {
          return _this.y(d.k2 + dk2 / 2);
        };
      })(this)).attr("width", this.x(dk1) - this.x(0)).attr("height", this.y(0) - this.y(dk2)).style("fill", (function(_this) {
        return function(d) {
          return _this.z(d.e);
        };
      })(this));
      this.plot = this.obj.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').attr('width', width).attr('height', height).attr('id', 'plot');
      this.plot.append("g").attr("id", "x-axis").attr("class", "axis").attr("transform", "translate(0, " + (height + 10) + ")").call(this.xAxis);
      this.plot.append("g").attr("id", "y-axis").attr("class", "axis").attr("transform", "translate(-10, 0)").call(this.yAxis);
      this.plot.selectAll("dot").data(this.dd).enter().append("circle").attr("r", 5).attr("cx", (function(_this) {
        return function(d) {
          return _this.x(d.x);
        };
      })(this)).attr("cy", (function(_this) {
        return function(d) {
          return _this.y(d.y);
        };
      })(this));
      this.pline = d3.line().x((function(_this) {
        return function(d) {
          return _this.x(d.x);
        };
      })(this)).y((function(_this) {
        return function(d) {
          return _this.y(d.y);
        };
      })(this));
      this.plot.append("g").append("path").datum([
        {
          x: 0,
          y: 0
        }, {
          x: 1,
          y: 1
        }
      ]).attr("id", "poly").attr("d", this.pline).style("stroke", "red");
    }

    Plot.prototype.update1 = function(k1) {
      this.k1 = k1;
      return this.draw();
    };

    Plot.prototype.update2 = function(k2) {
      this.k2 = k2;
      return this.draw();
    };

    Plot.prototype.draw = function() {
      var x, xp, yk, yp;
      xp = linspace(0, 1, 100);
      yp = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = xp.length; j < len; j++) {
          x = xp[j];
          results.push(this.k1 * x + this.k2 * x * x);
        }
        return results;
      }).call(this);
      this.dp = this.d3Format(xp, yp);
      yk = (function() {
        var j, len, ref, results;
        ref = this.xd;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          x = ref[j];
          results.push(this.k1 * x + this.k2 * x * x);
        }
        return results;
      }).call(this);
      this.squareData = this.squarify(this.xd, this.yd, yk);
      this.plot.selectAll("#poly").transition().attr("d", this.pline(this.dp)).style("stroke", "green").style("fill", "none");
      this.plot.selectAll(".sq").data(this.squareData).enter().append("rect").attr("class", "sq").style("stroke", "blue").style("fill", "none").style("stroke-width", 1);
      return this.plot.selectAll(".sq").data(this.squareData).transition().attr("x", (function(_this) {
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
      })(this));
    };

    Plot.prototype.polyLeastSquares = function(y) {
      var Ay;
      Ay = dot(this.A, y);
      console.log("eqns", this.AAT, Ay);
      return numeric.solve(this.AAT, Ay);
    };

    Plot.prototype.polyError = function(k1, k2) {
      return norm(sub(dot(T(this.A), [k1, k2]), this.yd));
    };

    Plot.prototype.d3Format = function(x, y) {
      var idx, j, len, results, u;
      results = [];
      for (idx = j = 0, len = x.length; j < len; idx = ++j) {
        u = x[idx];
        results.push({
          x: u,
          y: y[idx]
        });
      }
      return results;
    };

    Plot.prototype.squarify = function(xd, yd, yk) {
      var e, idx, j, len, u, w, x, y;
      w = [];
      for (idx = j = 0, len = xd.length; j < len; idx = ++j) {
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
      this.z = d3.scaleLinear().range(["white", "steelblue"]);
      this.xAxis = d3.axisBottom().scale(this.x);
      return this.yAxis = d3.axisLeft().scale(this.y);
    };

    return Plot;

  })(d3Object);

  Slider = (function() {
    function Slider(id1, change) {
      this.id = id1;
      this.change = change;
      this.slider = $("#" + this.id);
      this.sliderDisp = $("#" + this.id + "-value");
      this.slider.unbind();
      this.slider.on("change", (function(_this) {
        return function() {
          var val;
          val = _this.val();
          _this.change(val);
          return _this.sliderDisp.html(val);
        };
      })(this));
    }

    Slider.prototype.val = function() {
      return this.slider.val();
    };

    return Slider;

  })();

  plot = new Plot;

  new Slider("k1", (function(_this) {
    return function(v) {
      return plot.update1(v);
    };
  })(this));

  new Slider("k2", (function(_this) {
    return function(v) {
      return plot.update2(v);
    };
  })(this));

}).call(this);

//# sourceMappingURL=main.js.map
