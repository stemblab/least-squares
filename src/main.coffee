pi = Math.PI
T = numeric.transpose
rep = numeric.rep
pow = numeric.pow
dot = numeric.dot
add = numeric.add
sub = numeric.sub
norm = numeric.norm2
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

    super "board"

    ###
    x = [-0.7 -0.5 0.3 0.9].';
    y = 0.4*f1(x) + 0.6*f2(x);
    ###

    # data
    @xd = [-0.7, -0.5, 0.3, 0.9]
    @yd = add((0.4*u + 0.6*u*u for u in @xd),[0, 0, 0, 0]) #[0.3, 0.4, 0.7, 0.9]

    @dd = @d3Format(@xd, @yd) # format for d3

    # polynomial
    #xp = linspace(0, 1, 100)
    #yp = (@k1*x + @k2*x*x for x in xp)
    #@dp = @d3Format(xp, yp) # format for d3

    # least squares

    @A = pow(rep([2],@xd),T(rep([4],[1,2])))

    @AAT = dot(@A,T(@A))

    #console.log "A0", @A

    c0 = @polyLeastSquares @yd
    #yk = dot(T(A0), [@k1, @k2]) # values at xd

    console.log norm(dot(T(@A), [@k1, @k2])), @polyError(@k1, @k2)


    dk1 = 1/10
    dk2 = 1/10

    #console.log "count", [1..5]

    K1 = (i*dk1 for i in [1..9]) #linspace(0,1,4)
    K2 = (i*dk2 for i in [1..9]) #linspace(0,1,4)

    E = ((@polyError(k1, k2) for k1 in K1) for k2 in K2)

    D = []
    for k1 in K1
      for k2 in K2
        D.push {e:@polyError(k1, k2), k1:k1, k2:k2}


    console.log "D", D

    #    ({x:u, y:y[idx]} for u, idx in x)

    #---- d3 ----#

    #@squareData = @squarify(xd, yd, yk)

    # SVG
    @obj.attr("id", "svg")
      .attr('width', 960)
      .attr('height', 480)

    # border
    @obj.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 480)
      .attr("width", 960)
      .style("stroke", "blue")
      .style("fill", "none")
      .style("stroke-width", 10);

    #---- parameter space ----#

    @space = @obj.append('g')
      .attr('transform', "translate(#{480},#{50})")
      .attr('width', width)
      .attr('height', height)
      .attr('id','space')

    xAxis = @space.append("g")
      .attr("id","x-axis")
      .attr("class", "axis")
      .attr("transform", "translate(0, #{height+10})")
      .call(@xAxis)

    @space.append("g")
      .attr("id","y-axis")
      .attr("class", "axis")
      .attr("transform", "translate(-10, 0)")
      .call(@yAxis)

    # rect = @space.append("rect")
    #   .attr("x", 0)
    #   .attr("y", 0)
    #   .attr("height", 480)
    #   .attr("width", 480)
    #   .style("stroke", "green")
    #   .style("fill", "none")
    #   .style("stroke-width", 15)

    @cursor = @space.append("circle")
      .attr("r", 5)
      .attr("cx", 77)
      .attr("cy", 99)

    #d3.select("#space").on 'keydown', (event) ->
    #  console.log d3.event.key


    # self = this
    # rect.on 'mousedown',  ->
    #   X = self.cursor.attr("cx")
    #   Y = self.cursor.attr("cy")
    #   m = d3.mouse(this)
    #   dx = X-m[0]
    #   dy = Y-m[1]
    #   u = dx+dy
    #   v = dx-dy
    #   if u<0 and v<0 then self.cursor.attr("cx", parseInt(X)+10)
    #   if u>0 and v>0 then self.cursor.attr("cx", parseInt(X)-10)
    #   if u>0 and v<0 then self.cursor.attr("cy", parseInt(Y)-10)
    #   if u<0 and v>0 then self.cursor.attr("cy", parseInt(Y)+10)


    console.log "domain", [0, d3.max(D, (d) -> d.e)]
    @z.domain([0, d3.max(D, (d) -> d.e)])

    @space.selectAll(".tile")
      .data(D)
      .enter().append("rect")
      .attr("class", "tile")
      .attr("x", (d) => @x(d.k1-dk1/2))
      .attr("y", (d) => @y(d.k2+dk2/2))
      .attr("width", @x(dk1)-@x(0))
      .attr("height", @y(0)-@y(dk2))
      .style("fill", (d) => @z(d.e))
      #.style("stroke", "blue")



    #---- plot ----#

    @plot = @obj.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('width', width)
      .attr('height', height)
      .attr('id','plot')

    @plot.append("g")
      .attr("id","x-axis")
      .attr("class", "axis")
      .attr("transform", "translate(0, #{height+10})")
      .call(@xAxis)

    @plot.append("g")
      .attr("id","y-axis")
      .attr("class", "axis")
      .attr("transform", "translate(-10, 0)")
      .call(@yAxis)

    @plot.selectAll("dot")
      .data(@dd)
      .enter().append("circle")
      .attr("r", 5)
      .attr("cx", (d) => @x(d.x))
      .attr("cy", (d) => @y(d.y));

    @pline = d3.line()
      .x((d) => @x(d.x))
      .y((d) => @y(d.y))

    @plot.append("g")
      .append("path")
      .datum([{x:0,y:0},{x:1,y:1}])
      .attr("id", "poly")
      .attr("d", @pline)
      .style("stroke", "red")

    #@draw()

  update1: (k1) ->
    @k1 = k1
    @draw()

  update2: (k2) ->
    @k2 = k2
    @draw()

  draw:  ->

    # polynomial
    xp = linspace(0, 1, 100)
    yp = (@k1*x + @k2*x*x for x in xp)
    @dp = @d3Format(xp, yp) # format for d3

    #yk = dot(T(@A), [@k1, @k2]) # values at xd (fixme: factor out)
    yk = (@k1*x + @k2*x*x for x in @xd)


    @squareData = @squarify(@xd, @yd, yk)

    #@plot.append("path")
    #  .datum(@dp)
    #  .attr("class", "line")
    #  .attr("d", @pline)

    #@plot.selectAll(".ln")
    #  .data(@dp)
    #  .enter()
    #  .append("path")
    #  .attr("id", "poly")
    #  .attr("d", @pline)
    #  .style("stroke", "red")

    @plot.selectAll("#poly")
      #.data(@dp)
      .transition()
      .attr("d", @pline(@dp))
      .style("stroke", "green")
      .style("fill", "none")


    @plot.selectAll(".sq")
      .data(@squareData)
      .enter()
      .append("rect")
      .attr("class", "sq")
      .style("stroke", "blue")
      .style("fill", "none")
      .style("stroke-width", 1)

    @plot.selectAll(".sq")
      .data(@squareData)
      .transition()
      .attr("x", (d) => (d.x))
      .attr("y", (d) => (d.y))
      .attr("height", (d) => (d.e))
      .attr("width", (d) => (d.e))


  #d3.select(window).on 'keydown', (event) ->
  # console.log d3.event.key

  polyLeastSquares: (y) ->
    #A = pow(rep([2],x),T(rep([4],[1,2])))
    #AAT = dot(@A,T(@A))
    Ay = dot(@A,y)
    console.log "eqns", @AAT, Ay
    numeric.solve(@AAT,Ay)

  polyError: (k1, k2) ->
    norm(sub(dot(T(@A), [k1, k2]), @yd))



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

    @z = d3.scaleLinear()
      #.domain([0, 1])
      .range(["white", "steelblue"])

    @xAxis = d3.axisBottom()
      .scale(@x)

    @yAxis = d3.axisLeft()
      .scale(@y)


class Slider

  constructor: (@id, @change) ->
    @slider = $ "##{@id}"
    @sliderDisp = $ "##{@id}-value"
    @slider.unbind()  # needed to clear event handlers
    @slider.on "change", =>
      val = @val()
      @change val
      @sliderDisp.html(val)

  val: -> @slider.val()


plot = new Plot

new Slider "k1", (v) => plot.update1(v)
new Slider "k2", (v) => plot.update2(v)


#
#
#
