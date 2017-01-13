var Try = {
	init:function(city_selected,day_begin,day_end){
        //画布
        $('#svg_heat_').remove();
        var svg_width=$('#svg_heat').width();
        var svg_height=$('#svg_heat').height();
        var svg=d3.select("#svg_heat")
            .append("svg")
            .attr("id","svg_heat_")
            .attr("width",svg_width)
            .attr("height",svg_height);

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
        var cell_width=svg_width*0.8/day_sum;
        var cell_height=svg_height*0.1;
        if (city_selected.length>10) cell_height=svg_height/city_selected.length;
        var rect_width=cell_width*0.9;
        var rect_height=cell_height*0.8;
        var cell_x=0;
        var cell_y=0;
        var text_x=0;
        var text_y=0;
        //console.log(city_selected,num_begin,num_end);

        d3.csv("data/all_aqi.csv", function(error,data) {
            var count = 0;
            for (var jj = 0; jj < city_selected.length; jj++) {
                for (var ii = 0; ii < data.length; ii++) {
                    //var current_id = city_selected.indexOf(data[ii].id);
                    if (data[ii].id==city_selected[jj]) {
                        count+=1;
                        text_y=cell_height*(count-1)+rect_height;
                        cell_y=cell_height*(count-1);
                        console.log(ii,jj);
                        var g = svg.append("g")
                            .attr("id", data[ii].city_name);
                        g.append("text")
                            .attr("x", text_x)
                            .attr("y", text_y)
                            .attr("fill", "black")
                            .style("font-size", 10)
                            .text(data[ii].city_name);
                        console.log(data[ii].city_name);
                        for (var kk = num_begin; kk < num_end; kk++) {
                            cell_x = svg_width * 0.12 + (kk - num_begin) * cell_width;
                            g.append("rect")
                                .attr("x", cell_x)
                                .attr("y", cell_y)
                                .attr("width", rect_width)
                                .attr("height", rect_height)
                                .attr("fill", color(data[ii][kk+1] / 500));
                        }
                        break;
                    }
                }
            }
        })
	}

}



