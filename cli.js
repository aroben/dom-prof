#!/usr/bin/env node
var profile = require('./index').profile;
var inspect = require('util').inspect;

var url = process.argv[2];

if (url) {
  profile(url).then(function(report) {
    console.log(inspect(report, false, 10, true));
  }, function(err) {
    console.error(err);
  });
} else {
  console.error('dom-prof <url>');
}
