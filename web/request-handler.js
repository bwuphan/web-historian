var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var Promise = require('bluebird');
var url = require('url');

var promiseReadFile = Promise.promisify(fs.readFile);
var promiseWriteFile = Promise.promisify(fs.writeFile);

exports.handleRequest = function (req, res) {
  var pathName = url.parse(req.url).pathname.slice(1);
  // console.log('pathName', pathName);
  if(req.method === 'GET'){
    console.log(`Serving method ${req.method} from ${req.url}`);
    if ( req.url === '/' ) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      promiseReadFile(`${archive.paths.siteAssets}/index.html`)
        .then(function(data){
          res.end(data.toString());
        })
        .catch(function(err){
          console.log('error ' + err);
        });
      //fs.readFile(`${archive.paths.siteAssets}/index.html`, (err, data) => {
      //res.end(data);
      //});

    } else if (/^www/.test(pathName)) {
      if(archive.isUrlArchived(pathName)) {
        promiseReadFile(archive.paths.archivedSites + '/' + pathName)
        .then(function(data){
          console.log('dtt', data.toString());
          res.end(data.toString());
        });
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
};
