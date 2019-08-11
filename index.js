var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

var margin = {top: 100, right: 20, bottom: 100, left: 100},
    width = 1560 - margin.left - margin.right,
    height = 530 - margin.top - margin.bottom;

d3.json(url, function(error, data) {
  data.monthlyVariance.forEach(function(d) {
    d.month -= 1;
    d.year = new Date((d.year-1).toString());
  });
  
  var minTemp = d3.min(data.monthlyVariance, function(d) {
    return d.variance;
  }) + data.baseTemperature;
  var maxTemp = d3.max(data.monthlyVariance, function(d) {
    return d.variance;
  }) + data.baseTemperature;
  
  var colors = d3.scaleQuantize()
    .domain([minTemp, maxTemp])
    .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", 
    "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);
  
  var xScale = d3.scaleTime().range([0, width])
    .domain([d3.min(data.monthlyVariance, function(d) {
    return d.year.setFullYear(d.year.getFullYear() - 1);
  }), d3.max(data.monthlyVariance, function(d) {
    return d.year.setFullYear(d.year.getFullYear() + 2);
  })]);
  
  var yScale = d3.scaleBand().range([0, height])
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) 
  
  var timeFormatX = d3.timeFormat("%Y");
  var xAxis = d3.axisBottom(xScale)
              .ticks(d3.timeYear.every(10))
              .tickFormat(timeFormatX);
  
  var timeFormatY = d3.timeFormat("%B");
  var yAxis = d3.axisLeft(yScale)
               .tickFormat(function(month){
               var date = new Date(0);
               date.setUTCMonth(month);
               return d3.utcFormat("%B")(date);
      })
                
  var tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'graph-svg-component')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
 
  svg.append('g')
    .attr('class', 'x axis')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')');
   
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .attr('id', 'y-axis');
  
  svg.append('text')
    .attr('x', -180)
    .attr('y', -80)
    .style('font-size', 18)
    .text('Months')
    .attr('transform', 'rotate(-90)');
  
  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', 380)
    .style('font-size', 18)
    .text('Years');
  
  svg.append('text')
    .attr('id','title')
    .attr('x', (width / 2))             
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')  
    .style('font-size', '30px') 
    .text('Monthly Global Land-Surface Temperature');
  
  svg.append('text')
    .attr('id','description')
    .attr('x', (width / 2))             
    .attr('y', 0 - (margin.top / 2) +25)
    .attr('text-anchor', 'middle')  
    .style('font-size', '20px') 
    .text('1753 - 2015: base temperature 8.66℃');
 
  svg.selectAll('.rect')
     .data(data.monthlyVariance)
     .enter()
     .append('rect')
     .attr('class', 'cell')
     .attr('x', function(d) { return xScale(d.year); })
     .attr('y', function(d) { return yScale(d.month); })
     .attr('width', 5)
     .attr('height', 25)
     .attr('data-year', function(d){
        return timeFormatX(d.year);
      })
     .attr('data-month', function(d){
        return d.month;
      })
     .attr('data-temp', function(d){
        return data.baseTemperature + d.variance;
      })
     .style('fill', (d)=>colors(data.baseTemperature + d.variance))
     .on('mouseover', function(d) {
          var date = new Date(timeFormatX(d.year), d.month)
          tooltip.style('opacity', 1);
          tooltip.style('left', d3.event.pageX + 10 + 'px')
            .style('top', (d3.event.pageY - 28) + 'px')
            .html(d3.timeFormat("%B %Y")(date) + '</br>' +
                 d3.format(".1f")(data.baseTemperature + d.variance)
                 + "&#8451;")
            .attr('data-year', timeFormatX(d.year));
        })  
    .on('mouseout', function(d) {
        tooltip.transition().style('opacity', 0)
        });
  
    var legend = svg.selectAll('.legend')                    
      .data(colors.range())                                 
      .enter()                                              
      .append('g') 
      .attr('id', 'legend')
      .attr('transform', function(d, i) {                    
            var width = 50;          
            var offset =  width * colors.domain().length / 2;    
            var vert = height + 70;                       
            var horz = i * width - offset + 50;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });
  
    legend.append('rect')                                     
      .attr('width', 50)                          
      .attr('height', 18)                         
      .style('fill', function(d, i) {
        return d;
      })                                   
      .style('stroke', function(d, i)  {
        return d;
      });
  
    var num = ([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8]);
    
    var scale = svg.selectAll('.scale')                   
      .data(num)                                 
      .enter()                                              
      .append('g') 
      .attr('transform', function(d, i) {                    
            var width = 50;          
            var offset =  width * colors.domain().length / 2;    
            var vert = height + 100;                       
            var horz = i * width - offset + 90;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });
  
    scale.append('text')                                     
      .text(function(d) { return d; }); 
  });
