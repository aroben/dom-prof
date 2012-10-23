var fs   = require('fs');
var http = require('http');

var profile = require('./index').profile;

module.exports = {
  "profile": function(test) {
    var server = http.createServer(function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      fs.readFile(__dirname+'/test.html', 'utf8', function(err, data) {
        res.end(data);
      });
    }).listen(0);

    profile("http://localhost:"+server.address().port, function(err, r) {
      test.ifError(err);
      if (err) return test.done();

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

      test.equal(1, r.eventListeners.keydown)
      test.equal(1, r.eventListeners.keydown)

      test.equal(1, r.jquery.event.ready.total);
      test.equal(1, r.jquery.event.keydown.total);
      test.equal('textarea', r.jquery.event.keydown.selectors[0]);
      test.equal(1, r.jquery.event.click.total);
      test.equal(null, r.jquery.event.focus);

      test.equal(1, r.jquery.find.total);
      test.equal(1, r.jquery.find.calls['h1']);
      test.equal(1, r.jquery.find.explain.categories.tag);

      test.equal(0, r.jquery.match.total);
      test.equal(null, r.jquery.match.calls['h1']);

      server.close();
      test.done();
    });
  }
};
