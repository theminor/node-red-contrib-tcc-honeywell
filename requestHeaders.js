// Header info modified from https://github.com/NorthernMan54/homebridge-tcc
// Thanks!

module.exports.defaults = function(node) {
	return {
		method: "GET",
		url: "https://mytotalconnectcomfort.com/portal/",
		timeout: 15000,
		strictSSL: false,
		jar: node.jar,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"Accept-Encoding": "sdch",
			"Host": "mytotalconnectcomfort.com",
			"DNT": "1",
			"Origin": "https://mytotalconnectcomfort.com/portal",
			"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36"
		}
	}
};

module.exports.postDefaults = function(node) {
	var rtnObj = module.exports.defaults(node);
	rtnObj.method = "POST";
	rtnObj.form = {
		UserName: node.credentials.username,
		Password: node.credentials.password,
		RememberMe: "false"
	};
	return rtnObj;
};

module.exports.getStatusDefaults = function(node) {
	var rtnObj = module.exports.defaults(node);
	rtnObj.headers["Accept"] = "*/*";
	rtnObj.headers["Accept-Encoding"] = "plain";
	rtnObj.headers["Cache-Control"] = "max-age=0";
	rtnObj.headers["Accept-Language"] = "en-US,en,q=0.8";
	rtnObj.headers["Connection"] = "keep-alive";
	rtnObj.headers["Referer"] = "https://mytotalconnectcomfort.com/portal/";
	rtnObj.headers["X-Requested-With"] = "XMLHttpRequest";
	rtnObj.url = "https://mytotalconnectcomfort.com/portal/Device/CheckDataSession/" + node.credentials.deviceID + "?_=" + Date.now();		// time stamp must be added now - these requests are time-sensitive
	return rtnObj;
};

module.exports.changeSettingDefaults = function(node, settingsObj) {
	var rtnObj = module.exports.defaults(node);
	rtnObj.method = "POST";
	rtnObj.url = "https://mytotalconnectcomfort.com/portal/Device/SubmitControlScreenChanges";
	rtnObj.headers["Accept"] = "application/json, text/javascript, */*; q=0.01";
	rtnObj.headers["Accept-Encoding"] = "gzip, deflate";
	rtnObj.headers["Accept-Language"] = "en-US,en;q=0.5";
	rtnObj.headers["Connection"] = "Keep-Alive";
	rtnObj.headers["Cache-Control"] = "no-cache";
	rtnObj.headers["Content-Type"] = "application/json; charset=UTF-8";
	rtnObj.headers["Origin"] = "https://mytotalconnectcomfort.com";
	rtnObj.headers["Referer"] = "https://mytotalconnectcomfort.com/portal/Device/Control/" + node.credentials.deviceID;
	rtnObj.headers["X-Requested-With"] = "XMLHttpRequest";
	var bodyDefaults = {
		"DeviceID": Number(node.credentials.deviceID),
		"SystemSwitch": null,
		"HeatSetpoint": null,
		"CoolSetpoint": null,
		"HeatNextPeriod": null,
		"CoolNextPeriod": null,
		"StatusHeat": null,
		"StatusCool": null,
		"FanMode": null
	};
	rtnObj.body = JSON.stringify(Object.assign(bodyDefaults, settingsObj));		// iterate settingsObj and change bodyDefaults for each property in it
	return rtnObj;
};
