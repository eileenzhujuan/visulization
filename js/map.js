/**
 * Created by Eileen on 2017/1/8.
 */

$(document).ready(function(){
    init_select();
    loadDateTime("day_begin", "day_end");
    init();
});
var b = d3.rgb(255,0,0);    //红色
var a = d3.rgb(255,255,255);    //绿色

var compute = d3.interpolate(a,b);
var day_begin = new Date("2015-01-02");
var day_end = new Date("2015-01-02");

var city_selected=new Array();

var tooltip = d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .style("opacity",0.0);

function init(){
    var width  = $('#svg_map').width();
    var height = $('#svg_map').height();

    var svg = d3.select("#svg_map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,0)");
    //tianmin 随窗口自适应高度
    var center_x=104;
    var center_y=37;
    var scale=0.9*width;
    if (height<width*0.85) scale=1.05*height;
    var projection = d3.geoMercator()
        .center([center_x,center_y])
        .scale(scale)
        .translate([width/2, height/2]);
    //tianmin

    var path = d3.geoPath()
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
            .attr("id",function(d,i){
                return d.properties.id+'path';
            })
            .attr("stroke","#000")
            .attr("stroke-width",0.2)
            .attr("fill", function(d,i){
                return compute(+d.properties.aqi[0]/500);
            })
            .attr("d", path )
            .on("click",function(d,i) {   //点击事件
                //console.log(d.properties.name);
                //tianmin
                var id_current=city_selected.indexOf(d.properties.id);
                if (id_current==-1){
                    city_selected.push(d.properties.id);
                    console.log(d.properties.name);
                    console.log("添加");
                    d3.select(this)
                        .attr("stroke","green")
                        .attr("stroke-width",2);
                }
                else{
                    city_selected.splice(id_current,1);
                    console.log(d.properties.name);
                    console.log("删除");
                    d3.select(this)
                        .attr("stroke","#000")
                        .attr("stroke-width",0.1);
                }
                console.log(city_selected);
                update_select();
                Try.init(city_selected,day_begin,day_end);
                //tianmin
            })
            .on("mouseover",function(d,i){   //鼠标悬浮
                //console.log(d.properties.name);
                var id_current=city_selected.indexOf(d.properties.id);
                if (id_current==-1){
                    d3.select(this)
                        .attr("stroke","orange")
                        .attr("stroke-width",2);
                }
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity",1.0)
                    .text(d.properties.name);
            })
            .on("mouseout",function(d,i){   //鼠标移开
                var id_current=city_selected.indexOf(d.properties.id);
                if (id_current==-1){
                    d3.select(this)
                        .attr("stroke","#000")
                        .attr("stroke-width",0.1);
                }
                tooltip.style("opacity",0.0);
            });

    });
}

function map_update(id){
    $('#'+id+'path').css("stroke","#000");
    $('#'+id+'path').css("stroke-width",0.1);
}

// 这是查询的接口，应该是查平均值显示，我这里只显示day_begin 的空气状况
function search(){
    var day_origin = new Date("2015-01-02");
    day_begin = new Date($("#day_begin").val());
    day_end = new Date($("#day_end").val());
    var num_begin = (day_begin - day_origin)/(60*60*24*1000);
    var num_end = (day_end - day_origin)/(60*60*24*1000) + 1;
    console.log(num_begin + ", " + num_end);
    if(num_begin<0 || num_end<0 || num_begin>730 || num_end>730 || num_end<=num_begin){
        alert("日期选择错误，应为2015年01月02日至2016年12月31日之间的数据，且结束日期不得早于开始日期")
    }
    else {
        d3.selectAll("path").attr("fill", function (d, i) {
            var show_val = 0;
            for (var ii = num_begin; ii < num_end; ii = ii + 1) {
                show_val += +d.properties.aqi[ii];
            }
            show_val = show_val / (num_end - num_begin);
            return compute(show_val / 500);
        })
        Try.init(city_selected,day_begin,day_end);
    }
}


function loadDateTime(start, end){
    var checkin = $('#'+start).datepicker({
        format: 'yyyy-mm-dd',
        onRender: function(date) {
            if(date.valueOf() < (new Date('2015-01-01')).valueOf() || date.valueOf() > (new Date('2016-12-31')).valueOf()){
                return 'disabled';
            }
            else{
                return '' ;
            }
        },
        parseFormat: function(format){
            return {separator: separator, parts: parts};
        },
    }).on('changeDate', function(ev) {
        if (ev.date.valueOf() > checkout.date.valueOf()){
            var newDate = new Date(ev.date)
            newDate.setDate(newDate.getDate());
            checkout.setValue(newDate);
        }
        else{
            checkout.setValue(checkout.date.valueOf());
        }
        checkin.hide();
        $('#'+end)[0].focus();
    }).data('datepicker');
    var checkout = $('#'+end).datepicker({
        format: 'yyyy-mm-dd',
        // startDate:new Date(),
        onRender: function(date) {
            if(date.valueOf() < checkin.date.valueOf() || date.valueOf() > (new Date('2016-12-31')).valueOf()){
                return 'disabled';
            }
            else{
                return '' ;
            }
        },
    }).on('changeDate', function(ev) {
        checkout.hide();
    }).data('datepicker');

};

function formatState (data_) {
        return data_.text;
};
function init_select() {
    d3.csv("data/city_relation.csv", function(data_city) {
        var data_city_select = [];
        for(var xx in data_city){
            data_city_select.push({id:data_city[xx].id,text:data_city[xx].city_name});
        }
        $("#select_city").select2({
            data: data_city_select,
            placeholder: '请选择',
            allowClear: false,
            multiple: true,
            templateSelection: formatState
        });
    });
    $("#select_city").change(function () {
       console.log($(this).val());
    })
}

function update_select() {
    $("#select_city").val(city_selected).trigger("change");
}
