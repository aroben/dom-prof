(function() {
  var Promise, aggregateCallLog, cssExplain, execFile, explainCssSelectors, phantomjs;

  execFile = require('child_process').execFile;

  cssExplain = require('css-explain').cssExplain;

  Promise = require('es6-promise').Promise;

  phantomjs = require('phantomjs');

  explainCssSelectors = function(selectors) {
    var categories, keys, report, scores, total, _i, _len, _name, _ref;
    if (!(selectors && selectors.length)) {
      return;
    }
    total = 0;
    categories = {
      id: 0,
      "class": 0,
      tag: 0,
      universal: 0
    };
    scores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0
    };
    keys = {};
    _ref = cssExplain(selectors);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      report = _ref[_i];
      categories[report.category] += 1;
      scores[report.score] += 1;
      if (keys[_name = report.key] == null) {
        keys[_name] = 0;
      }
      keys[report.key] += 1;
      total++;
    }
    return {
      total: total,
      categories: categories,
      scores: scores,
      keys: keys
    };
  };

  aggregateCallLog = function(calls, propName) {
    var call, k, prop, report, v, _base, _i, _len;
    report = {
      total: 0,
      calls: {}
    };
    for (_i = 0, _len = calls.length; _i < _len; _i++) {
      call = calls[_i];
      prop = call[propName];
      if ((_base = report.calls)[prop] == null) {
        _base[prop] = 0;
      }
      report.calls[prop]++;
      report.total++;
    }
    if (propName === 'selector') {
      report.explain = explainCssSelectors((function() {
        var _ref, _results;
        _ref = report.calls;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push(k);
        }
        return _results;
      })());
    }
    return report;
  };

  exports.profile = function(url) {
    return new Promise(function(resolve, reject) {
      return execFile(phantomjs.path, ['--web-security=no', "" + __dirname + "/runner.js", url], function(error, stdout) {
        var call, name, props, report, _i, _len, _ref, _ref1, _ref2;
        if (error) {
          return reject(error);
        }
        report = JSON.parse(stdout);
        report.cssExplain = explainCssSelectors(report.cssRules);
        report.eventListeners = aggregateCallLog(report.calls.addEventListener, 'name');
        report.querySelector = aggregateCallLog(report.calls.querySelector.concat(report.calls.querySelectorAll), 'selector');
        report.jquery.find = aggregateCallLog(report.calls.jquery.find, 'selector');
        report.jquery.match = aggregateCallLog(report.calls.jquery.match, 'selector');
        report.jquery.event.ready = {
          total: 0
        };
        _ref = report.calls.jquery.ready;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          call = _ref[_i];
          report.jquery.event.ready.total++;
        }
        _ref1 = report.jquery.event;
        for (name in _ref1) {
          props = _ref1[name];
          if ((_ref2 = props.selectors) != null ? _ref2.length : void 0) {
            report.jquery.event[name].explain = explainCssSelectors(props.selectors);
          }
        }
        return resolve(report);
      });
    });
  };

}).call(this);
