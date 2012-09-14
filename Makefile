%.js: %.coffee
	./node_modules/.bin/coffee -c $<

node_modules:
	npm install

build: node_modules index.js support.js

test: build
	./node_modules/.bin/nodeunit test.js

.PHONY: test
