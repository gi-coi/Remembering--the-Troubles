(function () {var data;
   /*  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
   var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); */


   var width = d3.select('#deathCauses').node().getBoundingClientRect().width;

 var height = d3.select('#deathCauses').node().getBoundingClientRect().height;
   
   var margin = {top: 50, bottom: 50, left: 120, right: 50};
   

   var svg = d3.select('#deathCauses')
   .append('svg')
   .attr('width', width)
   .attr('height', height)
   .append('g')
   .attr('transform', 'translate(' + margin.left + ',' + margin.top +')')
   
   

   
   width = width - margin.left - margin.right;
   
   
   height = height - margin.top - margin.bottom;
   var timeColour = d3.scaleOrdinal()
   .range(['#27647b']);
   
   
   var yScale = d3.scaleBand()
   .range([height, 0 ]);
   
   var xScale = d3.scaleLinear().range([0, width]);
   

   

   
   d3.csv('csv/vic_rationale.csv', function (d) {

      
       d.victims = +d.victims;
       return d;
   }, function(deaths_data) {
       console.log(deaths_data);
   
   
       data = deaths_data
   
       barChart(deaths_data);
   
       svg.append("g")
                   .attr("class", "y axis")
                 
                   .call(d3.axisLeft(yScale));
   
               svg.append("g")
                   .attr("class", "x axis")
                   .attr(
                    "transform",
                    "translate(0," + (height ) + ")"
                )
                   .call(d3.axisBottom(xScale));



    // axis labels

    svg.append("text")             
    .attr("transform",
          "translate(" + (width / 2) + " ," + 
                         (height + margin.bottom) + ")")
    .style("text-anchor", "middle")
    .attr('class', 'x axisLabel')
    .text("Victims");


  /*   svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr('class', 'y axisLabel')
    .text("Groups");
 */
   })
   
   
   
   var barChart = function(data) {
   
   data.sort(function (a, b) {
       return d3.ascending(a.victims, b.victims);
   })


       var nest = d3.nest()
       .key( function (d) { return d.rationale})
       .entries(data);
   
       console.log(nest)
   
       yScale.domain(data.map(function (d) {
          
           return d.rationale
       })).padding(.1)
   
       xScale.domain([0, d3.max(data, function (d ){
           return d.victims
       })]);
   
  

    var groups = svg
    .selectAll('.group')
    .data(nest, function (d) {
        return d.key
    })
    .enter()
    .append('g')
    .attr('class', 'group');


    var bar =groups
    .selectAll('.bar')
    .data(function (d) {
         return d.values
    })
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', function (d) {
        return yScale(d.rationale)
    })
    .attr('height', yScale.bandwidth())
    .transition()
    .duration(740)
    .attr('width', function (d) {
        return xScale(d.victims)
    })
    .attr('fill', '#A10C2E');
     
  var barWidth = height / data.length;     
groups
.selectAll('.barlabel')
       .data(function (d) {
           return d.values
       })
       .enter()
.append('text')
.attr('class', 'barlabel')
.attr('x', 7)
.attr('y', function (d) { return  yScale(d.rationale) + yScale.bandwidth() / 2 })
//.attr("y", function(d){ return yScale(d.rationale) } )
//.attr('dy', yScale.bandwidth() / 2)
//.style('font-size', .4 * yScale.bandwidth())

.attr('text-anchor', 'left')
.text(function (d) { return d.victims})
//.style('stroke', '#fff')

/*        groups
       .selectAll('.label')
       .data(function (d) {
           return d.values
       })
       .enter()
       .append('text')
       .attr('class', 'label')
       .attr("x", function (d) {
           return xScale(d.victims)
       })
  .attr("y", function(d){ return yScale(d.rationale) } )
  .attr("dx", -10)
  .attr("dy", "1.6em")
  .attr("text-anchor", "end")
       .text(function (d, ) {
           return d.victims
       })
        */
   
   
    
   
   
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