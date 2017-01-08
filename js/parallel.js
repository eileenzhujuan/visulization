
var m = [50, 20, 50, 50], // 上右下左的margin
    w = 1060 - m[1] - m[3],
    h = 500 - m[0] - m[2];
var x = d3.scale.ordinal().rangePoints([0, w], 1),
    y = {};

$(document).ready(function(){
    initial_svg();
});




var initial_svg = function() {


    d3.fisheye = {
        scale: function(scaleType) {
            return d3_fisheye_scale(scaleType(), 3, 0);
        },
        circular: function() {
            var radius = 200,
                distortion = 2,
                k0,
                k1,
                focus = [0, 0];

            function fisheye(d) {
                var dx = d.x - focus[0],
                    dy = d.y - focus[1],
                    dd = Math.sqrt(dx * dx + dy * dy);
                if (!dd || dd >= radius) return {x: d.x, y: d.y, z: 1};
                var k = k0 * (1 - Math.exp(-dd * k1)) / dd * .75 + .25;
                return {x: focus[0] + dx * k, y: focus[1] + dy * k, z: Math.min(k, 10)};
            }

            function rescale() {
                k0 = Math.exp(distortion);
                k0 = k0 / (k0 - 1) * radius;
                k1 = distortion / radius;
                return fisheye;
            }

            fisheye.radius = function(_) {
                if (!arguments.length) return radius;
                radius = +_;
                return rescale();
            };

            fisheye.distortion = function(_) {
                if (!arguments.length) return distortion;
                distortion = +_;
                return rescale();
            };

            fisheye.focus = function(_) {
                if (!arguments.length) return focus;
                focus = _;
                return fisheye;
            };

            return rescale();
        }
    };

    var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        fisheye = d3.fisheye.scale(d3.scale.identity).domain([0,w]).focus(w/2).distortion(3),
        background,
        foreground;


    var svg = d3.select("#svg_parallel").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [fisheye(x(p)), y[p](d[p])]; }));
    }

    d3.csv("data/2015_36_parallel.csv", function(parallel_data) {
        // Extract the list of dimensions and create a scale for each.
        x.domain(dimensions = d3.keys(parallel_data[0]).filter(function(d) {
            return ((d == "良好天数")  && (y[d] = d3.scale.linear()
                    .domain(d3.extent(parallel_data, function(p) { return +p[d]; }))
                    .range([h, 0])))
                    ||((d == "平均AQI" || d == "2015_GDP" || d == "2015_popu")  && (y[d] = d3.scale.linear()
                    .domain(d3.extent(parallel_data, function(p) { return +p[d]; }))
                    .range([0, h])));
        }));

        // Add grey background lines for context.
        background = svg.append("svg:g")
            .attr("class", "background")
            .selectAll("path")
            .data(parallel_data)
            .enter().append("svg:path")
            .attr("d", path);

        // Add blue foreground lines for focus.
        foreground = svg.append("svg:g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(parallel_data)
            .enter().append("svg:path")
            .attr("d", path);

        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("svg:g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + fisheye(x(d)) + ")"; });

        // Add an axis and title.
        g.append("svg:g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
            .append("svg:text")
            .attr("text-anchor", "middle")
            .attr("y", -9)
            .text(String);

        // Add and store a brush for each axis.
        g.append("svg:g")
            .attr("class", "brush")
            .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

        $("#button_text").click(function() {

            console.log(this.innerHTML);
            if(this.innerHTML == "启用鱼眼") {
            svg.on("mousemove", function () {
                fisheye.focus(d3.mouse(this)[0]);

                foreground.attr("d", path);
                background.attr("d", path);
                g.attr("transform", function (d) {
                    return "translate(" + fisheye(x(d)) + ")";
                });
            });
                this.innerHTML = "禁用鱼眼"
            }
            else{
                svg.on("mousemove", function () {

                });

                this.innerHTML = "启用鱼眼"
            }

        });




    });


    function d3_fisheye_scale(scale, d, a) {

        function fisheye(_) {
            var x = scale(_),
                left = x < a,
                v,
                range = d3.extent(scale.range()),
                min = range[0],
                max = range[1],
                m = left ? a - min : max - a;
            if (m == 0) m = max - min;
            return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
        }

        fisheye.distortion = function(_) {
            if (!arguments.length) return d;
            d = +_;
            return fisheye;
        };

        fisheye.focus = function(_) {
            if (!arguments.length) return a;
            a = +_;
            return fisheye;
        };

        fisheye.copy = function() {
            return d3_fisheye_scale(scale.copy(), d, a);
        };

        fisheye.nice = scale.nice;
        fisheye.ticks = scale.ticks;
        fisheye.tickFormat = scale.tickFormat;
        return d3.rebind(fisheye, scale, "domain", "range");
    }




// Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
            extents = actives.map(function(p) { return y[p].brush.extent(); });
        foreground.style("display", function(d) {
            return actives.every(function(p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? null : "none";
        });
    }
}



