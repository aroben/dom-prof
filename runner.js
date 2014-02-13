var page = require('webpage').create();

page.onInitialized = function() {
  return page.injectJs('support.js');
};

page.onLoadFinished = function() {
  var report = page.evaluate(function() {
    return window.$report();
  });
  console.log(JSON.stringify(report));
  return phantom.exit();
};

page.open(phantom.args[0]);
