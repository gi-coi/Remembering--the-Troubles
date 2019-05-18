(function () {



    var width;
    var height;
    var svg;
    var g;


    // colour scale for the choropleth
    var colours = d3.scaleSequential(d3.interpolateYlOrRd);

    // map elements - projection, path
    var projection;


    var path;


    // variable names for deaths data and boundary data
    var death_data;
    var boundaries;



    var parseTime = d3.timeParse("%Y");


    // legend
    var legend;
    var legendWidth = 200;


    // tooltip on hover
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var tooltipText = tooltip
        .append('p')
        .attr('class', 'tooltipText');



    var mp = d3.map();


    // function that draws and updates the map
    var draw = function (boundary) {


        projection
            .scale(1)
            .translate([0, 0]);


        // get the data filtered by year

        var filter = yearFilter(death_data);


        var year = d3.select('.parameter-value text').node().textContent;

        // check if there is data for the year
        if (filter.length == 0) {
            // handle missing data
            d3.select('text.warning').text('No data available for ' + year)
        }

        // start plotting
        else {
            // show a caption with the year
            d3.select('text.warning').text('Year: ' + year)




            mp.clear();
            filter.forEach(function (d) {
                mp.set(String(d.location_name), +d.victims);

            })





            // generates path and scales projection
            var b = path.bounds(topojson.feature(boundary, boundary.objects['wpc']));
            var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
            var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
            projection
                .scale(s)
                .translate(t);



            // bind data for areas
            var areas = g.selectAll(".area")
                .data(topojson.feature(boundary, boundary.objects['wpc']).features)/* , function (d) {
                   
                    d.properties.year = filter[0].year;
                    return d.properties.year;
                }); */


            areas.exit().remove();
            areas
                .enter()
                .append("path")
                .attr("class", "area")
                .merge(areas)
                .attr("fill", function (d) {
                    if (mp.get(d.properties.PC_NAME) == undefined) {

                        // if there is no data for an area, set the no. of victims to 0 and return gray shade
                        d.properties.victims = 0;
                        return '#e3e3e3'
                    }
                    else {

                        // retrieve victims based on the key-value pairs created previously
                        return colours(d.properties.victims = mp.get(d.properties.PC_NAME))
                    }
                    /* console.log(mp.get(d.properties.PC_NAME))
                      return colours(d.properties.victims = mp.get(d.properties.PC_NAME)) ? colours(d.properties.victims = mp.get(d.properties.PC_NAME) ) : 'gray';  */
                })
                .on('mouseenter', function (d) {
                    // tooltip on map
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", .9)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

                    // format names of local authorities
                    tooltipText.html(capitaliser(d.properties.PC_NAME) + '<br>' + d.properties.victims)
                })


                .attr("id", function (d) { return d.properties.OBJECTID; })
                .attr("d", path)




            /* .on('mousedown', function (d) {
                console.log(d);
                return clicked(d);
            }); */



         

        }




    }


    var init = function () {
        width = document.getElementById('mapVis').clientWidth;

        height = document.getElementById('mapVis').clientHeight;

        svg = d3.select("#mapVis")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        g = svg.append("g");


        projection = d3.geoAlbers()
            .rotate([0, 0]);
        path = d3.geoPath()
            .projection(projection);





        // geoJSON https://martinjc.github.io/UK-GeoJSON/
        d3.queue()
            .defer(d3.json, "map_data/topo_wpc.json")
            .defer(d3.csv, 'csv/deaths_ni.csv')
            .await(function (error, boundary_data, d_data) {
                d_data.forEach(function (d) {

                    d.location_name = (d.location_name).toUpperCase(); // like JSON file
                    d.year = parseTime(d.year);
                    d.victims = +d.victims;
                })


                death_data = d_data;
                boundaries = boundary_data;


                // append a slider with the years
                appendSlider(death_data);


                /* document.getElementById('yearSlider').addEventListener('change', function() {
                        draw(boundaries);
                    }) */


                // append hue legend
                legend = svg.append("g").attr("class", "legend").attr("transform", "translate(20,20)");
                legend.append('g').attr('transform', 'translate(0,' + 30 + ')').attr('class', 'x axis');
                legend.append("text")
                    .attr("transform",
                        "translate(" + (legendWidth / 2) + " ," +
                        (60) + ")")
                    .style("text-anchor", "middle")
                    .style('font-size', 10)
                    .text("Deaths");

                    draw_legend(death_data);

                // set the colour scale (it won't change)
                min = d3.min(death_data, function (d) {
                    return +d.victims
                })

                max = d3.max(death_data, function (d) {
                    return +d.victims
                })



                colours.domain([min, max]);



                draw(boundary_data);






            })




    }();



    var draw_legend = function (data) {
        // legend changes depending on year
        // otherwise it wouldn't show relative differences
        var legData = []

        for (var i = 1; i < data.length; i+= 10) {
            // extract values from data      
            legData.push(+(data[i]['victims']))
        }

        /*     colours.domain([d3.min(legData, function (d) {
                return d;
            }), d3.max(legData, function (d) {
                return d;
            })]) */

        colours.domain(d3.extent(legData));

        // to establish number of rectangles that will make up the legend
        var sections = legData.length;
        var sectionWidth = Math.floor(legendWidth / sections);


        legData.sort(function (x, y) {
            return d3.ascending(x, y);
        })

        // create scale to line up the rects
        // for some reason it didn't work using (d, i)
        var indices = []

        for (var i = 0; i < legData.length; i++) {
            indices.push(String(i));
        }
        // scale for gue legend
        var xScale = d3.scaleBand()
            .range([0, legendWidth])
            .domain(indices)
            .paddingInner(0);



        // update number and fill colour of rectangles
        var rects = legend.selectAll('rect')
            .data(legData);

        rects.exit().remove();

        rects
            .enter()
            .append('rect')
            .merge(rects)

            .attr('x', function (d, i) { return xScale(i) })
            .attr('y', 10)
            .attr('height', 20)
            .attr('width', 0)
            .transition()
            .duration(700)
            .attr('width', sectionWidth)

            .attr('fill', function (d) { return colours(d) });



        // add numbers to legend
        var linearS = d3.scaleLinear()
            .range([0, legendWidth])
            .domain(d3.extent(legData, function (d) {
                return d;
            }));
        legend.select('.x.axis').transition().duration(700).call(d3.axisBottom(linearS)
            .ticks(3)
            .tickFormat(d3.format('.0f'))
            .tickSize(2)
        );

    }


    var appendSlider = function (data) {
        // slider to toggle year and change map
        // adapted from https://flaviocopes.com/how-to-uppercase-first-letter-javascript/

        var minYear = d3.min(data, function (d) {
            return d.year;
        })

        var maxYear = d3.max(data, function (d) {
            return d.year;
        })

        var sliderWidth = 300;

        var slider = d3
            .sliderBottom()
            .min(minYear)
            .max(maxYear)
            .width(sliderWidth)
            .ticks(5)
            .default(minYear)
            .tickFormat(d3.timeFormat('%Y'))
            .step(1)

            .on('onchange', function (d) {
                // draw map when the value on the slider changes
                draw(boundaries);
            });


        // append slider to group
        var legendG = d3
            .select('#slider')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');

        legendG.call(slider);


        // caption : indicates year, or if data is missing
        legendG.append('g')
            .attr('class', 'warning')
            .attr('transform', 'translate(' + sliderWidth / 2 + ', 65)')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('class', 'warning');
    }


    // INITIAL FUNCTION FOR SLIDER - USED INPUT 
    /* var appendSlider = function (data) {
    
    
    var minYear = d3.min(data, function (d) {
        return d.year;
    })
    
    var maxYear = d3.max(data, function (d) {
        return d.year;
    })
          d3.select('#mapVis')
          .insert('g', 'svg')
        .attr('class', 'filterGroup')
          .append('input')
          
      
          .attr('type', 'range')
         
          .attr('id', 'yearSlider')
        
          .attr('min', minYear)
          .attr('max', maxYear)
          .attr('value', minYear);
    
    
          d3.select('.filterGroup')
          .append('g')
          .attr('transform', 'translate(' + 10 + ',' + 15 + ')')
          .append('text')
          .text(minYear)
    
    
     
    
    
          // p element to show errors (e.g. if no victims in a year)
    
          d3.select('.filterGroup')
          .append('p')
          .attr('class', 'warning');
          
         
       
      } */


    var yearFilter = function (data) {
        // Called when slider changes
        var year = d3.select('.parameter-value text').node().textContent;

        var new_data = data.filter(function (d) {
            return d.year.getFullYear() == year;
        })
        return new_data;
    }


})();


var capitaliser = function (string) {

    // used to format strings in tooltip;
    // returns capitalised string, except for "and"
    var split = string.split(' ');
    for (i = 0; i < split.length; i++) {
        if (split[i] == 'AND') {
            split[i] = split[i].toLowerCase();
        }
        else {
            split[i] = split[i][0].toUpperCase() + split[i].slice(1).toLowerCase();
        }


    }

    var new_str = split.join(' ');
    return new_str;


}