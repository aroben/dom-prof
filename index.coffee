{spawn} = require 'child_process'
{cssExplain} = require 'css-explain'
{Promise} = require 'es6-promise'
phantomjsPath = require('phantomjs').path

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
  new Promise (resolve, reject) ->
    phantomjs = spawn phantomjsPath, ['--web-security=no', "#{__dirname}/runner.js", url]

    stdout = []
    phantomjs.stdout.setEncoding 'utf8'
    phantomjs.stdout.on 'data', (data) ->
      stdout.push data

    phantomjs.on 'error', (err) ->
      reject err

    phantomjs.on 'exit', (code) ->
      if code isnt 0
        reject new Error "phantomjs exited with code #{code}"
      else
        try
          report = JSON.parse stdout.join("")
        catch e
          reject new Error stdout.join("")
          return

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

        resolve report
