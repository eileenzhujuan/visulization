/**
 * Created by Eileen on 2017/1/8.
 */
$(document).ready(function(){
    init()
});
var b = d3.rgb(255,0,0);    //红色
var a = d3.rgb(0,255,0);    //绿色

var compute = d3.interpolate(a,b);

function init(){
    var width  = 1000;
    var height = 1000;

    var svg = d3.select("#svg_map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,0)");

    var projection = d3.geo.mercator()
        .center([107, 31])
        .scale(850)
        .translate([width/2, height/2]);

    var path = d3.geo.path()
        .projection(projection);

    // d3.csv("data/2015_aqi_filter.csv", function(error,data){
    //     data_2015 = data
    //     console.log(data.length)
    //     console.log(data[0].city_name)
    // });

    d3.json("data/all_data.json", function(error, root) {

        if (error)
            return console.error(error);

        svg.selectAll("path")
            .data( root.features )
            .enter()
            .append("path")
            .attr("stroke","#000")
            .attr("stroke-width",1)
            .attr("fill", function(d,i){
                return compute(d.properties.aqi[1]/500);
            })
            .attr("d", path )
            .on("click",function(d,i) {   //点击时间
                console.log(d.properties.name);
            })
            .on("mouseover",function(d,i){   //鼠标悬浮
                // console.log(d.properties.name);
                // d3.select(this)
                //     .attr("fill","yellow");
            })
            .on("mouseout",function(d,i){   //鼠标移开
                // d3.select(this)
                //     .attr("fill",compute(d.properties.aqi[1]/500));
            });

    });
}

// 这是查询的接口，应该是查平均值显示，我这里只显示day_begin 的空气状况
function search(){
    var day_begin = $("#day_begin").val();
    var day_end = $("#day_end").val();
    console.log(day_begin + "," + day_end);
    d3.selectAll("path").attr("fill", function(d,i){
        // 这里有个问题，取均值时就卡死了
        // var show_val = 0;
        // for(var ii=day_begin; ii<=day_end;ii=ii+1){
        //     show_val += d.properties.aqi[ii];
        // }
        // show_val = show_val/(day_end + 1 - day_begin);
        // return compute(show_val/500);
        return compute(d.properties.aqi[day_begin]/500)
    })
}
