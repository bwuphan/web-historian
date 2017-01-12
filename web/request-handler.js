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
  if(req.method === 'POST') {
    // req.on('data', function(data) {

    // })
    var isArchived;
      archive.isUrlArchived(pathName, function(found) {
        isArchived = found;
      });
    if(!isArchived){
      archive.readListOfUrls(()=>{})
      .then(function(listArray){
        archive.isUrlInList(req.url, ()=>{})
      })
      .then(function(bool){
        if(!bool){
          req.on('data', function(data) {
            var dataString = data.toString().slice(4, data.length);
            console.log('data is ' + dataString)
            archive.addUrlToList(dataString, ()=>{});
          });
        }
      })
      .then(function(){
        console.log('WE IN HERE');
        res.writeHead(302);
        res.end("added to list");
        console.log('after response');
      })
    }
  } else if(req.method === 'GET'){
    console.log(`Serving method ${req.method} from ${req.url}`);
    if ( req.url === '/' ) {
      console.log('IN ROOT', req.method);
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
      console.log('we in here' + req.method)
      var isArchived;
      archive.isUrlArchived(pathName, function(found) {
        isArchived = found;
      });
      if(req.method === 'GET') {
        if(isArchived) {
          promiseReadFile(archive.paths.archivedSites + '/' + pathName)
          .then(function(data){
            console.log('dtt', data.toString());
            res.end(data.toString());
          });
        } else {
          res.writeHead(404);
          res.end("Not Found");
        }
      } else if ( req.method === 'POST' ){
        // POST stuff
        if(!isArchived){
          archive.readListOfUrls(()=>{})
          .then(function(listArray){
            archive.isUrlInList(req.url, ()=>{})
          })
          .then(function(bool){
            if(!bool){
              archive.addUrlToList(req.url, ()=>{});
              res.writeHead(302);
              res.end("added to list");
            }
          })
        }
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
};
