(function () {
    
    
    
    var data;
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

    svg.append("g")
    .attr("class", "y axis")
  
   

svg.append("g")
    .attr("class", "x axis")
    .attr(
     "transform",
     "translate(0," + (height ) + ")"
 )

    

    var timeColour = d3.scaleOrdinal(d3.schemeCategory20)
  //  .range(['#27647b']);
    
    
    var yScale = d3.scaleBand()
    .range([height, 0 ]);
    
    var xScale = d3.scaleLinear().range([0, width]);
    
 
    
 
    
    d3.csv('csv/vic_rationale.csv', function (d) {
 
       
        d.victims = +d.victims;
        return d;
    }, function(deaths_data) {
        console.log(deaths_data);
    
    
        data = deaths_data;

        data.sort(function (a, b) {
            return d3.ascending(a.victims, b.victims);
        })
     
     
            var nest = d3.nest()
            .key( function (d) { return d.rationale})
     
            
          
            
            .rollup(function (leaves) {
           
                return {
                  'total_vics':  d3.sum(leaves, function (d) {
                 
                    return d.victims;
                }),
              'leaves': leaves
             }
            
            })
      
            .entries(data)
     
    
        barChart(nest);
    
       
 
 
 
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
    
    
    
    var barChart = function(nest) {
    
 
 
 // total needs to be on top, to sort the data
 nest.forEach(function (d) {
  d.total = d.value.total_vics;
 })
 nest.sort(function (a, b) {
     return d3.ascending(a.total, b.total)
 })
 
 
 
        yScale.domain(nest.map(function (d) {
           
            return d.key
        })).padding(.1)
    
        xScale.domain([0, d3.max(nest, function (d ){
            return d.total
        })]);
    
   
 
     var groups = svg
     .selectAll('.group')
     .data(nest, function (d) {
        
         return d.key + d.total
     });

groups.exit().remove();

var new_groups = groups
     .enter()
     .append('g')
     .attr('class', 'group')
     .merge(groups)
 
 
     var rects = new_groups
     .append('rect')
     .attr('class', 'bar')
 
     .attr('x', 0)
     .attr('y', function (d) {

         return yScale(d.key)
     })
     .attr('height', yScale.bandwidth())
     .transition()
     .duration(740)
     .attr('width', function (d) {
     
         return xScale(d.total)
     })
     .attr('fill', '#A10C2E');


    new_groups
     .on('click', function (d) {
         stackedBar(nest, d.key);
     })
 
 
  

 
 new_groups
 .append('text')
 .attr('class', 'barlabel')
 .attr('x', 7)
 .attr('y', function (d) { return  yScale(d.key) + yScale.bandwidth() / 2 })
 //.attr("y", function(d){ return yScale(d.rationale) } )
 //.attr('dy', yScale.bandwidth() / 2)
 //.style('font-size', .4 * yScale.bandwidth())
 
 .attr('text-anchor', 'left')
 .text(function (d) { return d.total})
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
    
    svg.select('.y.axis')
    .transition()
 .call(d3.axisLeft(yScale)); 
 
 
 svg.select('.x.axis')
 .transition()
 .call(d3.axisBottom(xScale))
    
    }
 
 
    var stackedBar = function (data, key) {
    
      var filter =  data.filter(function (d) {
            return d.key == key;
        })
 
        var flat = [];
        filter.forEach(function (d) {
           var t = {
                'rationale': d.key
            }
            
            var leaf = d.value.leaves;
        
            leaf.forEach(function (l) {
       
         var agency = l.agency;
        t[agency] = l.victims;
      
           
            })
              
        flat.push(t);

         })


var keys = [];
     flat.forEach(function (f) {
         for (c in f) {
             if (c !== 'rationale') {
                keys.push(c);
             }
           
         }
     })


     var stack = d3.stack()
     .keys(keys)
     (flat);



    xScale.domain([0,				
        d3.max(stack, function(d) {
            
            return d3.max(d, function(it) {
               return it[1];
            });
        })
    ])


    yScale.domain([key]);


     var groups = svg
     .selectAll('.group')
     .data(stack, function (d) {
        
         return d;
     });

     groups.exit().remove();

     var new_groups = groups
     .enter()
     .append('g')
     .attr('class', 'group')
     .attr('fill', function (d) {
        return timeColour(d.key)
    })
    
.merge(groups);

/* 
new_groups
.append('rect')
.attr('class', 'bar')
.attr('x', 0)
.attr('y', function (d) { 
    // 
    return yScale(d[0].data.rationale)})

.attr('height',  yScale.bandwidth())
.attr('width', 0)

.transition()
.duration(750)
.attr('x', function (d) { return xScale(d[0][0])})
.attr('width', function (d) { return xScale(d[0][1]) -xScale (d[0][0])})

new_groups.selectAll('.bar')
.on('click', function (d) {
    barChart(data);
}) */

 var rects = new_groups
.selectAll('.bar')
.data(function (d) {
  
    return d;
});




rects
.enter()
.append('rect')
.attr('class', 'bar')
.attr('x', 0)
.attr('y', function (d) {console.log(d); return yScale(d.data.rationale)})

.attr('height',  yScale.bandwidth())
.attr('width', 0)
.merge(rects)
.transition()
.duration(750)
.attr('x', function (d) { return xScale(d[0])})
.attr('width', function (d) { return xScale(d[1]) -xScale (d[0])})

new_groups.selectAll('.bar')
.on('click', function (d) {
    barChart(data);
})

 




svg.select('.x.axis')
.transition()
.call(d3.axisBottom(xScale));

svg.select('.y.axis')
.transition()
.call(d3.axisLeft(yScale));

     
 
 

    };
    
    
    
   
 
 
    
    })();