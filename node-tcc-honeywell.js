var request = require('request');
var hdrs = require('./requestHeaders');

// status codes that apparently get returned from successful web requests
const ConnectSuccess = 200;
const PostSuccess = 302;

var tccLogin = function(node, callback) {
	request(hdrs.defaults(node), function(getErr1, getResponse1) {	// GET 1
		if (getErr1 || getResponse1.statusCode != ConnectSuccess) {			// Status Code 200 = OK
			node.debug('Login to TCC Failed (error at first GET)', getErr1);
			node.connected = false;
			node.statusCode = getResponse1.statusCode;
			return node;
		} else {
			node.debug('Successful first GET Connection, Status Code ' + getResponse1.statusCode);
			node.statusCode = getResponse1.statusCode;
			request(hdrs.postDefaults(node), function (postErr, postResponse) {		// POST
				if (postErr || postResponse.statusCode != PostSuccess) {		// Status Code 302 is successful post (?)
					node.debug('Login to TCC Failed (POST error)', postErr);
					if (postResponse) node.debug(postResponse.statusCode);
					node.connected = false;
					node.statusCode = 'Post Error: ' + postErr.statusCode + '. Post Response: ' + (postResponse) ? postResponse.statusCode : '';
					return node;
				} else {
					node.debug('Successful POST, Status Code ' + postResponse.statusCode);
					node.statusCode = postResponse.statusCode
					request(hdrs.defaults(node), function(getErr2, getResponse2) {		// GET 2
						if (getErr2 || getResponse2.statusCode != ConnectSuccess) {
							node.debug('Login to TCC Failed (error at second GET)', getErr2);
							if (getResponse2) node.debug(getResponse2.statusCode);
							node.connected = false;
							node.statusCode = 'Get Error: ' + getErr2 + '. Get Response: ' + (getResponse2) ? getResponse2.statusCode : '';
							return node;
						} else {
							node.debug('Successful second GET Connection, Status Code ' + getResponse2.statusCode);	// statusCode should be ConnectSuccess (200)
							node.connected = true;
							node.statusCode = getResponse2.statusCode;
							callback(node);
							return node;
						}
					});
				}
			});
		}
	});
};

var tccStatus = function(node, callback) {
	request(hdrs.defaults(node), function(statusErr, statusResponse) {
		if (statusErr || statusResponse.statusCode != ConnectSuccess || statusResponse.statusMessage != "OK") {
			node.debug('Login to TCC Failed (error at tccStatus() GET)', statusErr);
			if (statusResponse) node.debug(statusResponse.statusCode);
			node.connected = false;
			node.statusCode = statusResponse.statusCode;
			return node;
		} else {
			node.debug('Successful GET in tccStatus(), Status Code ' + statusResponse.statusCode);
			node.debug('JSON Response Body:\n');
			node.debug(statusResponse.body);
			node.connected = true;						// true whether or not the response can be parsed into an object
			node.statusCode = statusResponse.statusCode;
			try {
				node.statusData = JSON.parse(statusResponse.body);
			} catch(err) {
				node.debug('Error parsing JSON Response Body', err);
				node.statusCode = statusResponse.statusCode + ' - with error parsing JSON Response Body: ' + err;
				node.statusData = statusResponse.body;	// return the text of the response only. Should we return null instead, since it can't be parsed into an object?
			}
			callback(node);
			return node;
		}
	});
};

module.exports = function(RED) {
	var reg = function(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		node.jar = request.jar();
		node.connected: false
		node.on('input', function(msg) {
			var sendMsg = function(node) {
				msg.payload = node.statusData;
				msg.title = 'Honeywell TCC Data';					// see https://github.com/node-red/node-red/wiki/Node-msg-Conventions
				msg.description = 'JSON data from Honeywell TCC';
				node.send(msg);
			};
			if (node.connected) tccStatus(node, sendMsg);
			else tccLogin(node, function(node) {
				if (node.connected) tccStatus(node, sendMsg);
			});
		});
	};
	RED.nodes.registerType('tcc-honeywell', reg, { credentials: { username: {type: "text"}, password: {type: "password"},	deviceID: {type: "text"} } });
};