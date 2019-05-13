(function () {var data;
 /*    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
   var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); */

   var width = d3.select('#top10').node().getBoundingClientRect().width;

   var height = d3.select('#top10').node().getBoundingClientRect().height;
   
   var margin = {top: 50, bottom: 50, left: 160, right: 50};
   
   var displayed;
   var svg = d3.select('#top10')
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
   

   var parseTime = d3.timeParse("%Y")

   var colours = d3.scaleOrdinal().range(['#27647b', '#ca3542', '#aecbc9', '#b49fad', '#57575f']);


   
   d3.csv('csv/top10_fatality.csv', function (d) {

       d.year = parseTime(d.year);
       d.victims = +d.victims;
       return d;
   }, function(deaths_data) {
       console.log(deaths_data);
   
   
       data = deaths_data
   
       barChart(deaths_data);


    var altScale = d3.scaleBand()
    .domain([height, 0])
    .range(data.map(function (d) { 
        return d.location_name + ' ' + d.year;
    }));
     
   
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


   })
   
   
   
   var barChart = function(data) {
   
   data.sort(function (a, b) {
       return d3.ascending(a.victims, b.victims);
   })
       var nest = d3.nest()
       .key( function (d) { return d.location_name})
       .entries(data);
   
       console.log(nest)
   
       yScale.domain(data.map(function (d) {
          
           return d.location_name + ' ' + d.year.getFullYear()
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


    groups
    .selectAll('.bar')
    .data(function (d) {
         return d.values
    })
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', function (d) {
        return yScale(d.location_name + ' ' + d.year.getFullYear())
    })
    .attr('height', yScale.bandwidth())
    .transition()
    .duration(740)
    .attr('width', function (d) {
        return xScale(d.victims)
    })
    .attr('fill', function (d) {
        
        return colours(d.context)
    });

    groups
    .on('click', function (d) {
        
        var bar = d3.select(this);
        if (bar.classed('selected')) {
            displayed = false;
            d3.select('#top10_story').classed('invisible', true);
            bar.classed('selected', false);           
        }
        else {
            if (displayed) {
                svg.selectAll('.group').classed('selected', false);
                bar.classed('selected', true);
                d3.select('#top10_story h2')
                .text(d.values[0].story_title)
               d3.select('#top10_story p')
                 .html(d.values[0].story)
             
            } else {
                bar.classed('selected', true);
                d3.select('#top10_story').classed('invisible', false);
                d3.select('#top10_story h2')
                .text(d.values[0].story_title)
              
               d3.select('#top10_story p')
                 .html(d.values[0].story)
                 displayed = true;
            }
           
        }
        
 
    })
    groups
    .selectAll('.barlabel')
           .data(function (d) {
               return d.values
           })
           .enter()
    .append('text')
    .attr('class', 'barlabel')
    .attr('x', 7)
 
    .attr("y", function(d){ return yScale(d.location_name + ' ' + d.year.getFullYear()) + yScale.bandwidth() / 2 } )

    //.style('font-size', .4 * yScale.bandwidth())
    
    .attr('text-anchor', 'left')
    .text(function (d) { return d.victims});
     



   
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