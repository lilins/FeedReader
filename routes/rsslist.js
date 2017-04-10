var express = require('express');
var router = express.Router();
var rss = require('../models/rss.js');

var limit = rss.getLimit();

/* GET home page. */
router.get('/rsslist', function (req, res, next) {
    var result,
        page = req.query.page > 1 ? req.query.page : 1,
        id = req.query.id || "",
        confirmed = id == "" ? 0 : 1,
        dataList = {},
        data_state;
    if (confirmed) {
        rss.getAllArticleOrderByDateById(id, limit * (page - 1), limit)
        .then(function (data) {
            //console.log(data);
            if(data.rows.length>0){
                data_state = 0;
            }else{
                reject("x");
            }
            dataList.rssList = data;
            return rss.getLeastRss();
        }).then(function (data) {
            dataList.least = data;
            return rss.getAllRss(id);
        }).then(function(data){
            dataList.rssInfo = data;
            result = {confirmed: confirmed, state:data_state, limit: limit, page: page, least: dataList.least, rssList: dataList.rssList.rows, rssInfo : dataList.rssInfo ,count: dataList.rssList.count};
            console.log(result);
            res.render('rsslist', result);
        }).catch(function(err){
             res.render('404');
        })
    }else{
        res.render('404');
    }
});

router.get('/allrss', function (req, res, next) {
    var result,
        page = req.query.page>1?req.query.page:1,
        dataList = {},
        data_stat=-1;
    rss.getRssList((page-1)*limit,limit)
    .then(function(data){
        dataList.rssList = data;
        if(data.rows.length>0){
            data_state = 0;
        }else{
            reject("x");
        }
        return rss.getLeastRss();
    })
    .then(function(data){
        dataList.least = data;
        result = {limit:limit,page:page,least:dataList.least,rssList:dataList.rssList.rows,count:dataList.rssList.count};
        console.log(result);
        res.render('allrss',result);
    }).catch(function(err){
        res.render('404');
    });
});

router.get('/add', function (req, res, next) {
    res.render('addrss');
});

router.get('/search', function (req, res, next) {
    var result,
        keyword = req.query.s || "",
        page = req.query.page>1?req.query.page:1;
        dataList = {},
        data_stat=-1;
    rss.search(keyword,(page-1)*limit,limit)
    .then(function(data){
        dataList.rssList = data;
        return rss.getLeastRss();
    }).then(function(data){
        result = {limit:limit,page:page,least:data,rssList:dataList.rssList.rows,count:dataList.rssList.count,keyword:keyword};
        res.render('search',result);
    }).catch(function(err){
        res.render('404');
    });
});



module.exports = router;
