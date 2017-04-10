//var request = require('request');
//var cheerio = require('cheerio');
var feed = require('./rssTemp.js');
var CryptoJS = require("crypto-js");

var url = "http://www.chinatimes.com/rss/realtimenews-politic.xml";

feed.start();



// request(url, function (error, response, body) {
//     // console.log(response);
//     // console.log(body);
//     var $ = cheerio.load(body);
    
//     //console.log(content);

//     var result="";
//     //图片
//     var content = $('article article .pic');
//     for(var i=0;i<content.length;i++){
//         var src = content.eq(i).find('img').attr('src');
//         var figcaption = content.eq(i).find('figcaption').text().trim();
//         if(src!=undefined&&src!=""){
//             result += src+"[@-src]"+figcaption+"[@-pic]"; 
//         }
//     }
//     result = result.split("[@-pic]");
//     //console.log(result.length);
//     for(var i=0;result[i];i++){
//         var results = result[i].split("[@-src]");
//         for(var j=0;results[j];j++){
//             console.log(results[j]);
//         }
//     }
//     result="";
//     //文章
//     var content = $('article article p');
//     for(var i=0;i<content.length;i++){
//         var p = content.eq(i).text().trim();
//         if(p!=undefined&&p!=""){
//             result += p+"[@-p]"; 
//         }
//     }
//     //console.log(result);
//     result = result.split("[@-p]");
//     //console.log(result.length);
//     for(var i=0;result[i];i++){
//         console.log(result[i]);
//     }
// });


//iptables -t nat -A SHADOWSOCKS -p tcp -j REDIRECT --to-ports 1080 #若目的地址不在前面那些范围内, 则将去往目的地址的流量转发到本机1080端口