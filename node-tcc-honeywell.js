var request = require('request');
var hdrs = require('./requestHeaders');

// status codes that apparently get returned from successful web requests
const ConnectSuccess = 200;
const PostSuccess = 302;

// expects an object that tracks status and stores connection info, incuding at least the following:
// {usrName: "user", passwd: "pass", deviceID: 123, jar: cookieJar}
// and a callback function
var tccLogin = function(connection, callback) {
	request(hdrs.defaults(connection), function(getErr1, getResponse1) {	// GET 1
		if (getErr1 || getResponse1.statusCode != ConnectSuccess) {			// Status Code 200 = OK
			console.log('Login to TCC Failed (error at first GET)', getErr1);
			connection.connected = false;
			connection.statusCode = getResponse1.statusCode;
			return connection;
		} else {
			console.log('Successful first GET Connection, Status Code ' + getResponse1.statusCode);
			connection.statusCode = getResponse1.statusCode;
			request(hdrs.postDefaults(connection), function (postErr, postResponse) {		// POST
				if (postErr || postResponse.statusCode != PostSuccess) {		// Status Code 302 is successful post (?)
					console.log('Login to TCC Failed (POST error)', postErr);
					if (postResponse) console.log(postResponse.statusCode);
					connection.connected = false;
					connection.statusCode = 'Post Error: ' + postErr.statusCode + '. Post Response: ' + (postResponse) ? postResponse.statusCode : '';
					return connection;
				} else {
					console.log('Successful POST, Status Code ' + postResponse.statusCode);
					connection.statusCode = postResponse.statusCode
					request(hdrs.defaults(connection), function(getErr2, getResponse2) {		// GET 2
						if (getErr2 || getResponse2.statusCode != ConnectSuccess) {
							console.log('Login to TCC Failed (error at second GET)', getErr2);
							if (getResponse2) console.log(getResponse2.statusCode);
							connection.connected = false;
							connection.statusCode = 'Get Error: ' + getErr2 + '. Get Response: ' + (getResponse2) ? getResponse2.statusCode : '';
							return connection;
						} else {
							console.log('Successful second GET Connection, Status Code ' + getResponse2.statusCode);	// statusCode should be ConnectSuccess (200)
							connection.connected = true;
							connection.statusCode = getResponse2.statusCode;
							callback(connection);
							return connection;
						}
					});
				}
			});
		}
	});
};

var tccStatus = function(connection, callback) {
	request(hdrs.defaults(connection), function(statusErr, statusResponse) {
		if (statusErr || statusResponse.statusCode != ConnectSuccess || statusResponse.statusMessage != "OK") {
			console.log('Login to TCC Failed (error at tccStatus() GET)', statusErr);
			if (statusResponse) console.log(statusResponse.statusCode);
			connection.connected = false;
			connection.statusCode = statusResponse.statusCode;
			return connection;
		} else {
			console.log('Successful GET in tccStatus(), Status Code ' + statusResponse.statusCode);
			console.log('JSON Response Body:\n');
			console.log(statusResponse.body);
			connection.connected = true;						// true whether or not the response can be parsed into an object
			connection.statusCode = statusResponse.statusCode;
			try {
				connection.statusData = JSON.parse(statusResponse.body);
			} catch(err) {
				console.log('Error parsing JSON Response Body', err);
				connection.statusCode = statusResponse.statusCode + ' - with error parsing JSON Response Body: ' + err;
				connection.statusData = statusResponse.body;	// return the text of the response only. Should we return null instead, since it can't be parsed into an object?
			}
			callback(connection);
			return connection;
		}
	});
};

module.exports = function(RED) {
	var reg = function(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		var connection = {usrName: this.credentials.username, passwd: this.credentials.password, deviceID: this.credentials.deviceID, jar: request.jar(), connected: false};		
		node.on('input', function(msg) {
			var sendMsg = function(connection) {
				msg.payload = connection.statusData;
				msg.title = 'Honeywell TCC Data';					// see https://github.com/node-red/node-red/wiki/Node-msg-Conventions
				msg.description = 'JSON data from Honeywell TCC';
				node.send(msg);
			};
			if (status.connected) tccStatus(connection, sendMsg);
			else tccLogin(connection, function(connection) {
				if (status.connected) tccStatus(connection, sendMsg);
			});
		});
	};
	RED.nodes.registerType('tcc-honeywell', reg, { credentials: { username: {type:"text"}, password: {type:"password"},	deviceID: {type: "text"} } });
};
