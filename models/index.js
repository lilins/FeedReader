/*
* 所需的库文件
* Sequelize是Node.js的数据库操作框架；
* FeedParser是Feed解析器；
* request是FeedParser需要的请求库；
* CryptoJS是负责MD5加密；
* iconv是用于对某些非utf-8的Feed网址进行转码；
* mysql是数据库连接信息；
*/

var Sequelize = require('sequelize');
var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var CryptoJS = require("crypto-js");
var iconv = require('iconv-lite');
var mysql = require('../config.js').MYSQL;

//sequelize数据库连接
var sequelize = new Sequelize(mysql.schema, mysql.username, mysql.password, {
  host: mysql.host,
  dialect: 'mysql',
  port: mysql.port
});

/*
* sequelize数据表定义
* 在rssReader中一共有五个表：
* 1.rssList是feed的网址列表；
* 2.rssMeta是feed的元信息表；
* 3.rssArticle是feed的文章信息表；
* 4.categories是feed的标签信息表；
* 6.rss2categories是标签与ID关联表；
*/
module.exports = function(sequelize){

    rssList = sequelize.define('rssList', {
  rssListId: { type: Sequelize.STRING(32), primaryKey: true },
  rssLink: Sequelize.STRING,
  description: Sequelize.TEXT,
  date: Sequelize.BIGINT(14),
  updateState: Sequelize.BIGINT(11)
}, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    freezeTableName: true,
    timestamps: false
  });

    rssMeta = sequelize.define('rssMeta', {
  rssMetaId: { type: Sequelize.STRING(32), primaryKey: true },
  rssListId: {
    type: Sequelize.STRING(32),
    references: {
      // This is a reference to another model
      model: rssList,
      // This is the column name of the referenced model
      key: 'rssListId'
    }
  },
  title: Sequelize.STRING(50),
  description: Sequelize.TEXT,
  link: Sequelize.STRING,
  xmlurl: Sequelize.STRING,
  date: Sequelize.BIGINT(14),
  pubdate: Sequelize.BIGINT(14),
  author: Sequelize.STRING(50),
  language: Sequelize.STRING(20),
  imageTitle: Sequelize.STRING,
  imageLink: Sequelize.STRING,
  imageUrl: Sequelize.STRING,
  favicon: Sequelize.STRING,
  copyright: Sequelize.STRING,
  generator: Sequelize.STRING
}, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    freezeTableName: true,
    timestamps: false
  });

    rssArticle = sequelize.define('rssArticle', {
  rssArticleId: { type: Sequelize.STRING(32), primaryKey: true },
  rssMetaId: {
    type: Sequelize.STRING(32),
    references: {
      // This is a reference to another model
      model: rssMeta,
      // This is the column name of the referenced model
      key: 'rssMetaId'
    }
  },
  title: Sequelize.STRING(50),
  description: Sequelize.TEXT,
  summary: Sequelize.TEXT,
  link: Sequelize.STRING,
  origlink: Sequelize.STRING,
  permalink: Sequelize.STRING,
  date: Sequelize.BIGINT(14),
  pubdate: Sequelize.BIGINT(14),
  author: Sequelize.STRING(50),
  guid: Sequelize.STRING,
  comments: Sequelize.STRING(20),
  imageUrl: Sequelize.STRING,
  imageTitle: Sequelize.STRING,
  source: Sequelize.STRING,
  enclosures: Sequelize.STRING,
  meta: Sequelize.STRING
}, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    freezeTableName: true,
    timestamps: false
  });

var categories = sequelize.define('categories', {
  categoriesId: { type: Sequelize.STRING(32), primaryKey: true },
  name: Sequelize.STRING(25)
}, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    freezeTableName: true,
    timestamps: false
  });

var rss2categories = sequelize.define('rss2categories', {
  r2cId: { type: Sequelize.STRING(32), primaryKey: true },
  rssId: Sequelize.STRING(32),
  categoriesId: {
    type: Sequelize.STRING(32),
    references: {
      // This is a reference to another model
      model: categories,
      // This is the column name of the referenced model
      key: 'categoriesId'
    }
  }
}, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    freezeTableName: true,
    timestamps: false
  });

/*
* 表的关系声明
* List与Meta是一对一的关系
* Meta与Article是一对多的关系
*/

rssList.hasOne(rssMeta, { foreignKey: 'rssListId' });
rssMeta.belongsTo(rssList, { foreignKey: 'rssListId' });
rssArticle.belongsTo(rssMeta, { foreignKey: 'rssMetaId' });


