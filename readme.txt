注意事项：
1 数据
	2015_aqi.csv, 2016_aqi.csv是全部完整的aqi每天数据
	2015_aqi_filter.csv, 2016_aqi_filter.csv是能和地图对应的aqi每天数据
	city_relation.csv 是空气质量表中的num和地图json中的id的一一对应关系
	all_data.csv 是把2015和2016年的数据按0-729的顺序放在了features.properties.aqi中整合而成的json数据，map.js有使用这个的示例
	geo/json中有全国，各省，各省合并（all_city.json）的json数据，
2 进度
	能基本显示完整地图，除少部分对不上的数据
	能查询开始日期的aqi，一段时间的平均的没有写
	前段日期插件没有写，暂时用输入数字的输入框代替
	点击地图选中事件或者鼠标悬浮事件接口已在map.js中，你自己去补充吧。
3 加油，剩下的基本靠你了。