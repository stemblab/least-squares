pi = Math.PI
T = numeric.transpose
rep = numeric.rep
pow = numeric.pow
dot = numeric.dot
add = numeric.add
linspace = numeric.linspace

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

  constructor: (@k1=0.25, @k2=0.75) ->

    super "plot"

    # data
    xd = [0.3, 0.5, 0.7, 0.9]
    yd = [0.3, 0.4, 0.4, 0.9]
    @dd = @d3Format(xd, yd) # format for d3

    # polynomial
    xp = linspace(0, 1, 100)
    yp = (@k1*x + @k2*x*x for x in xp)
    @dp = @d3Format(xp, yp) # format for d3

    # least squares
    [c0, A0] = @polyLeastSquares(xd, yd)
    yk = dot(T(A0), [@k1, @k2]) # values at xd

    #---- d3 ----#

    @squareData = @squarify(xd, yd, yk)

    # SVG
    @obj.attr("id", "plot")
      .attr('width', 480)
      .attr('height', 480)

    # border
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
      .datum(@dp)
      .attr("class", "line")
      .attr("d", pline)

    plot.selectAll("dot")
      .data(@dd)
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

  polyLeastSquares: (x, y) ->
    A = pow(rep([2],x),T(rep([4],[1,2])))
    AAT = dot(A,T(A))
    Ay = dot(A,y)
    [numeric.solve(AAT,Ay), A]

  d3Format: (x, y) ->
    ({x:u, y:y[idx]} for u, idx in x)

  squarify: (xd, yd, yk) ->
    w = []
    for u, idx in xd
      x = @x(u)
      y = Math.min(@y(yd[idx]),@y(yk[idx]))
      e = Math.abs(@y(yk[idx])-@y(yd[idx]))
      x = x-e if yk[idx] < yd[idx]
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

    @yAxis = d3.axisLeft()
      .scale(@y)


class Slider

  constructor: (@id, @change) ->
    @slider = $ "##{id}"
    @sliderDisp = $ "##{id}-value"
    @slider.unbind()  # needed to clear event handlers
    @slider.on "change", =>
      val = @val()
      @change val
      @sliderDisp.html(val)

      val: -> @slider.val()


new Plot
