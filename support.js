(function() {
  var calls, computeByteSize, computeNodesStats, computeSerializedDomSize, countParentNodes, enabled, findGlobals, findInlineScripts, findInlineStyles, findJqueryEventHandlers, findScripts, findStylesheetLinks, hasInlineScript, inlineEventAttrs, jQuery, now, wrap;

  now = function() {
    var d;
    d = new Date;
    return d.getTime();
  };

  enabled = true;

  wrap = function(obj, name, callback) {
    var fun;
    fun = obj[name];
    return obj[name] = function() {
      var result;
      result = fun.apply(this, arguments);
      if (enabled) {
        callback.apply(this, arguments).call(this, result);
      }
      return result;
    };
  };

  calls = {};

  calls.addEventListener = [];

  wrap(window, 'addEventListener', function(name, listener, capture) {
    return function() {
      return calls.addEventListener.push({
        node: 'window',
        timestamp: now(),
        name: name,
        capture: capture
      });
    };
  });

  wrap(document, 'addEventListener', function(name, listener, capture) {
    return function() {
      return calls.addEventListener.push({
        node: 'document',
        timestamp: now(),
        name: name,
        capture: capture
      });
    };
  });

  wrap(Element.prototype, 'addEventListener', function(name, listener, capture) {
    return function() {
      return calls.addEventListener.push({
        node: this.nodeName.toLowerCase(),
        timestamp: now(),
        name: name,
        capture: capture
      });
    };
  });

  calls.getElementById = [];

  wrap(document, 'getElementById', function(id) {
    return function(node) {
      return calls.getElementById.push({
        timestamp: now(),
        selector: "#" + id,
        nodes: (node ? 1 : 0)
      });
    };
  });

  calls.getElementsByTagName = [];

  wrap(document, 'getElementsByTagName', function(tag) {
    return function(nodes) {
      return calls.getElementsByTagName.push({
        timestamp: now(),
        selector: tag,
        nodes: nodes.length
      });
    };
  });

  wrap(Element.prototype, 'getElementsByTagName', function(tag) {
    return function(nodes) {
      return calls.getElementsByTagName.push({
        timestamp: now(),
        selector: tag,
        nodes: nodes.length
      });
    };
  });

  calls.getElementsByClassName = [];

  wrap(document, 'getElementsByClassName', function(name) {
    return function(nodes) {
      return calls.getElementsByClassName.push({
        timestamp: now(),
        selector: "." + name,
        nodes: nodes.length
      });
    };
  });

  wrap(Element.prototype, 'getElementsByClassName', function(name) {
    return function(nodes) {
      return calls.getElementsByClassName.push({
        timestamp: now(),
        selector: "." + name,
        nodes: nodes.length
      });
    };
  });

  calls.querySelectorAll = [];

  wrap(document, 'querySelectorAll', function(selector) {
    return function(nodes) {
      return calls.querySelectorAll.push({
        timestamp: now(),
        selector: selector,
        nodes: nodes.length
      });
    };
  });

  wrap(Element.prototype, 'querySelectorAll', function(selector) {
    return function(nodes) {
      return calls.querySelectorAll.push({
        timestamp: now(),
        selector: selector,
        nodes: nodes.length
      });
    };
  });

  calls.querySelector = [];

  wrap(document, 'querySelector', function(selector) {
    return function(node) {
      return calls.querySelector.push({
        timestamp: now(),
        selector: selector,
        nodes: (node ? 1 : 0)
      });
    };
  });

  wrap(Element.prototype, 'querySelector', function(selector) {
    return function(node) {
      return calls.querySelector.push({
        timestamp: now(),
        selector: selector,
        nodes: (node ? 1 : 0)
      });
    };
  });

  jQuery = null;

  window.__defineGetter__('jQuery', function() {
    return jQuery;
  });

  window.__defineSetter__('jQuery', function($) {
    var oldFind, prop, value;
    calls.jquery = {};
    calls.jquery.ready = [];
    wrap($.ready, 'promise', function() {
      return function() {
        return calls.jquery.ready.push({
          timestamp: now()
        });
      };
    });
    oldFind = $.find;
    calls.jquery.find = [];
    wrap($, 'find', function(selector) {
      return function(nodes) {
        return calls.jquery.find.push({
          timestamp: now(),
          selector: selector,
          nodes: nodes.length
        });
      };
    });
    for (prop in oldFind) {
      value = oldFind[prop];
      $.find[prop] = value;
    }
    calls.jquery.match = [];
    wrap($.find, 'matches', function(expr) {
      return function(matched) {
        return calls.jquery.match.push({
          timestamp: now(),
          selector: expr,
          matched: matched
        });
      };
    });
    wrap($.find, 'matchesSelector', function(node, expr) {
      return function(matched) {
        return calls.jquery.match.push({
          timestamp: now(),
          selector: expr,
          matched: matched
        });
      };
    });
    return jQuery = $;
  });

  countParentNodes = function(node) {
    var count;
    count = 0;
    while (node = node.parentNode) {
      count++;
    }
    return count;
  };

  computeNodesStats = function() {
    var count, max, node, nodes, total, _i, _len;
    total = 0;
    max = 0;
    nodes = document.getElementsByTagName('*');
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      count = countParentNodes(node);
      total += count;
      if (count > max) {
        max = count;
      }
    }
    return {
      total: nodes.length,
      maxDepth: max,
      averageDepth: total / nodes.length
    };
  };

  computeByteSize = function(string) {
    var bytes, charCode, i, _i, _ref;
    bytes = 0;
    for (i = _i = 0, _ref = string.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      charCode = string.charCodeAt(i);
      if (charCode <= 0x7F) {
        bytes += 1;
      } else if (charCode <= 0x7FF) {
        bytes += 2;
      } else if (charCode <= 0xFFFF) {
        bytes += 3;
      } else {
        bytes += 4;
      }
    }
    return bytes;
  };

  computeSerializedDomSize = function() {
    return computeByteSize(new XMLSerializer().serializeToString(document));
  };

  findScripts = function() {
    return document.getElementsByTagName('script');
  };

  findStylesheetLinks = function() {
    var link, _i, _len, _ref, _results;
    _ref = document.getElementsByTagName('link');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      link = _ref[_i];
      if (link.rel === 'stylesheet') {
        _results.push(link);
      }
    }
    return _results;
  };

  inlineEventAttrs = ['onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onclick', 'ondblclick', 'onmousemove', 'onload', 'onerror', 'onbeforeunload', 'onfocus', 'onblur', 'ontouchstart', 'ontouchend', 'ontouchmove'];

  hasInlineScript = function(node) {
    var attr, _i, _len;
    if (node.href && node.href.indexOf('javascript:') === 0) {
      return true;
    }
    for (_i = 0, _len = inlineEventAttrs.length; _i < _len; _i++) {
      attr = inlineEventAttrs[_i];
      if (node.getAttribute(attr)) {
        return true;
      }
    }
    return false;
  };

  findInlineScripts = function() {
    var node, _i, _len, _ref, _results;
    _ref = document.getElementsByTagName('*');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      if (hasInlineScript(node)) {
        _results.push(node);
      }
    }
    return _results;
  };

  findInlineStyles = function() {
    var node, _i, _len, _ref, _results;
    _ref = document.getElementsByTagName('*');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      if (node.style.cssText.length > 0) {
        _results.push(node);
      }
    }
    return _results;
  };

  findGlobals = function() {
    var iframe, name, prop, properties, _results;
    properties = {};
    for (prop in window) {
      properties[prop] = true;
    }
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);
    for (prop in iframe.contentWindow) {
      delete properties[prop];
    }
    document.body.removeChild(iframe);
    delete properties.$report;
    delete properties._phantom;
    delete properties.callPhantom;
    _results = [];
    for (name in properties) {
      _results.push(name);
    }
    return _results;
  };

  findJqueryEventHandlers = function() {
    var events, handler, handlers, key, node, nodes, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2;
    if (typeof $ === "undefined" || $ === null) {
      return {};
    }
    nodes = document.getElementsByTagName('*');
    events = {};
    _ref = $._data(window, 'events');
    for (key in _ref) {
      handlers = _ref[key];
      if (events[key] == null) {
        events[key] = [];
      }
      for (_i = 0, _len = handlers.length; _i < _len; _i++) {
        handler = handlers[_i];
        events[key].push(handler);
      }
    }
    _ref1 = $._data(document, 'events');
    for (key in _ref1) {
      handlers = _ref1[key];
      if (events[key] == null) {
        events[key] = [];
      }
      for (_j = 0, _len1 = handlers.length; _j < _len1; _j++) {
        handler = handlers[_j];
        events[key].push(handler);
      }
    }
    for (_k = 0, _len2 = nodes.length; _k < _len2; _k++) {
      node = nodes[_k];
      _ref2 = $._data(node, 'events');
      for (key in _ref2) {
        handlers = _ref2[key];
        if (events[key] == null) {
          events[key] = [];
        }
        for (_l = 0, _len3 = handlers.length; _l < _len3; _l++) {
          handler = handlers[_l];
          events[key].push(handler);
        }
      }
    }
    return events;
  };

  window.$report = function() {
    var cssRule, h, handlers, name, report, styleSheet, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    enabled = false;
    report = {
      scriptTags: findScripts().length,
      stylesheetLinks: findStylesheetLinks().length,
      inlineScripts: findInlineScripts().length,
      inlineStyles: findInlineStyles().length,
      globals: findGlobals()
    };
    report.dom = computeNodesStats();
    report.dom.serializedSize = computeSerializedDomSize();
    report.calls = calls;
    report.cssRules = [];
    _ref = document.styleSheets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      styleSheet = _ref[_i];
      _ref1 = styleSheet.cssRules;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        cssRule = _ref1[_j];
        if (cssRule.selectorText) {
          report.cssRules.push(cssRule.selectorText);
        }
      }
    }
    report.jquery = {
      event: {}
    };
    _ref2 = findJqueryEventHandlers();
    for (name in _ref2) {
      handlers = _ref2[name];
      report.jquery.event[name] = {
        total: handlers.length,
        selectors: (function() {
          var _k, _len2, _results;
          _results = [];
          for (_k = 0, _len2 = handlers.length; _k < _len2; _k++) {
            h = handlers[_k];
            if (h.selector) {
              _results.push(h.selector);
            }
          }
          return _results;
        })()
      };
    }
    return report;
  };

}).call(this);
