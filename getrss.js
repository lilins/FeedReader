var schedule = require('node-schedule');
var rss = require("./models/rss.js");
//定时器任务，每分钟的第30秒开始运行脚本，获取所有的feed列表中的信息。
var j = schedule.scheduleJob('30 * * * * *', function(){
  rss.start();
});