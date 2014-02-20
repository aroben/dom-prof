# dom-prof

Node/PhantomJS DOM profiler. Based off some of the ideas in [dom-monster](https://github.com/madrobby/dom-monster).


## Usage

``` javascript
var profile = require('dom-prof').profile;
profile("http://google.com").then(function(report) {
  console.log(report);
});
```


## Contributing


    $ git clone https://github.com/josh/dom-prof.git
    $ cd dom-prof/
    $ npm install

Run tests

    $ grunt test


## See Also

* [css-explain](https://github.com/josh/css-explain)
