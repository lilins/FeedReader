var request = require('request');
var cheerio = require('cheerio');
var CryptoJS = require("crypto-js");
var iconv = require('iconv-lite');
var mysql = require('./rss.js');


module.exports = {
    getUrls: function (option,callback) {
        request.get(option.url)
        .pipe(iconv.decodeStream(option.encoding))
        .collect(function(err, body) {
            var $ = cheerio.load(body);
            var content = $(option.content);
            for (var i = 0; i < 1; i++) {
                var href = content.eq(i).attr('href');
                if (href != undefined && href != "") {
                    var result = option.urlHead?option.urlHead+href:href;
                    var data = {
                        SourceOption:option,
                        url:result,
                        encoding: option.encoding || "utf-8",
                        content: {
                            title: option.hAContent_title || '',
                            p: option.hAContent_p || '',
                            pic : option.hAContent_pic || '',
                            date: option.hAContent_date || '',
                            author: option.hAContent_author || ''
                        }
                    };
                    callback(data);
                }
            }
        });
    },
    getHTML: function (option) {
        var proxy = {
            url:option.url,
            proxy:'http://192.168.1.163:8118'
        };
        request.get(proxy)
        .pipe(iconv.decodeStream(option.encoding))
        .collect(function(err, body) {
            var $ = cheerio.load(body);
            var result = new Object();
            result.url = option.url;
            //result.hsid = option.SourceOption.id || '';

            for(var x in option.content){
                
                if(!option.content[x]){
                    continue ;
                }
                var xs = option.content[x].indexOf("@")===-1 ? option.content[x] : option.content[x].split("@")[0];
                var content = $(xs);
                switch(x){
                    case "title":
                        var xd = option.content[x].indexOf("@")>0 ? option.content[x].split("@")[1] : "",
                            title = xd?content.text().trim().split(xd)[1]:content.text().trim();
                        result.title = title;
                        break;
                    case "pic":
                        for (var i = 0; i < content.length; i++) {
                            var src = content.eq(i).find('img').attr('src');
                            var figcaption = content.eq(i).find('figcaption').text().trim();
                            if (src != undefined && src != "") {
                                result.pic += src + "[@-src]" + figcaption + "[@-pic]";
                            }
                        }
                        break;
                    case "p":
                        for (var i = 0; i < content.length; i++) {
                            var p = content.eq(i).text().trim();
                            if (p != undefined && p != "" && p.indexOf(".")===-1 && p.indexOf(":")===-1) {
                                result.p += p + "[@-p]";
                            }
                        }
                        break;
                    case "date":
                        var xd = option.content[x].indexOf("@")>0 ? option.content[x].split("@")[1] : "";
                        var info = content.text().trim();
                        info = info.split(xd)[0];
                        info = info.replace(/年|月/g,"-");
                        info = info.replace(/日/g," ");
                        result.date = new Date(info).getTime();
                        break;
                    case "author":
                        var info = content.text().trim();
                        result.author = info;
                        break;
                    default: ;
                }
            }
            for(var y in result){
                console.log(result[y]);
            }
            //createHtmlArticle
        });
    },
    parserHTML: function (result, type) {
        var data;
        if (type == "pic") {
            result = result.split("[@-pic]");
            for (var i = 0; result[i]; i++) {
                data[i] = result[i].split("[@-src]");
            }
        } else if(type == "p") {
            data = result.split("[@-p]");
        }else{
            ;
        }
        return data;
    },

    test: function(result){
        console.log(result);
    },
    getHtmlArticle: function () {
        return mysql.getHtmlArticle();
    }
}


//iptables -t nat -A SHADOWSOCKS -p tcp -j REDIRECT --to-ports 1080 #若目的地址不在前面那些范围内, 则将去往目的地址的流量转发到本机1080端口