/*
* 当数据从feed取来后的处理方法：
* timestamps()是对于时间戳的处理，从时间戳输出正常时间格式。
* 例如：2017-03-11 07:22:19
* reprocess()是对于文章信息的集中处理，处理时间和摘要信息，
* 处理时间则调用上述的函数，摘要信息则去除其中的HTML代码。
* listprocess()是对feed列表信息的集中处理，处理时间和相关信息，
*/

var timestamps = function (timestamps) {
  var date = new Date(timestamps);
  Y = date.getFullYear() + '-';
  M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
  m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
  s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
  return (Y + M + D + h + m + s);
};

var reprocess = function (result, limit) {
  for (let i = 0; i < result.rows.length; i++) {
    result.rows[i].date = timestamps(result.rows[i].date);
    result.rows[i].pubdate = timestamps(result.rows[i].pubdate);
    if (result.rows[i].summary != undefined) {
      result.rows[i].summary = result.rows[i].summary.replace(/<.*?>/ig, "");
    } else if (result.rows[i].description != undefined) {
      result.rows[i].summary = result.rows[i].description.replace(/<.*?>/ig, "");
    } else {
      ;
    }
  }
  result.count = Math.floor((result.count - 1) / limit) + 1;

  return result;
};

var listprocess = function (result, limit) {
  for (let i = 0; i < result.rows.length; i++) {
    if ("date" in result.rows[i]) {
      result.rows[i].date = timestamps(result.rows[i].date);
    }
    if (result.rows[i].rssMetum != null) {
      result.rows[i].rssMetum.date = timestamps(result.rows[i].rssMetum.date);
      result.rows[i].rssMetum.pubdate = timestamps(result.rows[i].rssMetum.pubdate);
    }
  }
  result.count = Math.floor((result.count - 1) / limit) + 1;
  return result;
};

/*
 * 以下为数据定时获取器的函数
 */

//插入Feed Meta信息

var insertMetaRss = function (item, rssLinkId) {
  rssMeta.create({
    rssMetaId: CryptoJS.MD5(item.meta.title + rssLinkId).toString(),
    rssListId: rssLinkId,
    title: item.meta.title,
    description: item.meta.description,
    link: item.meta.link,
    xmlurl: item.meta.xmlurl,
    date: new Date(item.meta.date).getTime(),
    pubdate: new Date(item.meta.pubdate).getTime(),
    author: item.meta.author,
    language: item.meta.language,
    imageTitle: item.meta.image.title,
    imageUrl: item.meta.image.url,
    imageLink: item.meta.image.link,
    favicon: item.meta.favicon,
    copyright: item.meta.copyright,
    generator: item.meta.generator

  }).then(function (p) {
    console.log('Meta信息创建成功：' + p);
  }).catch(function (err) {
    console.log('Meta信息创建失败：' + err);
  });

};

//新增Feed标签条目

var insertCate = function (name, rssId) {
  categories.create({
    categoriesId: CryptoJS.MD5(name).toString(),
    name: name
  }).then(function (p) {
    if (!p) { console.log('标签保存不成功'); }
    else { insertR2C(CryptoJS.MD5(name).toString(), rssId); }
  }).catch(function (err) {
    console.log('标签保存失败: ' + err);
  });

};

var insertR2C = function (cId, rssId) {
  rss2categories.create({
    r2cId: CryptoJS.MD5(cId + rssId).toString(),
    rssId: rssId,
    categoriesId: cId
  }).then(function (p) {
    if (!p) { console.log('r2c保存不成功'); }
    else { console.log('r2c保存成功'); }
  }).catch(function (err) {
    console.log('r2c保存失败: ' + err);
  });
};

//新增Feed文章条目，其中source和enclosures信息因为不常用，所以都以空字符串显示。

var insertArticleRss = function (item, rssLinkId) {
  rssArticle.create({
    rssArticleId: CryptoJS.MD5(item.title + rssLinkId).toString(),
    rssMetaId: CryptoJS.MD5(item.meta.title + rssLinkId).toString(),
    title: item.title,
    description: item.description,
    summary: item.summary,
    link: item.link,
    origlink: item.origlink,
    permalink: item.permalink,
    date: new Date(item.date).getTime(),
    pubdate: new Date(item.pubdate).getTime(),
    author: item.author,
    guid: item.guid,
    comments: item.comments,
    imageUrl: item.image.url,
    imageTitle: item.image.title,
    source: '',
    enclosures: ''

  }).then(function (p) {
    console.log('文章创建成功：' + p);
  }).catch(function (err) {
    console.log('文章创建失败：' + err);
  });

};

