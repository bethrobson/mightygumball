/* serverJsonp.js */

var http = require('http');
var url = require('url');
var cities = require("./cities.js");

var time;
var callback;

var log = createLog();
updateLog();


http.createServer(function (req, res) {
	var uri = url.parse(req.url).pathname;  
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(getResponse(url.parse(req.url).query));
}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1');
console.log("Listening on 8214");

function getResponse(query) {
	var now = 0;
	if (query) {
		var queryVars = query.split("&");
		for (var i=0; i < queryVars.length; i++) {
			// get the callback function name
			if (queryVars[i].substr(0, 8) == "callback") {
				var pos = queryVars[i].indexOf("=", 0);
				if (pos > 0) {
					callback = queryVars[i].substr(pos+1);
				}
			}
			// this acts as the random string on the query
			else if (queryVars[i].substr(0, 6) == "random") {
				var pos = queryVars[i].indexOf("=", 0);
				if (pos > 0) {
					now = queryVars[i].substr(pos+1);
				}
			}
			// this is the newest time stamp
			else if (queryVars[i].substr(0, 14) == "lastreporttime") {
				var pos = queryVars[i].indexOf("=", 0);
				if (pos > 0) {
					time = queryVars[i].substr(pos+1);
				}
			}
		}
	}
	else {
		time = query;
	}
	
	var response = [];
	var start;
	
	if (parseInt(time)) {
		start = getStart(time);
	} else {
		start = 1;
	}
	
	
	// create the response using the <start> newest 
	// cities. The newest timestamp is at response[0]!!
	//for (i = 0; i <= start; i++) {
	for (i = start; i >= 0; i--) {
		response.push(log[i]);
	}
	if (callback != "" && callback != undefined) {
		return callback + "(" + JSON.stringify(response) + ");";
	}
	// work with the prev index.html
	else {
		return JSON.stringify(response);
	}
}

// find the cities since the last request
// based on the "lastreporttime" paramter.
// If no info, then return 9 (so we return 9 cities)
function getStart(time) {
	var time = parseInt(time, 10);
	
	if (!time) return 1;
	for(i = 0; i <= 999;i++) {
		var cityTime = parseInt(log[i].time, 10);
		if (time >= cityTime) {
			return i-1;
		}
	}	
	return 9;
}

// create the initial log
function createLog() {
   log = [];
   
   for(i=0;i<1000;i++) {
      log[i] = createGumballReport();
   }
   return log;
}

// update the log by shifting everything in the log
// down by one (so log[1] gets the value of log[0]).
// Then create a new city report for log[0].
// Do this every few miliseconds.
function updateLog() {
	var log2 = [];
	for(i = 0; i < 999; i++) {
		log2[i+1] = log[i];
	}
	
    log2[0] = createGumballReport();
	log = log2;
	
	console.log("update with " + log2[0].name);
	setTimeout(updateLog, Math.floor(Math.random()*5000 + 2000));
}

function createGumballReport() {
	var date = new Date();
	ind = Math.floor(Math.random() * cities.city.length);
	sold = Math.floor(Math.random()*9 + 1);
	cityName = cities.city[ind].Name;
	cityTime = date.getTime();
	cityLong = cities.city[ind].Longitude;
	cityLat = cities.city[ind].Latitude;

	return {name: cityName, time: cityTime, sales: sold, longitude: cityLong, latitude: cityLat };
}
