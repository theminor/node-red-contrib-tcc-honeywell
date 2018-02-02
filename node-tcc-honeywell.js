var request = require('request');
var hdrs = require('./requestHeaders');

// status codes that apparently get returned from successful web requests
const ConnectSuccess = 200;
const PostSuccess = 302;
const SuccessStatusMsg = 'OK';

var sendMsg = function(node) {
    msg.payload = node.statusData;
    msg.title = 'Honeywell TCC Data';                                           // see https://github.com/node-red/node-red/wiki/Node-msg-Conventions
    msg.description = 'JSON data from Honeywell TCC';
    node.send(msg);
};

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
					node.statusData = response.body;                            // if body can't be parsed as JSON, retun the body as-is
				}
			}
		}
		if (err || response.statusCode != successStatusCode || response.statusMessage ? response.statusMessage != SuccessStatusMsg : false) {	// possible issue: response.statusMessage may not always be "OK" for all requests? Need to verify
			node.connected = false;
			node.statusTxt += 'Error: ' + err;
			return node;
		} else {
			node.statusTxt += ' -- success';
			node.connected = true;
			callback(node)
		}
	};
};

var tccLogin = function(node, callback) {
	tccRequest(node, hdrs.defaults(node), 'TCC Login first GET', ConnectSuccess, function(node) {
		tccRequest(node, hdrs.postDefaults(node), 'TCC Login POST', PostSuccess, function(node) {
			tccRequest(node, hdrs.defaults(node), 'TCC Login second GET', ConnectSuccess, function(node) {
				callback(node);
			};
		};
	};
};

var tccStatus = function(node, callback) {
	tccRequest(node, hdrs.getStatusDefaults(node), 'TCC Status GET', ConnectSuccess, function(node) {
		callback(node);
	};
};

var tccCmd = function(payload, node, callback) {
    tccRequest(node, hdrs.changeSettingDefaults(node, payload), 'TCC Command ' + payload + ': ', ConnectSuccess, function(node) {
		callback(node);
    };
    
};

module.exports = function(RED) {
	RED.nodes.registerType('tcc-honeywell', function(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		node.jar = request.jar();
		node.connected = false;
		node.on('input', function(msg) {
            var process = function() {
                if (typeof msg.payload !== 'string') msg.payload = JSON.stringify(msg.payload);
                if (msg.payload.charAt(0) === '{') {                                // it is a command
                    tccRequest(node, hdrs.changeSettingDefaults(node, msg.payload), 'TCC Command ' + msg.payload + ': ', ConnectSuccess, sendMsg);
                } else {                                                            // it is a status request
                    tccRequest(node, hdrs.getStatusDefaults(node), 'TCC Status GET', ConnectSuccess, sendMsg);
                }
            };
            if (node.connected) process(); else tccLogin(node, process());
		});
	}, { credentials: { username: {type: "text"}, password: {type: "password"},	deviceID: {type: "text"} } } );
};