//检测Meta信息是否存在
var metaIsExist = function (item, rssLinkId) {
  return rssMeta.findOne({
    'where': { 'rssListId': rssLinkId }
  }).then(function (result) {
    if (result) {
      console.log("元信息已存在");
      articleIsExist(item, rssLinkId);
    } else {
      console.log("元信息不存在");
      insertMetaRss(item, rssLinkId);
    }
  });
};
//检测article信息是否存在
var articleIsExist = function (item, rssLinkId) {
  return rssArticle.findOne({
    'where': { 'rssArticleId': CryptoJS.MD5(item.title + rssLinkId).toString() }
  }).then(function (result) {
    if (result) { console.log("文章已存在"); }
    else {
      console.log("文章不存在");
      insertArticleRss(item, rssLinkId);
    }
  });
};
//检测categories信息是否存在
var categoriesIsExist = function (name, rssLinkId) {
  return categories.findOne({
    'where': { 'name': name }
  }).then(function (result) {
    if (result) { console.log("标签已存在"); }
    else {
      console.log("标签不存在");
      insertCate(name, rssLinkId);
    }
  });
};
/*
* 写入状态码
* 状态码定义：
* -1 初始化
* 0 创建成功
* 1 创建失败
* 2 网络错误
* 3 连接错误
* 4 解析错误
*/
var writeState = function (id, state) {
  rssList.update({
    updateState: state
  }, {
      where: {
        rssListId: id
      }
    }).then(function (re) {
      return result = {
        state: 0,
        message: re
      };
    }).catch(function (err) {
      return result = {
        state: -1,
        message: err
      };
    });
}

