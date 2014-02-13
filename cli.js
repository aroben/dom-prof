#!/usr/bin/env node
var profile = require('./index').profile;
var inspect = require('util').inspect;

var url = process.argv[2];

if (url) {
  profile(url, function(err, report) {
    if (err) {
      throw err;
    }
    console.log(inspect(report, false, 10, true));
  });
} else {
  console.error('dom-prof <url>');
}
