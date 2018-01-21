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
		UserName: node.usrName,
		Password: node.passwd,
		RememberMe: "false"
	};
	rtnObj.url = "https://mytotalconnectcomfort.com/portal/Device/CheckDataSession/" + node.deviceID + "?_=" + Date.now();		// time stamp must be added now - these requests are time-sensitive
	return rtnObj;
};
