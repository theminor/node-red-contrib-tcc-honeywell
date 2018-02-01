var request = require('request');
var hdrs = require('./requestHeaders');

// status codes that apparently get returned from successful web requests
const ConnectSuccess = 200;
const PostSuccess = 302;
const SuccessStatusMsg = 'OK';

var tccRequest = function(node, headers, debugIdentifier, successStatusCode, callback) {
	request(headers, function(err, response) {
		node.statusTxt = debugIdentifier + ': ';
		if (response) {
			node.statusTxt += 'Response: ' + JSON.stringify(response);
			if (response.statusCode) node.statusCode = response.statusCode;
			if (response.body) {
				try {
					node.statusData = JSON.parse(response.body);
				} catch(pErr) {
					node.statusTxt = ' -- with error parsing JSON Response Body: ' + pErr;
					node.statusData = response.body;	// if body can't be parsed as JSON, retun the body as-is
				}
			}
		}
		if (err || response.statusCode != successStatusCode || response.statusMessage ? response.statusMessage != SuccessStatusMsg : false) {	// possible issue: response.statusMessage may not always be "OK"? Need to verify
			node.connected = false;
			node.statusTxt += 'Error: ' + err;
			return node;
		} else {
			node.statusTxt += ' -- success';
			callback(node)
		}
	};
};

var tccLogin = function(node, callback) {
	tccRequest(node, hdrs.defaults(node), 'TCC Login first GET', ConnectSuccess, function(node) {
		tccRequest(node, hdrs.postDefaults(node), 'TCC Login POST', PostSuccess, function(node) {
			tccRequest(node, hdrs.defaults(node), 'TCC Login second GET', ConnectSuccess, function(node) {
				node.connected = true;
				callback(node);
			};
		};
	};
};

var tccStatus = function(node, callback) {
	tccRequest(node, getStatusDefaults(node), 'TCC Status GET', ConnectSuccess, function(node) {
		node.connected = true;						// true whether or not the response can be parsed into an object
		callback(node);
	};
}

// *** HERE - TO DO:
var tccChangeSetting = function(settingsObj, node, callback) {
}
// *** old version below



// structure of input (msg.payload):
// if an object or JSON is recieved, the passed settings will be sent to the thermostat. For example, to set the cool setpoint until a time:
// { CoolNextPeriod: 12345, CoolSetpoint: 74, StatusCool: 1 }
// if msg is not an object or JSON, simply return the status

var tccChangeSetting = function(settingsObj, node, callback) {
	request(hdrs.changeSettingDefaults(node, settingsObj), function(settingErr, settingResponse) {
		if (settingResponse.statusCode) node.statusCode = settingResponse.statusCode;		
		if (settingErr || settingResponse.statusCode != ConnectSuccess || settingResponse.statusMessage != "OK") {
			node.statusTxt = 'Error Changing Settings: \n' + JSON.stringify(settingsObj) + '\n (error at tccChangeSetting() POST request): ' + settingErr;
			if (settingResponse) node.statusTxt += ' -- Status Code: ' + settingResponse.statusCode;
			// node.connected = false;		// *** disconnect if set fails?
			return node;
		} else {
			node.statusTxt = 'Successful POST in tccChangeSetting() - Status Code: ' + settingResponse.statusCode + ' -- JSON Response Body:\n' + settingResponse.body;
			node.connected = true;			// true whether or not the response can be parsed into an object
			try {
				node.statusData = JSON.parse(settingResponse.body);
			} catch(err) {
				node.statusTxt = 'Error parsing JSON Response Body: ' + err;
				node.statusData = settingResponse.body;	// return the text of the response only. Should we return null instead, since it can't be parsed into an object?
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
		node.connected = false;
		node.on('input', function(msg) {			
			if (typeof msg.payload === 'string' || msg.payload instanceof String) {
				node.warn('string recvd: ' + msg.payload);
				try {
					msg.payload = JSON.parse(msg.payload);
				} catch(e) {
					msg.payload = 'status';									// a recieved payload of 'status' (or anything that can't be parsed) will just check the status
				}
			} else {
																			// *** TO DO - it's something else - we assume it is an object, if not a string. So do nothing (?)
			}
			var sendMsg = function(node) {
				msg.payload = node.statusData;
				msg.title = 'Honeywell TCC Data';							// see https://github.com/node-red/node-red/wiki/Node-msg-Conventions
				msg.description = 'JSON data from Honeywell TCC';
				node.send(msg);
			};
			var callTherm()
			
			
			
			if (node.connected) {
				if (msg.payload === 'status') {								// request for a simple status update
					tccStatus(node, sendMsg);
				} else {
					tccChangeSetting(msg.payload, node, sendMsg);			// **** TO DO - change from a setting/val model to an object passed!
				}															// some other node data recieved - assume it is object with data to modify
			} else {														// not connected, so try to connect first								
				tccLogin(node, function(node) {
					if (node.connected) {
						if (msg.payload === 'status') {						// request for a simple status update
							tccStatus(node, sendMsg);
						} else {											// some other node data recieved - assume it is object with data to modify
							tccChangeSetting(msg.payload, node, sendMsg);
						}
					}
				});
			}
		});
	};
	RED.nodes.registerType('tcc-honeywell', reg, { credentials: { username: {type: "text"}, password: {type: "password"},	deviceID: {type: "text"} } });
};
