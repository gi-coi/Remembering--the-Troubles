(function () {var data;
/*  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); */


var width = document.getElementById('deathTimeline').clientWidth;

 var height = document.getElementById('deathTimeline').clientHeight;

var margin = {top: 50, bottom: 50, left: 50, right: 50};


var focus;

var svg = d3.select('#deathTimeline')
.append('svg')
.attr('width', width)
.attr('height', height)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top +')')


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
var timeColour = d3.scaleOrdinal()
.range(['#27647b']);


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
.curve(d3.curveMonotoneX)


var areaGen = d3.area()
.curve(d3.curveMonotoneX)
    .x(function(d) { return xScale(d.year); })
    .y0(height)
    .y1(function(d) { return yScale(d.victims); });


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
    console.log(deaths_data);


    data = deaths_data

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


    var nest = d3.nest()
    .key( function (d) { return d.deaths})
    .entries(data);

    console.log(nest)

    xScale.domain(d3.extent(data, function (d) {
        return d.year
    }));

    yScale.domain([0, d3.max(data, function (d ){
        return d.victims
    })]);


    svg
    .append('path')
    .data([data])
    .attr('class', 'area')
   
    .attr('d', areaGen)
    .attr('fill', 'rgba(161, 12, 46, 0.49)')

    svg
    .append('path')
    .data([data])
    .attr('class', 'line')
   
    .attr('d', function (d) {
       
        return lineGen(d);
    })
    .call(transition)
    .attr('stroke', '#A10C2E')
    .attr('fill', 'none');
    
    


     

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




function mousemove() {
      var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + xScale(d.year) + "," + yScale(d.victims) + ")");
      focus.select("text").text(function() { return d.victims; });
      focus.select(".x-hover-line").attr("y2", height - yScale(d.victims));
      focus.select(".y-hover-line").attr("x2", width + width);
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