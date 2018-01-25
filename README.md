# node-red-contrib-tcc-honeywell
Honeywell Legacy Thermostats Node for Node-Red

Pulls data from the Honeywell TCC (Total Connect Comfort) API, which appears to be mostly undocumented now.

*Still under development.*

So far it is just reading the status from the API. Still working on the ability to send data. Interaction will probably be limited to turning the termostat on and off, setting a hold temperature, changing the running mode (heat, cool, etc.), etc.

Currently working on the input side - commands that the (undocumented) api seem to accept are:

* `SystemSwitch`	 0 = emergency heat; 1 = heat; 2 = cool
* `HeatSetpoint`		temperature to set the heat to
* `CoolSetpoint`  temperature to set the a/c to
* `HeatNextPeriod`  time to end hold and go back to next scheduled action
* `CoolNextPeriod`  time to end hold and go back to next scheduled action
* `StatusHeat`  1 for hold, 0 for regular (set to 0 to cancel an existing hold)
* `StatusCool`  1 for hold, 0 for regular (set to 0 to cancel an existing hold)
* `FanMode`  0 = auto; 1 = on

Some Useful References:
* https://github.com/NorthernMan54/homebridge-tcc
* http://codegists.com/code/honeywell-thermostat/
* http://www.bradgoodman.com/thermostat/
