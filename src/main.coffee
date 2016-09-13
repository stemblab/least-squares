pi = Math.PI


# Import raw data
#raw = $blab.resource "gamsatc_data"#;
raw = omni.dataFn()

#console.log "raw", raw
#data = (y: y, t: t for y, t of raw)

nm = numeric


class d3Object

  constructor: (id) ->

    @element = d3.select "##{id}"
    @element.selectAll("svg").remove()
    @obj = @element.append "svg"
    @initAxes()

    append: (obj) -> @obj.append obj

    initAxes: ->


class Plot extends d3Object

  margin = {top: 50, right: 50, bottom: 50, left: 50}
  width = 480 - margin.left - margin.right
  height = 480 - margin.top - margin.bottom

  constructor: () ->

    super "plot"

    #x = [0.5 0.7 0.9].';
    #y = [0.5 0.3 0.8].';


    x0 = [0.3, 0.5, 0.7, 0.9]
    y0 = [0.3, 0.4, 0.4, 0.9]
    #y1 = [0.25, 0.4, 0.5]


    T = numeric.transpose
    rep = numeric.rep
    pow = numeric.pow
    dot = numeric.dot
    add = numeric.add

    #xs = [-3, -2, 0, 3, 5]
    #ys = [2,1.1,1,1.3,2.4]

    V = pow(rep([2],x0),T(rep([4],[1,2])))
    VVT = dot(V,T(V))
    Vy = dot(V,y0)
    c = numeric.solve(VVT,Vy)

    console.log "c", c

    y1 = dot(T(V), c)

    xf = nm.linspace(0, 1, 100)
    yf = (c[0]*x + c[1]*x*x for x in xf)

    delta = nm.sub(y0, y1)

    #@approx = @d3Format(x0, y1)
    @approx = @d3Format(xf, yf)

    @ref = @d3Format(x0, y0)
    @squareData = @squarify(x0, y0, y1)

    @obj.attr("id", "plot")
      .attr('width', 480)
      .attr('height', 480)

    @obj.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 480)
      .attr("width", 480)
      .style("stroke", "blue")
      .style("fill", "none")
      .style("stroke-width", 10);

    plot = @obj.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('width', width)
      .attr('height', height)
      .attr('id','plot')
      #.attr('overflow', 'visible')

    plot.append("g")
      .attr("id","x-axis")
      .attr("class", "axis")
      .attr("transform", "translate(0, #{height+10})")
      .call(@xAxis)

    plot.append("g")
      .attr("id","y-axis")
      .attr("class", "axis")
      .attr("transform", "translate(-10, 0)")
      .call(@yAxis)

    pline = d3.line()
      .x((d) => @x(d.x))
      .y((d) => @y(d.y))

    plot.append("path")
      .datum(@approx)
      .attr("class", "line")
      .attr("d", pline)

    plot.selectAll("dot")
      .data(@ref)
      .enter().append("circle")
      .attr("r", 5)
      .attr("cx", (d) => @x(d.x))
      .attr("cy", (d) => @y(d.y));

    plot.selectAll("square")
      .data(@squareData)
      .enter().append("rect")
      .attr("x", (d) => (d.x))
      .attr("y", (d) => (d.y))
      .attr("height", (d) => (d.e))
      .attr("width", (d) => (d.e))
      .style("stroke", "green")
      .style("fill", "none")
      .style("stroke-width", 1)

  d3Format: (x, y) ->
    ({x:u, y:y[idx]} for u, idx in x)


  squarify: (x0, y0, y1) ->
    w = []
    for u, idx in x0
      x = @x(u)
      y = Math.min(@y(y0[idx]),@y(y1[idx]))
      e = Math.abs(@y(y1[idx])-@y(y0[idx]))
      x = x-e if y1[idx] < y0[idx]
      w[idx] = {x:x, y:y, e:e}
    w

  initAxes: ->

    @x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width])

    @y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0])

    @xAxis = d3.axisBottom()
      .scale(@x)
      #.tickFormat(d3.format("d"))

    @yAxis = d3.axisLeft()
      .scale(@y)

new Plot
