# taiwannews

这个是基于Express框架的Feed抓取器，只要将Feed地址输入后，即可自动获取Feed条目。

## 使用

### 1.confi.js

在根目录下，新建一个config.js文件，在其中填写以下内容（数据库文件）：

```js
module.exports = {
    "MYSQL" : {
        "schema": ,
        "host": ,
        "username": ,
        "password": ,
        "port": 
    }
};
```

### 2.启动自动抓取的进程

使用PM2等工具，启动getrss.js

### 3.启动项目

使用以下命令启动项目

```bash
npm start
```