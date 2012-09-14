{exec} = require 'child_process'
{cssExplain} = require 'css-explain'

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


exports.profile = (url, callback) ->
  exec "phantomjs --web-security=no #{__dirname}/runner.js #{url}", (error, stdout, stderr) ->
    if error
      callback error
    else
      try
        report = JSON.parse stdout
      catch e
        callback e
        return

      report.cssExplain = explainCssSelectors report.cssRules

      report.jquery.find.explain  = explainCssSelectors (k for k, v of report.jquery.find.calls)
      report.jquery.match.explain = explainCssSelectors (k for k, v of report.jquery.match.calls)

      for name, props of report.jquery.event when props.selectors?.length
        report.jquery.event[name].explain = explainCssSelectors props.selectors

      callback undefined, report
