/* (function () {var data;
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
   var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
   
   var margin = {top: 50, bottom: 50, left: 50, right: 50};
   
   
   var svg = d3.select('#circlesChart')
   .append('svg')
   .attr('width', width)
   .attr('height', height)
   .append('g')
   .attr('transform', 'translate(' + margin.left + ',' + margin.top +')')
   
   

   
   width = width - margin.left - margin.right;
   
   var fills = d3.scaleOrdinal(d3.schemeCategory10);
   height = height - margin.top - margin.bottom;
   var timeColour = d3.scaleOrdinal()
   .range(['#27647b']);
   
   
   var xScale = d3.scaleBand()
   .range([0, width ]);
   
   var yScale = d3.scaleLinear().range([height, 0]);
   

   var parseTime = d3.timeParse("%Y")

   var colours = d3.scaleOrdinal().range(['#27647b', '#ca3542', '#aecbc9', '#b49fad', '#57575f']);

   d3.csv('victims_location.csv', function(d) {
       d.victims = +d.victims;
       return d;
   }, function (data) {
       console.log(data);

       circles(data);
   })
   

  
   

   var circles = function(data) {

    var root = d3.hierarchy(data).sum(function (d) { return d.victims});
    console.log(root)
    console.log(root.leaves())


    var treelayout = d3.tree()

    treelayout.size([width, height]);

    treelayout(root);


    var tree = svg.selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node');

tree.append('circle')
.attr('class', 'solid')
.attr('cx', function (d) {console.log(d); return d.y})
.attr('cy', function (d) { return d.y})
.attr('r', 14)
.style('fill', 'red');



   }
   })(); */