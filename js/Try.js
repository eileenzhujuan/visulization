var day_begin;
var day_end;
var norm1=50;
var norm2=100;
var norm3=150;
var norm4=500;
var sum1=new Array();
var sum2=new Array();
var sum3=new Array();
var sum4=new Array();
var tooltip2 = d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .style("opacity",0.0);
var Try = {
	init:function(city_selected,dayBegin,dayEnd){
        //画布
        $('#svg_heat_').remove();
        day_begin=dayBegin;
        day_end=dayEnd;
        var svg_width=$('#svg_heat').width();
        var svg_height=$('#svg_heat').height();
        var svg=d3.select("#svg_heat")
            .append("svg")
            .attr("id","svg_heat_")
            .attr("width",svg_width)
            .attr("height",svg_height);
        svg.on("mouseout",function(){
            tooltip2.style("opacity",0.0);
        })

        //颜色插值
        var color_begin=d3.rgb(255,255,255);
        var color_end=d3.rgb(255,0,0);
        var color=d3.interpolate(color_begin,color_end);
        /*var linear=d3.scaleLinear()
            .domain([0,500])
            .range([0,1]);*/

        //基本数据
        var day_origin = new Date("2015-01-02");
        var num_begin = (day_begin - day_origin)/(60*60*24*1000);
        var num_end = (day_end - day_origin)/(60*60*24*1000) + 1;
        var day_sum=num_end-num_begin+1;
        var cell_width=svg_width*0.6/day_sum;
        var cell_height=svg_height*0.1;
        if (city_selected.length>10) cell_height=svg_height/city_selected.length;
        var rect_width=cell_width*0.9;
        var rect_height=cell_height*0.7;
        var cell_x=0;
        var cell_y=0;
        var text_x=0;
        var text_y=0;
        var sum_x=svg_width*0.73;
        var sum_y=0;
        var sum1_width=0;
        var sum2_width=0;
        var sum3_width=0;
        var sum4_width=0;
        var sum_height=rect_height;
        //console.log(city_selected,num_begin,num_end);

        d3.csv("data/all_aqi.csv", function(error,data) {
            var count = 0;
            for (var jj = 0; jj < city_selected.length; jj++) {
                for (var ii = 0; ii < data.length; ii++) {
                    //var current_id = city_selected.indexOf(data[ii].id);
                    if (data[ii].id==city_selected[jj]) {
                        count+=1;
                        text_y=cell_height*(count-1)+0.7*rect_height;
                        cell_y=cell_height*(count-1);
                        //console.log(ii,jj);
                        var g = svg.append("g")
                            .attr("id", data[ii].id);
                        if (city_selected.length<26){
                            g.append("text")
                                .attr("x", text_x)
                                .attr("y", text_y)
                                .attr("fill", "black")
                                .style("font-size", 10)
                                .text(data[ii].city_name);
                        }

                        sum1[jj]=0;
                        sum2[jj]=0;
                        sum3[jj]=0;
                        sum4[jj]=0;
                        for (var kk = num_begin; kk < num_end; kk++) {
                            cell_x = svg_width * 0.12 + (kk - num_begin) * cell_width;
                            if (city_selected.length>25){
                                cell_width=svg_width*0.7/day_sum;
                                cell_x = (kk - num_begin) * cell_width;
                            }
                            g.append("rect")
                                .attr("id",data[ii][kk+1])
                                .attr("x", cell_x)
                                .attr("y", cell_y)
                                .attr("width", rect_width)
                                .attr("height", rect_height)
                                .attr("fill", color(data[ii][kk+1] / 500));
                            if (data[ii][kk+1]<=norm1){
                                sum1[jj]+=1;
                            }
                            else if (data[ii][kk+1]<=norm2){
                                sum2[jj]+=1;
                            }
                            else if (data[ii][kk+1]<=norm3){
                                sum3[jj]+=1;
                            }
                            else if (data[ii][kk+1]<=norm4){
                                sum4[jj]+=1;
                            }
                        }
                        sum_y=cell_y;
                        sum1_width=svg_width*0.26*sum1[jj]/day_sum;
                        sum2_width=svg_width*0.26*sum2[jj]/day_sum;
                        sum3_width=svg_width*0.26*sum3[jj]/day_sum;
                        sum4_width=svg_width*0.26*sum4[jj]/day_sum;
                        g.append("rect")
                            .attr("id",sum1[jj]+'天')
                            .attr("x", sum_x)
                            .attr("y", sum_y)
                            .attr("width", sum1_width)
                            .attr("height", sum_height)
                            .attr("fill", "green");
                        g.append("rect")
                            .attr("id",sum2[jj]+'天')
                            .attr("x", sum_x+sum1_width)
                            .attr("y", sum_y)
                            .attr("width", sum2_width)
                            .attr("height", sum_height)
                            .attr("fill", "yellow");
                        g.append("rect")
                            .attr("id",sum3[jj]+'天')
                            .attr("x", sum_x+sum1_width+sum2_width)
                            .attr("y", sum_y)
                            .attr("width", sum3_width)
                            .attr("height", sum_height)
                            .attr("fill", "orange");
                        g.append("rect")
                            .attr("id",sum2[jj]+'天')
                            .attr("x", sum_x+sum1_width+sum2_width+sum3_width)
                            .attr("y", sum_y)
                            .attr("width", sum4_width)
                            .attr("height", sum_height)
                            .attr("fill", "brown");
                        break;
                    }
                }
            }
            d3.selectAll("g")
                .on("click",function(d,i){
                    //console.log("hello");
                    var current_id = city_selected.indexOf(this.id);
                    if (current_id!=-1){
                        //console.log("out");
                        city_selected.splice(current_id,1);
                        Try.init(city_selected,day_begin,day_end);
                        update_map();
                        update_select();
                    }
                })
                .on("mouseover",function(d,i){


                })
                .on("mouseout",function(d,i){

                })
            d3.selectAll("rect")
                .on("click",function(d,i){

                })
                .on("mouseover",function(d,i){
                    tooltip2.style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px")
                        .style("opacity",1.0)
                        .text(this.id);
                })
                .on("mouseout",function(d,i){

                })


        })
	},
	sumSort:function(){
	    var len=sum1.length;
	    var tmp;
	    for (var i=0;i<len;i++){
            for (var j=i+1;j<len;j++){
                if (sum1[i]<sum1[j]){
                    tmp=sum1[i];
                    sum1[i]=sum1[j];
                    sum1[j]=tmp;
                    tmp=sum2[i];
                    sum2[i]=sum2[j];
                    sum2[j]=tmp;
                    tmp=sum3[i];
                    sum3[i]=sum3[j];
                    sum3[j]=tmp;
                    tmp=sum4[i];
                    sum4[i]=sum4[j];
                    sum4[j]=tmp;
                    tmp=city_selected[i];
                    city_selected[i]=city_selected[j];
                    city_selected[j]=tmp;
                }
            }
        }
        Try.init(city_selected,day_begin,day_end);

    }

}