//request获取feed网址信息，feedparser解析信息，并存储信息的操作：
var feedParser = function (rssLinkId, link, encode) {
  //let option={resume_saxerror:false};

  let feedparser = new FeedParser();

  request(link).on('error', function (err) {
    writeState(rssLinkId, 2);
    console.log("请求错误");
    console.log(err);
  })
    .on('response', function (res) {
      if (res.statusCode != 200) {
        writeState(rssLinkId, 3);
      }
    }).pipe(iconv.decodeStream(encode))
    .pipe(feedparser);

  feedparser.on('error', function (error) {
    writeState(rssLinkId, 4);
    console.log(error.message);
  });

  let flag = 0;
  feedparser.on('readable', function () {
    writeState(rssLinkId, 0);
    // This is where the action is!
    let stream = this; // `this` is `feedparser`, which is a stream
    let meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    let item;

    while ((item = stream.read()) && (flag >= 0)) {
      if ((item.title.indexOf('�') != -1) && (flag >= 0)) {
        flag = - 1;
        feedParser(rssLinkId, link, 'gb2312');
      } else {
        metaIsExist(item, rssLinkId);
        for (let i = 0; i < item.categories.length; i++) {
          categoriesIsExist(item.categories[i], rssLinkId);
        }
      }
    }

  });

}


  /*
  * 按照时间降序，获取所有Article信息
  * @param start {number} 从第几个信息开始获取
  * @param limit {number} 一共获取几个文章信息。
  * @return Promise: result.count Article总数; result.rows Article列表
  */
  * getAllArticleOrderByDate(start, limit) {
    return Promise.resolve(
      rssArticle.findAndCountAll({
        limit: limit,
        offset: start,
        include: [rssMeta],
        order: [
          ['date', 'DESC']
        ]
      }).then(function (result) {
        return reprocess(result, limit);
      }));
  },
  /*
  * 按id值获取feed信息
  * @param id {string} feed的id值
  * @return Promise: result.count feed总数; result.rows feed列表
  */
  * getAllRss(id) {
    return Promise.resolve(
      rssList.findOne({
        where: { 'rssListId': id },
        include: [{ model: rssMeta }]
      }).then(function (result) {
        return result;
      }));
  },
  /*
  * 按照feed的id值，并按照时间降序，获取所有Article信息（即获取同一来源的rss信息）
  * @param id {string} feed的id值
  * @param start {number} 从第几个信息开始获取
  * @param limit {number} 一共获取几个文章信息。
  * @return Promise: result.count Article总数; result.rows Article列表
  */
  * getAllArticleOrderByDateById(id, start, limit) {
    return Promise.resolve(
      rssArticle.findAndCountAll({
        limit: limit,
        offset: start,
        include: [{
          model: rssMeta,
          where: { 'rssListId': id }
        }],

        order: [
          ['date', 'DESC']
        ]
      }).then(function (result) {
        return reprocess(result, limit);
      }));
  },
  /*
  * 按照时间降序，获取最新上传的5个feed信息
  * @return Promise: result feed信息列表
  */
  * getLeastRss() {
    return Promise.resolve(
      rssList.findAll({
        limit: 5,
        offset: 0,
        order: [
          ['date', 'DESC']
        ]
      }).then(function (result) {
        return result;
      }));
  },
  /*
  * 获取全部的Rss列表
  * @return Promise: result feed信息列表
  */
  * getRssList(start, limit) {
    return Promise.resolve(
      rssList.findAndCountAll({
        limit: limit,
        offset: start,
        order: [
          ['date', 'DESC']
        ],
        include: [{ model: rssMeta }]
      }).then(function (result) {
        return listprocess(result, limit);
      }));
  },
  /*
  * 修改feed列表的信息
  */
  * updateRss(id, link, description) {
    return Promise.resolve(
      rssList.update({
        rssLink: link,
        description: description
      }, {
          where: {
            rssListId: id
          }
        }).then(function (re) {
          return result = {
            state: 0,
            message: re
          };
        }).catch(function (err) {
          return result = {
            state: -1,
            message: err
          };
        }));
  },
  /*
  * 删除feed列表的信息，由于外键绑定，所以会先从绑定的Article信息开始删除，依次次序是：
  * rssArticle -> rssMeta -> rssList
  */
  * deleteRss(id) {
    return Promise.resolve(

      rssList.findOne(
        {
          where: { rssListId: id },
          include: [{ model: rssMeta }]
        }).then(function (re) {
          if (re.rssMetum != null) {
            return Promise.resolve(
              rssArticle.findOne(
                {
                  where: { rssMetaId: re.rssMetum.rssMetaId }
                }).then(function (re) {
                  if (re) {
                    return result={
                      state:3,
                      data:re
                    };
                  } else {
                    return result={
                      state:2,
                      data:re
                    };
                  }
                }).catch(function (err) {
                  return err;
                })
            )
          } else {
            return result={
              state:1,
              data:re
            };
          }
        }).then(function (data) {
          if (data.state == 3) {
            rssArticle.destroy({
              where: {
                rssMetaId: data.data.rssMetaId
              }
            });
            rssMeta.destroy({
              where: {
                rssMetaId: data.data.rssMetaId
              }
            });
            rssList.destroy({
              where: {
                rssListId: id
              }
            });
          } else if (data.state  == 2) {
            rssMeta.destroy({
              where: {
                rssMetaId: data.data.rssMetaId
              }
            });
            rssList.destroy({
              where: {
                rssListId: id
              }
            });
          } else if (data.state  == 1) {
            rssList.destroy({
              where: {
                rssListId: id
              }
            });
          } else {
            return result = {
              state: -1,
              message: data
            };
          }
          return result = {
            state: 0
          };
        }).catch(function (err) {
          return result = {
            state: -3,
            message: err
          };
        }));
  },
  /*
  * 新增feed信息
  */
  createRss(link, description) {
    return Promise.resolve(
      rssList.create({
        rssListId: CryptoJS.MD5(link).toString(),
        rssLink: link,
        description: description,
        date: Date.now(),
        updateState: -1
      }).then(function (re) {
        return result = {
          state: 0,
          message: re
        };
      }).catch(function (err) {
        return result = {
          state: -1,
          message: err
        };
      }));
  },

  /*
  * 搜索feed信息，只搜索：标题和摘要信息
  */

  * search(keyword, start, limit) {
    return Promise.resolve(
      rssArticle.findAndCountAll({
        limit: limit,
        offset: start,
        include: [rssMeta],
        order: [
          ['date', 'DESC']
        ],
        where: {
          $or: [
            {
              title: {
                $like: '%' + keyword + '%'
              }
            },
            {
              summary: {
                $like: '%' + keyword + '%'
              }
            }
          ]
        }
      }).then(function (result) {
        return reprocess(result, limit);
      })
    );
  },

  //外部定时器调用的入口
  start() {
    rssList.findAll().then(function (result) {
      for (let i = 0; i < result.length; i++) {
        feedParser(result[i].rssListId, result[i].rssLink, 'utf-8');
      }
    });
  },

  // 一页中显示Feed最多的个数，用于controller中调用
  getLimit() {
    return 20;
  },

  singleget(id, link) {
    feedParser(id, link, 'utf-8');
  }
};