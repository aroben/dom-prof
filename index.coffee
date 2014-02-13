{cssExplain} = require 'css-explain'
{Promise} = require 'es6-promise'
phantomjs = require 'phantomjs'

childProcess = require 'child_process'
execFile = (args...) ->
  new Promise (resolve, reject) ->
    childProcess.execFile args..., (error, args...) ->
      if error then reject(error) else resolve(args)


# Run CSS Explain on selectors and aggregate the results
explainCssSelectors = (selectors) ->
  return unless selectors and selectors.length

  total = 0

  categories =
    id: 0, class: 0, tag: 0, universal: 0

  scores =
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 0, 7: 0, 8: 0, 9: 0, 10: 0

  keys = {}

  for report in cssExplain selectors
    categories[report.category] += 1
    scores[report.score] += 1
    keys[report.key] ?= 0
    keys[report.key] += 1
    total++

  {total, categories, scores, keys}

aggregateCallLog = (calls, propName) ->
  report = total: 0, calls: {}

  for call in calls
    prop = call[propName]
    report.calls[prop] ?= 0
    report.calls[prop]++
    report.total++

  if propName is 'selector'
    report.explain = explainCssSelectors (k for k, v of report.calls)

  report


exports.profile = (url) ->
  execFile(phantomjs.path, ['--web-security=no', "#{__dirname}/runner.js", url], maxBuffer: 1024*1024).then ([stdout]) ->
    report = JSON.parse stdout
    report.cssExplain = explainCssSelectors report.cssRules

    report.eventListeners = aggregateCallLog report.calls.addEventListener, 'name'
    report.querySelector  = aggregateCallLog report.calls.querySelector.concat(report.calls.querySelectorAll), 'selector'

    report.jquery.find  = aggregateCallLog report.calls.jquery.find, 'selector'
    report.jquery.match = aggregateCallLog report.calls.jquery.match, 'selector'

    report.jquery.event.ready = total: 0
    for call in report.calls.jquery.ready
      report.jquery.event.ready.total++

    for name, props of report.jquery.event when props.selectors?.length
      report.jquery.event[name].explain = explainCssSelectors props.selectors

    report
