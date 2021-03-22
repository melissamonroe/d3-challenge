var svgWidth = 1200;
var svgHeight = 600;

var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";

function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => +d[chosenXAxis]) * 0.1,
        d3.max(data, d => +d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;      
  }

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => +d[chosenYAxis]) * 0.1,
      d3.max(data, d => +d[chosenYAxis]) * 1.0
      ])
      .range([height, 0]);

  return yLinearScale;      
  };  

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  };
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  };      

  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  function updateText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textGroup.transition()
        .duration(1500)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    var circleLabels = chartGroup.selectAll("null")
        .enter()
        .append("text")
        .attr("fill","white")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(function (d) {
            return d.abbr })
        .attr("text-anchor", "middle")
        .attr("font-size", 12);

    return circleLabels;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    console.log(data);
    console.log([data]);
   
    // // parse data
    data.forEach(function(d) {
      data.poverty = +d.poverty;
      data.healthcare = +d.healthcare;
      data.obesity = +d.obesity;
      data.age = +d.age;
      data.smokes = +d.smokes;      
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([60, -60])
      .html(function(d) {
          return (`${d.state}<br>
            ${chosenXAxis}: ${d[chosenXAxis]}<br>
            ${chosenYAxis}: ${d[chosenYAxis]}<br>
            `);
          })
    chartGroup.call(toolTip);
          
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "green")
      .attr("opacity", ".5")
      .on('mouseover', toolTip.show)
      .on('mouseout', toolTip.hide);

    var circleLabels = chartGroup.selectAll("null")
        .data(data)
        .enter()
        .append("text")
        .attr("fill","white")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(function (d) {
            return d.abbr })
        .attr("text-anchor", "middle")
        .attr("font-size", 12);

    //Create group for two x-axis labels

    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var xLabelSpacer = 25;
    var povertyLabel = xLabelsGroup.append("text")
      .attr("value", "poverty") // value to grab for event listener
      .classed("axis-text", true)
      .classed("active", true)
      .text("In Poverty (%)")
      .attr("y", xLabelSpacer)
  
    var healthcareLabel = xLabelsGroup.append("text")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .text("Healthcare (%)")
      .attr("y", xLabelSpacer * 2)
    
    var incomeLabel = xLabelsGroup.append("text")
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Median Income")
      .attr("y", xLabelSpacer * 3)  

     var yLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(0, ${height /2}), rotate(-90)`)
      .attr("text-anchor", "middle");

    // append y axis
    var yLabelSpacer = 25;
    var smokesLabel = yLabelsGroup.append("text")
      .attr("value", "smokes") // value to grab for event listener
      .attr("y", 0 - 30 - yLabelSpacer)
      // .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("active", true)
      .classed("axis-text", true)
      .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
      .attr("value", "obesity") // value to grab for event listener
      .attr("y", 0 - 30 - yLabelSpacer*2)
      // .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Obesity (%)");          

    var ageLabel = yLabelsGroup.append("text")
      .attr("value", "age") // value to grab for event listener
      .attr("y", 0 - 30 - yLabelSpacer*3)
      // .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Median Age");           

    //x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          console.log(chosenXAxis)
  
          // updates x scale for new data
          xLinearScale = xScale(data, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          //renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) 
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
  
          // updates tooltips with new info
          //circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
          labelsGroup = updateText(circleLabels,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
  
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else if (chosenXAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
       }
     });

     yLabelsGroup.selectAll("text")
     .on("click", function() {
       console.log("yLabelsGroup Clicked"); 
       // get value of selection
       var value = d3.select(this).attr("value");
       if (value !== chosenYAxis) {
 
         // replaces chosenXAxis with value
         chosenYAxis = value;
 
         console.log(chosenYAxis)
 
         // updates x scale for new data
         yLinearScale = yScale(data, chosenYAxis);
 
         // updates x axis with transition
         yAxis = renderYAxes(yLinearScale, yAxis);
 
         // updates circles with new x values
         circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
 
         // updates tooltips with new info
         labelsGroup = updateText(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
 
         smokesLabel
           .classed("active", false)
           .classed("inactive", true);
         obesityLabel
           .classed("active", false)
           .classed("inactive", true);
         ageLabel
           .classed("active", false)
           .classed("inactive", true);

         // changes classes to change bold text
         if (chosenYAxis === "smokes") {
          smokesLabel
             .classed("active", true)
             .classed("inactive", false);
         }
         else if (chosenYAxis === "obesity") {
          obesityLabel
             .classed("active", true)
             .classed("inactive", false);
         }
         else if (chosenYAxis === "age") {
          ageLabel
             .classed("active", true)
             .classed("inactive", false);
         }
      }
    });     
  }).catch(function(error) {
    console.log(error);
  });