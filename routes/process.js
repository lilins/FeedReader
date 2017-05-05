var express = require('express');
var router = express.Router();
var rss = require('../models/rss.js');
var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var config = require('../config.js');
var proxy = config.PROXY;
var keywords = config.KEYWORDS;

/* GET users listing. */
router.post('/update', function (req, res, next) {
    var body = req.body;
    rss.updateRss(body.id, body.urls, body.description).
        then(function (data) {
            res.send(data);
        });
});

router.post('/upload', function (req, res, next) {
    var body = req.body,
        result = "",
        feedparser = new FeedParser();
    new Promise((resolve, reject) => {

        let feedparser = new FeedParser();
        var option = body.link;
        for(var i=0;i<keywords.length;i++){
            if(~option.indexOf(keywords[i])){
              result = {
                    state: 0,
                    message: "x"
                }
                resolve(result);
            }
        }
        request(body.link).on('error', function (err) {
            result = {
                state: -1,
                message: err.message
            }
            reject(result);
        })
            .on('response', function (res) {
                if (res.statusCode != 200) {
                    result = {
                        state: -1,
                        message: res.statusCode
                    }
                    reject(result);
                }
            }).pipe(feedparser);

        feedparser.on('error', function (error) {
            //0表示，不是一个Feed
            result = {
                state: -1,
                message: 0
            }
            reject(result);
        });
        feedparser.on('readable', function (error) {
            result = {
                state: 0
            }
            resolve(result);
        });

    }).then((data) => {
        if (data.state == 0) {
            return rss.createRss(body.link, body.description);
        } else {
            res.send(data);
        }
    }).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    });
});

router.post('/delete', function (req, res, next) {
    var body = req.body;
        rss.deleteRss(body.id)
        .then(function(data){
            res.send(data);
        })
        .catch(function(err){
            res.send({state:-1,message:err});
        })
});

router.post('/singleget', function (req, res, next) {
    var body = req.body;
    new Promise((resolve, reject) => {
        let feedparser = new FeedParser();
        request(body.link).on('error', function (err) {
            result = {
                state: -1,
                message: err.message
            }
            reject(result);
        })
            .on('response', function (res) {
                if (res.statusCode != 200) {
                    result = {
                        state: -1,
                        message: res.statusCode
                    }
                    reject(result);
                }
            }).pipe(feedparser);

        feedparser.on('error', function (error) {
            //0表示，不是一个Feed
            result = {
                state: -1,
                message: 0
            }
            reject(result);
        });
        feedparser.on('readable', function (error) {
            result = {
                state: 0
            }
            rss.singleget(body.xid, body.link);
            resolve(result);
        });

    }).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    });
});


module.exports = router;
