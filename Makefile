demo: demo/demo.js demo/com/*
	browserify -o demo/build.js demo/demo.js -t reactify
