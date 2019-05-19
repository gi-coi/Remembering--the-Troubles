(function () {
    
   // Building blocks
   
// data will be assigned to this variable once it's loaded
var data;
/*  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); */



// dimensions will depend on the parent div
var width = document.getElementById('deathTimeline').clientWidth;

 var height = document.getElementById('deathTimeline').clientHeight;

var margin = {top: 50, bottom: 50, left: 50, right: 50};



// will contain the circle and text for the tooltip
var focus;



var svg = d3.select('#deathTimeline')
.append('svg')
.attr('width', width)
.attr('height', height)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top +')')



// voronoi for overlay - will make the tooltip work
var voronoi = d3.voronoi()
    .x(function(d) {
        return xScale(d.year);
    })
    .y(function(d) {
        return yScale(d.victims);
    })
    .extent([
        [-margin.left, -margin.top],
        [width + margin.right, height + margin.bottom]
    ]);


width = width - margin.left - margin.right;


height = height - margin.top - margin.bottom;


var xScale = d3.scaleTime()
.range([0, width ]);

var yScale = d3.scaleLinear().range([height, 0]);

var lineGen = d3.line()
.x(function (d) {
    return xScale(d.year)
})
.y(function (d) {
    return yScale(d.victims)
})
.curve(d3.curveMonotoneX) // smooth line


var areaGen = d3.area()
.curve(d3.curveMonotoneX)
    .x(function(d) { return xScale(d.year); })
    .y0(height)
    .y1(function(d) { return yScale(d.victims); }); // area fill under the line




// group with circle and tooltip, to display data on hover
// from https://bl.ocks.org/martinjc/980a2fcdbf0653c301dc2fb52750b0d9
var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");


    focus.append("circle")
        .attr("r", 7.5)
        .style('fill', '#fff')
        .style('stroke', '#A10C2E')

    focus.append("text")
        .attr("x", 15)
      	.attr("dy", ".31em");



var parseTime = d3.timeParse("%Y")
    bisectDate = d3.bisector(function(d) { return d.year; }).left;

d3.csv('csv/deaths_by_year.csv', function (d) {
    d.deaths = 'deaths';
    d.year = parseTime(d.year);
    d.victims = +d.victims;
    return d;
}, function(deaths_data) {

  // console.log(deaths_data);


    data = deaths_data;


    // generate line chart
    lineChart(deaths_data);

    svg.append("g")
                .attr("class", "x axis")
                .attr(
                    "transform",
                    "translate(0," + (height ) + ")"
                )
                .call(d3.axisBottom(xScale));

            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(yScale));
})



var lineChart = function(data) {


    xScale.domain(d3.extent(data, function (d) {
        return d.year
    }));

    yScale.domain([0, d3.max(data, function (d ){
        return d.victims
    })]);

// generate area for the line chart
    svg
    .append('path')
    .data([data])
    .attr('class', 'area')
    .attr('d', areaGen)
    .attr('fill', 'rgba(161, 12, 46, 0.49)')


// path for line chart
    svg
    .append('path')
    .data([data])
    .attr('class', 'line')
   
    .attr('d', lineGen)
    .call(transition)
    .attr('stroke', '#A10C2E')
    .attr('fill', 'none');
    
    


     
// overlay for mouseover
    var v = svg.selectAll(".voronoi")
        .data(voronoi.polygons(data));

    v.enter()
        .append("path")
        .attr("d", function(d, i) {
            return d ? "M" + d.join("L") + "Z" : null;
        })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);



        focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

 


    focus.append("circle")
        .attr("r", 7.5)
        .style('fill', '#fff')
        .style('stroke', '#A10C2E')

    focus.append("text")
        .attr("x", 15)
      	.attr("dy", ".31em");


}


// adapted from https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3

function mousemove() {
    // moves the circle w/ tooltip
      var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + xScale(d.year) + "," + yScale(d.victims) + ")");
      focus.select("text").text(function() { return d.victims; });
    }



// smooth line transition 
function transition(path) {
        path.transition()
            .duration(2000)
            .attrTween("stroke-dasharray", tweenDash);
    }
    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }

})();