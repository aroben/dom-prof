var fs   = require('fs');
var http = require('http');

var profile = require('../index').profile;

module.exports = {
  'no jquery': {
    'profile': function(test) {
      var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(__dirname+'/test-no-jquery.html', 'utf8', function(err, data) {
          res.end(data);
        });
      }).listen(0);

      profile('http://localhost:'+server.address().port).then(function(r) {
        test.equal(6, r.dom.total);
        test.equal(3, r.dom.maxDepth);
        test.equal(2.3333333333333335, r.dom.averageDepth);
        test.equal(20, r.dom.serializedSize);

        test.equal(1, r.scriptTags);
        test.equal(0, r.stylesheetLinks);
        test.equal(0, r.inlineScripts);
        test.equal(0, r.inlineStyles);
        test.equal(2, r.globals.length);

        test.equal(4, r.cssRules.length, JSON.stringify(r.cssRules));
        test.equal(4, r.cssExplain.total);
        test.equal(1, r.cssExplain.categories.id);
        test.equal(1, r.cssExplain.categories.class);
        test.equal(1, r.cssExplain.categories.tag);
        test.equal(1, r.cssExplain.categories.universal);

        test.equal(3, r.eventListeners.total);
        test.equal(1, r.eventListeners.calls.DOMContentLoaded);
        test.equal(2, r.eventListeners.calls.click);

        test.equal(3, r.querySelector.total);
        test.equal(2, r.querySelector.calls.h1);

        server.close();
        test.done();
      }, function(err) {
        test.ifError(err);
        test.done();
      });
    }
  },

  'jquery 1.8.x': {
    'profile': function(test) {
      var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(__dirname+'/test-jquery-1-8.html', 'utf8', function(err, data) {
          res.end(data);
        });
      }).listen(0);

      profile('http://localhost:'+server.address().port).then(function(r) {
        test.equal(7, r.dom.total);
        test.equal(3, r.dom.maxDepth);
        test.equal(2.4285714285714284, r.dom.averageDepth);
        test.equal(20, r.dom.serializedSize);

        test.equal(2, r.scriptTags);
        test.equal(0, r.stylesheetLinks);
        test.equal(0, r.inlineScripts);
        test.equal(0, r.inlineStyles);
        test.equal(2, r.globals.length);

        test.equal(4, r.cssRules.length, JSON.stringify(r.cssRules));
        test.equal(4, r.cssExplain.total);
        test.equal(1, r.cssExplain.categories.id);
        test.equal(1, r.cssExplain.categories.class);
        test.equal(1, r.cssExplain.categories.tag);
        test.equal(1, r.cssExplain.categories.universal);

        test.equal(5, r.eventListeners.total);
        test.equal(1, r.eventListeners.calls.DOMContentLoaded);
        test.equal(1, r.eventListeners.calls.load);
        test.equal(1, r.eventListeners.calls.keydown);
        test.equal(2, r.eventListeners.calls.click);

        test.equal(6, r.querySelector.total);
        test.equal(1, r.querySelector.calls.h1);

        test.equal(1, r.jquery.event.ready.total);
        test.equal(1, r.jquery.event.keydown.total);
        test.equal('textarea', r.jquery.event.keydown.selectors[0]);
        test.equal(1, r.jquery.event.click.total);
        test.equal(null, r.jquery.event.focus);

        test.equal(1, r.jquery.find.total);
        test.equal(1, r.jquery.find.calls.h1);
        test.equal(1, r.jquery.find.explain.categories.tag);

        test.equal(0, r.jquery.match.total);
        test.equal(null, r.jquery.match.calls.h1);

        server.close();
        test.done();
      }, function(err) {
        test.ifError(err);
        test.done();
      });
    }
  },

  'jquery 1.9.x': {
    'profile': function(test) {
      var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(__dirname+'/test-jquery-1-9.html', 'utf8', function(err, data) {
          res.end(data);
        });
      }).listen(0);

      profile('http://localhost:'+server.address().port).then(function(r) {
        test.equal(7, r.dom.total);
        test.equal(3, r.dom.maxDepth);
        test.equal(2.4285714285714284, r.dom.averageDepth);
        test.equal(20, r.dom.serializedSize);

        test.equal(2, r.scriptTags);
        test.equal(0, r.stylesheetLinks);
        test.equal(0, r.inlineScripts);
        test.equal(0, r.inlineStyles);
        test.equal(2, r.globals.length);

        test.equal(4, r.cssRules.length, JSON.stringify(r.cssRules));
        test.equal(4, r.cssExplain.total);
        test.equal(1, r.cssExplain.categories.id);
        test.equal(1, r.cssExplain.categories.class);
        test.equal(1, r.cssExplain.categories.tag);
        test.equal(1, r.cssExplain.categories.universal);

        test.equal(5, r.eventListeners.total);
        test.equal(1, r.eventListeners.calls.DOMContentLoaded);
        test.equal(1, r.eventListeners.calls.load);
        test.equal(1, r.eventListeners.calls.keydown);
        test.equal(2, r.eventListeners.calls.click);

        test.equal(2, r.querySelector.total);
        test.equal(1, r.querySelector.calls.h1);

        test.equal(1, r.jquery.event.ready.total);
        test.equal(1, r.jquery.event.keydown.total);
        test.equal('textarea', r.jquery.event.keydown.selectors[0]);
        test.equal(1, r.jquery.event.click.total);
        test.equal(null, r.jquery.event.focus);

        test.equal(1, r.jquery.find.total);
        test.equal(1, r.jquery.find.calls.h1);
        test.equal(1, r.jquery.find.explain.categories.tag);

        test.equal(0, r.jquery.match.total);
        test.equal(null, r.jquery.match.calls.h1);

        server.close();
        test.done();
      }, function(err) {
        test.ifError(err);
        test.done();
      });
    }
  },

  'jquery 1.10.x': {
    'profile': function(test) {
      var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(__dirname+'/test-jquery-1-10.html', 'utf8', function(err, data) {
          res.end(data);
        });
      }).listen(0);

      profile('http://localhost:'+server.address().port).then(function(r) {
        test.equal(7, r.dom.total);
        test.equal(3, r.dom.maxDepth);
        test.equal(2.4285714285714284, r.dom.averageDepth);
        test.equal(20, r.dom.serializedSize);

        test.equal(2, r.scriptTags);
        test.equal(0, r.stylesheetLinks);
        test.equal(0, r.inlineScripts);
        test.equal(0, r.inlineStyles);
        test.equal(2, r.globals.length);

        test.equal(4, r.cssRules.length, JSON.stringify(r.cssRules));
        test.equal(4, r.cssExplain.total);
        test.equal(1, r.cssExplain.categories.id);
        test.equal(1, r.cssExplain.categories.class);
        test.equal(1, r.cssExplain.categories.tag);
        test.equal(1, r.cssExplain.categories.universal);

        test.equal(5, r.eventListeners.total);
        test.equal(1, r.eventListeners.calls.DOMContentLoaded);
        test.equal(1, r.eventListeners.calls.load);
        test.equal(1, r.eventListeners.calls.keydown);
        test.equal(2, r.eventListeners.calls.click);

        test.equal(2, r.querySelector.total);
        test.equal(1, r.querySelector.calls.h1);

        test.equal(1, r.jquery.event.ready.total);
        test.equal(1, r.jquery.event.keydown.total);
        test.equal('textarea', r.jquery.event.keydown.selectors[0]);
        test.equal(1, r.jquery.event.click.total);
        test.equal(null, r.jquery.event.focus);

        test.equal(1, r.jquery.find.total);
        test.equal(1, r.jquery.find.calls.h1);
        test.equal(1, r.jquery.find.explain.categories.tag);

        test.equal(0, r.jquery.match.total);
        test.equal(null, r.jquery.match.calls.h1);

        server.close();
        test.done();
      }, function(err) {
        test.ifError(err);
        test.done();
      });
    }
  },

  'jquery 1.11.x': {
    'profile': function(test) {
      var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(__dirname+'/test-jquery-1-11.html', 'utf8', function(err, data) {
          res.end(data);
        });
      }).listen(0);

      profile('http://localhost:'+server.address().port).then(function(r) {
        test.equal(7, r.dom.total);
        test.equal(3, r.dom.maxDepth);
        test.equal(2.4285714285714284, r.dom.averageDepth);
        test.equal(20, r.dom.serializedSize);

        test.equal(2, r.scriptTags);
        test.equal(0, r.stylesheetLinks);
        test.equal(0, r.inlineScripts);
        test.equal(0, r.inlineStyles);
        test.equal(2, r.globals.length);

        test.equal(4, r.cssRules.length, JSON.stringify(r.cssRules));
        test.equal(4, r.cssExplain.total);
        test.equal(1, r.cssExplain.categories.id);
        test.equal(1, r.cssExplain.categories.class);
        test.equal(1, r.cssExplain.categories.tag);
        test.equal(1, r.cssExplain.categories.universal);

        test.equal(5, r.eventListeners.total);
        test.equal(1, r.eventListeners.calls.DOMContentLoaded);
        test.equal(1, r.eventListeners.calls.load);
        test.equal(1, r.eventListeners.calls.keydown);
        test.equal(2, r.eventListeners.calls.click);

        test.equal(2, r.querySelector.total);
        test.equal(1, r.querySelector.calls.h1);

        test.equal(1, r.jquery.event.ready.total);
        test.equal(1, r.jquery.event.keydown.total);
        test.equal('textarea', r.jquery.event.keydown.selectors[0]);
        test.equal(1, r.jquery.event.click.total);
        test.equal(null, r.jquery.event.focus);

        test.equal(1, r.jquery.find.total);
        test.equal(1, r.jquery.find.calls.h1);
        test.equal(1, r.jquery.find.explain.categories.tag);

        test.equal(0, r.jquery.match.total);
        test.equal(null, r.jquery.match.calls.h1);

        server.close();
        test.done();
      }, function(err) {
        test.ifError(err);
        test.done();
      });
    }
  },

  'jquery 2.0.x': {
    'profile': function(test) {
      var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(__dirname+'/test-jquery-2-0.html', 'utf8', function(err, data) {
          res.end(data);
        });
      }).listen(0);

      profile('http://localhost:'+server.address().port).then(function(r) {
        test.equal(7, r.dom.total);
        test.equal(3, r.dom.maxDepth);
        test.equal(2.4285714285714284, r.dom.averageDepth);
        test.equal(20, r.dom.serializedSize);

        test.equal(2, r.scriptTags);
        test.equal(0, r.stylesheetLinks);
        test.equal(0, r.inlineScripts);
        test.equal(0, r.inlineStyles);
        test.equal(3, r.globals.length);

        test.equal(4, r.cssRules.length, JSON.stringify(r.cssRules));
        test.equal(4, r.cssExplain.total);
        test.equal(1, r.cssExplain.categories.id);
        test.equal(1, r.cssExplain.categories.class);
        test.equal(1, r.cssExplain.categories.tag);
        test.equal(1, r.cssExplain.categories.universal);

        test.equal(5, r.eventListeners.total);
        test.equal(1, r.eventListeners.calls.DOMContentLoaded);
        test.equal(1, r.eventListeners.calls.load);
        test.equal(1, r.eventListeners.calls.keydown);
        test.equal(2, r.eventListeners.calls.click);

        test.equal(2, r.querySelector.total);
        test.equal(1, r.querySelector.calls.h1);

        test.equal(1, r.jquery.event.ready.total);
        test.equal(1, r.jquery.event.keydown.total);
        test.equal('textarea', r.jquery.event.keydown.selectors[0]);
        test.equal(1, r.jquery.event.click.total);
        test.equal(null, r.jquery.event.focus);

        test.equal(1, r.jquery.find.total);
        test.equal(1, r.jquery.find.calls.h1);
        test.equal(1, r.jquery.find.explain.categories.tag);

        test.equal(0, r.jquery.match.total);
        test.equal(null, r.jquery.match.calls.h1);

        server.close();
        test.done();
      }, function(err) {
        test.ifError(err);
        test.done();
      });
    }
  },

  'jquery 2.1.x': {
    'profile': function(test) {
      var server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(__dirname+'/test-jquery-2-1.html', 'utf8', function(err, data) {
          res.end(data);
        });
      }).listen(0);

      profile('http://localhost:'+server.address().port).then(function(r) {
        test.equal(7, r.dom.total);
        test.equal(3, r.dom.maxDepth);
        test.equal(2.4285714285714284, r.dom.averageDepth);
        test.equal(20, r.dom.serializedSize);

        test.equal(2, r.scriptTags);
        test.equal(0, r.stylesheetLinks);
        test.equal(0, r.inlineScripts);
        test.equal(0, r.inlineStyles);
        test.equal(3, r.globals.length);

        test.equal(4, r.cssRules.length, JSON.stringify(r.cssRules));
        test.equal(4, r.cssExplain.total);
        test.equal(1, r.cssExplain.categories.id);
        test.equal(1, r.cssExplain.categories.class);
        test.equal(1, r.cssExplain.categories.tag);
        test.equal(1, r.cssExplain.categories.universal);

        test.equal(5, r.eventListeners.total);
        test.equal(1, r.eventListeners.calls.DOMContentLoaded);
        test.equal(1, r.eventListeners.calls.load);
        test.equal(1, r.eventListeners.calls.keydown);
        test.equal(2, r.eventListeners.calls.click);

        test.equal(2, r.querySelector.total);
        test.equal(1, r.querySelector.calls.h1);

        test.equal(1, r.jquery.event.ready.total);
        test.equal(1, r.jquery.event.keydown.total);
        test.equal('textarea', r.jquery.event.keydown.selectors[0]);
        test.equal(1, r.jquery.event.click.total);
        test.equal(null, r.jquery.event.focus);

        test.equal(1, r.jquery.find.total);
        test.equal(1, r.jquery.find.calls.h1);
        test.equal(1, r.jquery.find.explain.categories.tag);

        test.equal(0, r.jquery.match.total);
        test.equal(null, r.jquery.match.calls.h1);

        server.close();
        test.done();
      }, function(err) {
        test.ifError(err);
        test.done();
      });
    }
  }
};
