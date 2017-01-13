#!/usr/bin/env node

var archiveHelpers = require(__dirname + '/' + '../helpers/archive-helpers.js');
archiveHelpers.readListOfUrls(archiveHelpers.downloadUrls);
