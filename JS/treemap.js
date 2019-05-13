//https://gerardnico.com/viz/d3/layout/treemap

(function () {

  var divWidth = document.getElementById('treemap').offsetWidth;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 },
   // width = 900,
   // height = 900,
    transitioning;
  var colours = d3.scaleOrdinal().range(['#27647b', '#ca3542', '#aecbc9', '#b49fad', '#57575f']);
var paddingAllowance = 2;

  var width = d3.select('#treemap').node().getBoundingClientRect().width;

  var height = d3.select('#treemap').node().getBoundingClientRect().height;
   // tooltip
   var tooltip = d3.select("body").append("div")   
   .attr("class", "tooltip")               
   .style("opacity", 0);

   var tooltipText = tooltip
   .append('p')
   .attr('class', 'tooltipText');



  // append the svg object to the body of the page
  var svg = d3.select("#treemap")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


  // to navigate the treemap
  var grandparent = svg.append("g")
    .attr("class", "grandparent");



  grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top)
    .attr("fill", '#bbbbbb');
  grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em")


  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  var xScale = d3.scaleLinear()
  .domain([0, width])
  .range([0, width]);
var yScale = d3.scaleLinear()
  .domain([0, height])
  .range([0, height]);

  var treemap = d3.treemap()
    .size([width, height])
    .round(true)
    .padding(1);

  d3.csv('csv/merged.csv', function (d) {
    d.victims = +d.victims;
    return d;
  }, function (data) {
    console.log(data);

    jsonfy(data);
  })



  var jsonfy = function (data) {


    data.forEach(function (d) {
      if (d.parent == "null") { d.parent = null };
      if (d.agency == '') { d.agency = null}
    });

    var treeData = d3.stratify()
      .id(function (d) { return d.name  })
      .parentId(function (d) { return d.parent })
      (data);


    treeData.each(function (d) {
      if ( ['Catholic', 'Protestant', 'Religion', 'Not Relevant'].includes( d.id)) {
        d.name = d.id;
      }
      else {
 
        d.name = d.parent.id + ', ' + d.id;
      }
    //  d.name = d.id;
    })
    
    var nodes = d3.hierarchy(treeData, function (d) {
      return d.children;
    })


    nodes.sum(function (d) { return d.data.victims })
      .sort(function (a, b) { return b.height - a.height || b.value - a.value; })
    nodes = treemap(nodes);


 display(nodes);

  }


 function display (tree) {


      grandparent
      .datum(tree.parent)
      .on("click", function (d ){
   
        return transition(d);
      })
      .select("text")
      .text(name(tree));

   var   g1 = svg.insert("g", ".grandparent")
      .datum(tree)
      .attr("class", "depth")
      .attr('width', width)
      .attr('height', height)
    
    var cell = g1.selectAll(".group")
      .data(tree.children)
      .enter().append("g")
      .attr('class', 'group')
    /*   .attr("transform", function (d) {
        console.log(d.y0)
        console.log(d.x0)
        return "translate(" + d.x0 + "," + d.y0 + ")";
      }) */

      cell.filter(function (d) {
        return d.children;
    })
        .classed("children", true)
        .on("click", function (d) {
         
          return transition(d);
        });
  var sub = cell.selectAll(".sub")
        .data(function (d) {
         
            return d.children  || [d];
        })
        .enter().append("g")
        .attr("class", "sub");

   var child = sub
        .append('rect')
        .attr('class', 'child')
        .attr("id", function (d) {
          return d.data.name;
        })
        .call(rect);



    /*     child.append("title")
      .text(function (d) {

        return d.parent.data.id + ', ' + d.data.id + "\n" + d.value;
      });
 */


      child.on('mouseenter', function (d) {
    
        tooltip.transition()        
            .duration(100)      
            .style("opacity", .9) 
            .style("left", (d3.event.pageX) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");


            tooltipText.text( d.parent.data.id + ', ' + d.data.id + "\n" + d.value);
        })                  
    .on("mouseout", function(d) {       
        tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);   
    });

 var labels =  sub

      .append('text')
      .attr('class', 'treeLabel')
      .call(text)
      .html(function (d, i) {
    
         return d.parent.data.id + ', ' +d.data.data.agency;;
       
      
      });


      d3.selectAll('.treeLabel')
      .call(wrap);
     
       


    

      /*   .attr("width", function (d) {
          return xScale(d.x1) - xScale(d.x0)
         
        })
        .attr("height", function (d) {
          return yScale(d.y1) - yScale(d.y0)
         
        })
        .attr('x', function (d) {
          return xScale(d.x0)
        
        })
        .attr('y', function (d) {
         return yScale(d.y0)
        }) */
       

    /* cell.append("rect")
      .attr("id", function (d) {
        return d.data.id;
      })
      .attr("width", function (d) {
        return d.x1 - d.x0;
      })
      .attr("height", function (d) {
        return d.y1 - d.y0;
      })
      .attr("fill", function (d) {
        var a = d.ancestors();

        return colours(a[a.length - 2].data.id);
      });

    cell.append("title")
      .text(function (d) {

        return d.parent.data.id + ', ' + d.data.id + "\n" + d.value;
      });
 */
var transition = function (data) {
  console.log(data);
  if (transitioning || !data) return;
  transitioning = true;
 
  var g2 = display(data);
  var t1 = g1.transition().duration(650);
  var t2 = g2.transition().duration(650);


  xScale.domain([data.x0, data.x1]);
  yScale.domain([data.y0, data.y1]);


  svg.selectAll(".depth").sort(function (a, b) {
    return a.depth - b.depth;

  });

  t1.selectAll("rect").call(rect);
  t2.selectAll("rect").call(rect);



    t1.selectAll(".treeLabel").call(text).style("fill-opacity", 0);
    t2.selectAll(".treeLabel").call(text).style("fill-opacity", 1)
    

   
    
  

    t1.on("end.remove", function(){
      this.remove();
      transitioning = false;
      t2.selectAll('.treeLabel').call(wrap)
  });


 // t2.selectAll('.treeLabel').call(wrap)


}
return cell;

}


function text(text) {
  text.attr("x", function (d) {
    
      return xScale(d.x0) + 3;
  })
      .attr("y", function (d) {
          return yScale(d.y0) + 15;
      });
}

var rect =function(rect) {
  rect
      .attr("x", function (d) {
          return xScale(d.x0);
      })
      .attr("y", function (d) {
          return yScale(d.y0);
      })
      .attr("width", function (d) {
          return xScale(d.x1) - xScale(d.x0);
      })
      .attr("height", function (d) {
          return yScale(d.y1) - yScale(d.y0);
      })
      .attr("fill", function (d) {
       
          return colours(d.ancestors()[0].parent.data.id);
      })
    
}


  


})();


function name(d) {
  return breadcrumbs(d) +
    (d.parent
      ? " -  Click to zoom out"
      : " - Click inside square to zoom in");
}


function breadcrumbs(d) {
  var res = "";
  var sep = " > ";
  d.ancestors().reverse().forEach(function (i) {
    res += i.data.name + sep;
  });
  return res
    .split(sep)
    .filter(function (i) {
      return i !== "";
    })
    .join(sep);



}






function wrap(text ){
  text.each(function () {
    text = this;
var textnode = text.getBoundingClientRect();



 
  var p = text.parentNode.childNodes[0].getBoundingClientRect();

  if (textnode.width > p.width | textnode.height > p.height) {

    text.style.visibility = 'hidden';
  } 

  else {
    text.style.visibility = 'visible';
  }

})
}
