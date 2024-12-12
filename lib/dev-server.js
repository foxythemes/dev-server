"use strict";

const express = require("express");
const pug = require("pug");
const fs = require("fs");
const pugRe = /\.pug$/;

const options = {
  configFile: ".config/config.json",
  viewsPath: "./src/html",
  assetsPath: "./src/assets",
  jsPath: "./src/js",
  port: 8081,
};

const server_pages = __dirname + "/../server-pages";
const conf_file_path = options.configFile;
const pug_views_path = options.viewsPath;
const assets_path = options.assetsPath;
const js_path = options.jsPath;
const port = options.port;
const app = express();

//HTML Escape Function
pug.filters.escape = require("../pug-filters/pug-escape.js");
pug.filters.php = require("../pug-filters/pug-php.js");

app.use(express.static(assets_path)); //HTML assets folder
app.use(express.static(js_path)); //Js local folder
app.use("/server", express.static(server_pages + "/assets")); //pug Server Error Pages

app.get("/*", function (req, res) {
  if (req.url.match(pugRe)) {
    if (fs.existsSync(pug_views_path + req.url)) {
      //If file exists then serve it
      var data;
      var conf_file_exists = fs.existsSync(conf_file_path);

      if (conf_file_exists) {
        try {
          data = JSON.parse(fs.readFileSync(conf_file_path, "utf8"));
        } catch (e) {
          console.log(
            'Config file format error: "' +
              conf_file_path +
              '"'
          );
          data = {};
        }
      } else {
        data = {};
      }

      try {

        // If everthing is ok, then render pug files
        res.send(
          pug.renderFile(pug_views_path + req.url, {
            pretty: true,
            conf: data,
            basedir: pug_views_path,
            filename: pug_views_path + req.url.replace(pugRe, ""),
          })
        );
      } catch (error) {

        //If not, render the pug error page
        let msg = error.toString();
        msg = msg.replace(new RegExp(">", "g"), "&gt;");
        msg = msg.replace(new RegExp("\n", "g"), "<br>");
        res.send(
          pug.renderFile(server_pages + "/pug-lang-error.pug", {
            pretty: true,
            basedir: server_pages,
            msg: msg,
          })
        );
      }
    } else {
      res.status(404).send("<h1>404 - File Not Found</h1>");
    }
  } else {
    res.status(404).send("<h1>404 - File Not Found</h1>");
  }
});

const server = app.listen(port);

module.exports = server;
