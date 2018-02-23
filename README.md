# node-red-contrib-tcc-honeywell
Interface for Honeywell Legacy Thermostats Node for Node-Red. Pulls data from the Honeywell TCC (Total Connect Comfort) API, which appears to be mostly undocumented now.

Project status: presently testing the ability to send data. Getting the status works fine and changng settings seems to properly connect tot he API and return data, but I have had issues with the cahnges actually being reflected on my thermostat. Settings are limited to data that can be sent to the api body. Since the api is undocumented, the only things I've found are turning the termostat on and off, setting a hold temperature, changing the running mode (heat, cool, etc.), and setting a hold time.

From other sources (referenced below), the commands that the (undocumented) api seems to accept are:

* `SystemSwitch`	 0 = emergency heat; 1 = heat; 2 = cool
* `HeatSetpoint`		temperature to set the heat to
* `CoolSetpoint`  temperature to set the a/c to
* `HeatNextPeriod`  time to end hold and go back to next scheduled action
* `CoolNextPeriod`  time to end hold and go back to next scheduled action
* `StatusHeat`  1 for hold, 0 for regular (set to 0 to cancel an existing hold)
* `StatusCool`  1 for hold, 0 for regular (set to 0 to cancel an existing hold)
* `FanMode`  0 = auto; 1 = on

In node-red, for a node input, to change a setting, `msg.payload` is expected to be an object (or JSON) containing the settings to send in the request to the thermostat. For example, to set the cool setpoint until a time: msg.payload could be `{ CoolNextPeriod: 12345, CoolSetpoint: 74, StatusCool: 1 }`. If `msg.payload` is instead the string `"status"` - or if it is any string or anything other than JSON or an object - the node will simply request the status from the thermostat and return the result. Results are output as an object, but can be converted to JSON.

Some Useful References:
* https://github.com/NorthernMan54/homebridge-tcc
* http://codegists.com/code/honeywell-thermostat/
* http://www.bradgoodman.com/thermostat/
