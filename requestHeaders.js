module.exports.defaults = function(connection) {
	return {
		method: "GET",
		url: "https://mytotalconnectcomfort.com/portal/",
		timeout: 15000,
		strictSSL: false,
		jar: connection.jar,
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

module.exports.postDefaults = function(connection) {
	var rtnObj = module.exports.defaults(connection);
	rtnObj.method = "POST";
	rtnObj.form = {
		UserName: connection.usrName,
		Password: connection.passwd,
		RememberMe: "false"
	};
	rtnObj.url = "https://mytotalconnectcomfort.com/portal/Device/CheckDataSession/" + connection.deviceID + "?_=" + Date.now();		// time stamp must be added now - these requests are time-sensitive
	return rtnObj;
};

