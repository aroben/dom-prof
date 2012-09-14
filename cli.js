#!/usr/bin/env node
var profile = require('./index').profile;
var inspect = require('util').inspect;

profile(process.argv[2], function(err, report) {
  if (err) throw err;
  console.log(inspect(report, false, 10, true));
});
