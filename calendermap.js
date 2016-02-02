var width = 900,
    height = 105,
    cellSize = 12; // cell size
    week_days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

var formatSub = d3.time.format("%Y-%m-%d");

var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
	  format = function(d){ return [formatSub(d[0]), d[1]]},
	  parseDate = d3.time.format("%Y-%m-%d").parse;

// converts is back to date string
// check this in init code

var color = d3.scale.linear().range(["white", '#002b53'])
    .domain([0, 1])

var svg = d3.select(".calender-map").selectAll("svg")
    .data([[2013, 't1'], [2013, 't2'], [2013, 't3'] ])
  .enter().append("svg")
    .attr("width", '100%')
    .attr("data-height", '0.5678')
    .attr("viewBox",'0 0 900 105')
    .attr("class", "RdYlGn")
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-38," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d[1]; });

for (var i=0; i<7; i++)
{
svg.append("text")
    .attr("transform", "translate(-5," + cellSize*(i+1) + ")")
    .style("text-anchor", "end")
    .attr("dy", "-.25em")
    .text(function(d) { return week_days[i]; }); 
}

function mkDateList(data) {
//    console.log( d3.time.days(new Date(data[0], 0, 1), new Date(data[0] + 1, 0, 1)) );
    dates = d3.time.days(new Date(data[0], 0, 1), new Date(data[0] + 1, 0, 1));
    var ret = [];
    for (i = 0; i < dates.length; i++) {
        ret.push([dates[i], data[1]]);
    }
//     for (d in dates) {
// //        console.log(d);
        
    //     }
    //console.log(ret);
    return ret;
}

//console.log('here0');

var rect = svg.selectAll(".day")
    .data(function(d) { return mkDateList(d); })
  .enter()
	.append("rect")
    .attr("class", "day")
    .attr("mylabel", "test")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d[0]) * cellSize; })
    .attr("y", function(d) { return day(d[0]) * cellSize; })
    .attr("fill",'#fff')
    .datum(format);

//console.log('here1');

var legend = svg.selectAll(".legend")
      .data(month)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (((i+1) * 50)+8) + ",0)"; });

legend.append("text")
   .attr("class", function(d,i){ return month[i] })
   .style("text-anchor", "end")
   .attr("dy", "-.25em")
   .text(function(d,i){ return month[i] });

svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d[0], 0, 1), new Date(d[0] + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr('stroke', 'red')
    .attr('stroke-width', 1)
    .attr("id", function(d,i){ return month[i] })
    .attr("d", monthPath);

// make json dict of date:dataset:val
d3.json("testDiscard.json", function(error, json) {

  // csv.forEach(function(d) {
  //   d.Comparison_Type = parseInt(d.Comparison_Type);
  // });

    // max over all vals
    var Comparison_Type_Max = 0;
    for (dateObj in json) {
        for (dataObj in json[dateObj]) {
            Comparison_Type_Max = d3.max( [Comparison_Type_Max, json[dateObj][dataObj]] );
        }
    }
    for (dateObj in json) {
        for (dataObj in json[dateObj]) {
            json[dateObj][dataObj] = [json[dateObj][dataObj]/Comparison_Type_Max, json[dateObj][dataObj]];
        }
    }

// var Comparison_Type_Max = d3.max(json, function(d) { return d.Comparison_Type; });

//    console.log(csv);

  // var data = d3.nest()
  //   .key(function(d) { return d.Date; })
  //     .rollup(function(d) { return  Math.sqrt(d[0].Comparison_Type / Comparison_Type_Max); })
  //   .map(csv);

    //    console.log(data);
    //data is dict of 20110101:sqrtVal

    // data is {date:dataset:val}
    rect.filter(function(d) { return d[0] in json && d[1] in json[d[0]]; })
        .attr("fill", function(d) { return color(json[d[0]][d[1]][0]); })
	  .attr("data-title", function(d) { return "value : "+json[d[0]][d[1]][1]});
	$("rect").tooltip({container: 'body', html: true, placement:'top'});
});

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function monthPath(t0) {
    // console.log('here');
//    console.log(t0);
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}
