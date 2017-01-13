var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Promise = require('bluebird');
var http = require('http');
/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */
var promisifyReadFile = Promise.promisify(fs.readFile);
var promisifyWriteFile = Promise.promisify(fs.writeFile);
var promisifyAppend = Promise.promisify(fs.appendFile);
var paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};


// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggsest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  return promisifyReadFile(paths.list)
    .then(function(list) {
      var result = list.toString().split("\n");
      callback(result);
      return result;
    })
};

exports.isUrlInList = function(url, callback) {
  // sites.txt
  exports.readListOfUrls(() =>{})
  .then(function(list) {
    var bool = list.indexOf(url) !== -1;
    callback(bool)
    return bool;
  })
  .catch(function(err){
    console.log('error', err)
  });
};

exports.addUrlToList = function(url, callback) {

  promisifyAppend(paths.list, url + '\n')
  .then(function() {
    callback();
  })

};

exports.isUrlArchived = function(url, callback) {
  var files = fs.readdirSync(paths.archivedSites);
  var found = false;
  for(var i = 0; i < files.length; i++) {
    console.log(files[i] + ' === ' + url)
    if (files[i] === url) {
      var found = true;
    }
  }
  callback(found);
};

exports.downloadUrls = function(urls) {
  urls.forEach(function(url) {
    var file = fs.createWriteStream(paths.archivedSites + '/' + url);
    var request = http.get('http://' + url, function(response) {
      response.pipe(file);
    });
  });
  promisifyWriteFile(paths.list, '')
};

exports.paths = paths;
