var express = require('express');
var router = express.Router();
var rss = require('../models/rss.js');

var limit = rss.getLimit();

/* GET home page. */
router.get('/', function(req, res, next) {
  var result,
      page = req.query.page>1?req.query.page:1,
      dataList = {},
      data_state = -1;
  rss.getAllArticleOrderByDate((page-1)*limit,limit)
  .then(function(data){
    dataList.rssList = data;
    return rss.getLeastRss();
  })
  .then(function(data){
    result = {limit:limit,page:page,least:data,rssList:dataList.rssList.rows,count:dataList.rssList.count};
    res.render('index',result);
  })
});

module.exports = router;
