now = ->
  d = new Date
  d.getTime()

wrap = (obj, name, callback) ->
  fun = obj[name]
  obj[name] = ->
    result = fun.apply this, arguments
    callback.apply(this, arguments).call(this, result)
    result


addEventListenerCalls = []

wrap window, 'addEventListener', (name, listener, capture) -> ->
  addEventListenerCalls.push {node: 'window', timestamp: now(), name: name, capture: capture}

wrap document, 'addEventListener', (name, listener, capture) -> ->
  addEventListenerCalls.push {node: 'document', timestamp: now(), name: name, capture: capture}

wrap Element.prototype, 'addEventListener', (name, listener, capture) -> ->
  addEventListenerCalls.push {node: @nodeName.toLowerCase(), timestamp: now(), name: name, capture: capture}


querySelectorAllCalls = []
querySelectorCalls = []

wrap document, 'querySelectorAll', (selector) -> (nodes) ->
  querySelectorAllCalls.push {timestamp: now(), selector: selector, nodes: nodes.length}

wrap Element.prototype, 'querySelectorAll', (selector) -> (nodes) ->
  querySelectorAllCalls.push {timestamp: now(), selector: selector, nodes: nodes.length}

wrap document, 'querySelector', (selector) -> (node) ->
  querySelectorCalls.push {timestamp: now(), selector: selector, nodes: (if node then 1 else 0)}

wrap Element.prototype, 'querySelector', (selector) -> (node) ->
  querySelectorCalls.push {timestamp: now(), selector: selector, nodes: (if node then 1 else 0)}



jQuery = null

window.__defineGetter__ 'jQuery', -> jQuery

jqueryReadyCalls = []
jqueryFindCalls  = []
jqueryMatchCalls = []

# Monkey patch jQuery with tracers when its defined
window.__defineSetter__ 'jQuery', ($) ->

  wrap $.ready, 'promise', -> ->
    jqueryReadyCalls.push {timestamp: now()}

  oldFind = $.find

  wrap $, 'find', (selector) -> (nodes) ->
    jqueryFindCalls.push {timestamp: now(), selector: selector, nodes: nodes.length}

  $.find[prop] = value for prop, value of oldFind

  wrap $.find, 'matches', (expr) -> (matched) ->
    jqueryMatchCalls.push {timestamp: now(), selector: expr, matched: matched}

  wrap $.find, 'matchesSelector', (node, expr) -> (matched) ->
    jqueryMatchCalls.push {timestamp: now(), selector: expr, matched: matched}

  jQuery = $


# Counts the number of parents a node has.
#
# node - DOM node
#
# Returns the Number count.
countParentNodes = (node) ->
  count = 0
  while node = node.parentNode
    count++
  count

# Computes DOM node nesting stats.
#
# total        - Total Number of DOM nodes
# maxDepth     - Highest Number of DOM nesting
# averageDepth - Average Number of DOM nesting
#
# Returns an Object with the stats.
computeNodesStats = ->
  total = 0
  max   = 0
  nodes = document.getElementsByTagName '*'

  for node in nodes
    count = countParentNodes node
    total += count
    max = count if count > max

  total: nodes.length, maxDepth: max, averageDepth: total/nodes.length

# Compute number of bytes for UTF-8 String.
#
# string - String
#
# Returns Number of bytes.
computeByteSize = (string) ->
  bytes = 0
  for i in [0...string.length]
    charCode = string.charCodeAt i
    if charCode <= 0x7F
      bytes += 1
    else if charCode <= 0x7FF
      bytes += 2
    else if charCode <= 0xFFFF
      bytes += 3
    else
      bytes += 4
  bytes

# Computes size of serialized DOM.
#
# Returns Number of bytes.
computeSerializedDomSize = ->
  computeByteSize document.body.innerHTML

# Finds all <script> elements.
#
# Returns an Array of Elements.
findScripts = ->
  document.getElementsByTagName 'script'

# Finds all <link rel=stylesheet> elements.
#
# Returns an Array of Elements.
findStylesheetLinks = ->
  link for link in document.getElementsByTagName 'link' when link.rel is 'stylesheet'

inlineEventAttrs = [
  'onmouseover'
  'onmouseout'
  'onmousedown'
  'onmouseup'
  'onclick'
  'ondblclick'
  'onmousemove'
  'onload'
  'onerror'
  'onbeforeunload'
  'onfocus'
  'onblur'
  'ontouchstart'
  'ontouchend'
  'ontouchmove'
]

# Tests if node has any inline script handlers attached to it.
#
# node - DOM Node
#
# Returns true or false.
hasInlineScript = (node) ->
  if node.href and node.href.indexOf('javascript:') is 0
    return true

  for attr in inlineEventAttrs when node.getAttribute attr
    return true

  false

# Finds all Elements with inline script handlers.
#
# Returns an Array of Elements.
findInlineScripts = ->
  node for node in document.getElementsByTagName '*' when hasInlineScript node

# Finds all Elements with inline styles.
#
# Returns an Array of Elements.
findInlineStyles = ->
  node for node in document.getElementsByTagName '*' when node.style.cssText.length > 0

# Finds all globals properties on the window that aren't built into
# the browser.
#
# Returns an Array of property name Strings.
findGlobals = ->
  properties = {}

  for prop of window
    properties[prop] = true

  # Remove props that exist in a clean environment
  iframe = document.createElement 'iframe'
  iframe.style.display = 'none'
  iframe.src = 'about:blank'
  document.body.appendChild iframe
  delete properties[prop] for prop of iframe.contentWindow
  document.body.removeChild iframe

  delete properties.$report
  delete properties._phantom
  delete properties.callPhantom

  name for name of properties

# Finds all event handlers on the page.
#
# Returns an Object of event names mapping to an Array of handlers.
findJqueryEventHandlers = ->
  return {} unless $?

  nodes = document.getElementsByTagName '*'

  events = {}

  for key, handlers of $._data window, 'events'
    events[key] ?= []
    for handler in handlers
      events[key].push handler

  for key, handlers of $._data document, 'events'
    events[key] ?= []
    for handler in handlers
      events[key].push handler

  for node in nodes
    for key, handlers of $._data node, 'events'
      events[key] ?= []
      for handler in handlers
        events[key].push handler

  events


window.$report = ->
  report =
    scriptTags: findScripts().length
    stylesheetLinks: findStylesheetLinks().length
    inlineScripts: findInlineScripts().length
    inlineStyles: findInlineStyles().length
    globals: findGlobals()

  report.dom = computeNodesStats()
  report.dom.serializedSize = computeSerializedDomSize()

  report.calls =
    addEventListener: addEventListenerCalls
    querySelectorAll: querySelectorAllCalls
    querySelector: querySelectorCalls
    jquery:
      ready: jqueryReadyCalls
      find: jqueryFindCalls
      match: jqueryMatchCalls

  report.cssRules = []
  for styleSheet in document.styleSheets
    for cssRule in styleSheet.cssRules when cssRule.selectorText
      report.cssRules.push cssRule.selectorText

  report.jquery =
    event: {}

  for name, handlers of findJqueryEventHandlers()
    report.jquery.event[name] =
      total: handlers.length
      selectors: (h.selector for h in handlers when h.selector)

  report
