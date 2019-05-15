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

       
     
       
       .rollup(function (leaves) {
      
           return {
             'total_vics':  d3.sum(leaves, function (d) {
            
               return d.victims;
           }),
         'leaves': leaves
        }
       
       })
 
       .entries(data)


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
        return d.key
    })
    .enter()
    .append('g')
    .attr('class', 'group');


    var bar =groups
    
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


    console.log(nest);


var sample = nest.filter(function (d) {
    return d.key == 'Not Classified';
})
 
stackedBar(sample)


groups
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
   
   
    
   
   
   }


   var stackedBar = function (data) {
       console.log(data);

       var flat = {};  
       data.forEach(function (d) {
           flat = [{
               'rationale': d.key
           }]
           
           var leaf = d.value.leaves;
       
           leaf.forEach(function (l) {
        var t = {};
        var agency = l.agency;
       t[agency] = l.victims;
       
       flat.push(t);
          
           })

           console.log(flat)
        })
        var keys = [];

console.log(flat[0])



        var stacker = d3.stack()
        .keys(keys)(flat);

        console.log(stacker);

   };
   
   
   
  


   
   })();