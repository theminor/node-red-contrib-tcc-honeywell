API Info ( copied directly from http://www.bradgoodman.com/thermostat/ )
---

* Make an initial connection - get an initial session token
* Pass login credentials, gives you back a session cookie and redirects you to a web page
* Go to redirected page, by passing session cookies - now we're "logged in"
* Read current thermostat settings - returned in JSON format
* Optional: If we decided we actually need to change any settings - POST changes in JSON format


The JSON messages are pretty self explanatory, and I included examples of both inbound and outbound messages in the script. An example message to cancel any holds and return to regular program is:

```
CoolNextPeriod: null
CoolSetpoint: 75
DeviceID: 12345
FanMode: null
HeatNextPeriod: null
HeatSetpoint: null
StatusCool: 0
StatusHeat: 0
SystemSwitch: null
```
		
The "device ID" is your thermostat's unique ID. Here's an example which sets the cool setpoint for a specific amount of time:

```
CoolNextPeriod: 12
CoolSetpoint: 74
DeviceID: 12345
FanMode: null
HeatNextPeriod: null
HeatSetpoint: null
StatusCool: 1
StatusHeat: 1
SystemSwitch: null
```

The "CoolNextPeriod" and "HeatNextPeriod" parameters require special explanation they represent the time at which you want to resume the normal program. They are represented as a "time-of-day". The number represents a time period of 15 minutes from midnight, (just as your thermostat can only allow you to set temporary holds which end on a 15-minute boundary). So for example, if you wanted a temporary hold which ends at midnight - set the number to zero. If you wanted it to end a 12:15am, set it to 1. For 12:30am, set it to 2, etc. Needless to say, this allows you to only set temporary holds up to 24-hours. If no NextPeriod is specified however, this will effectively set a "permanent" hold, which must be subsequently manually candled.

The inbound JSON message (returned from the "third" request above) returns the following data:

```
{
    "alerts": "\r\n",
    "communicationLost": false,
    "deviceLive": true,
    "latestData": {
        "canControlHumidification": false,
        "drData": {
            "CoolSetpLimit": 0,
            "DeltaCoolSP": -0.01,
            "DeltaHeatSP": -0.01,
            "HeatSetpLimit": 0,
            "OptOutable": false,
            "Phase": -1
        },
        "fanData": {
            "fanMode": 0,
            "fanModeAutoAllowed": true,
            "fanModeCirculateAllowed": false,
            "fanModeFollowScheduleAllowed": false,
            "fanModeOnAllowed": true
        },
        "hasFan": true,
        "uiData": {
            "BatteryStatus": 0,
            "Commercial": false,
            "CoolLowerSetptLimit": 50.0,
            "CoolNextPeriod": 66,
            "CoolSetpoint": 80.0,
            "CoolUpperSetptLimit": 99.0,
            "Deadband": 3.0,
            "DeviceID": 12345,
            "DispTemperature": 75.0,
            "DispTemperatureAvailable": true,
            "DispTemperatureStatus": 0,
            "DisplayedUnits": "F",
            "DualSetpointStatus": false,
            "HeatLowerSetptLimit": 40.0,
            "HeatNextPeriod": 66,
            "HeatSetpoint": 68.0,
            "HeatUpperSetptLimit": 90.0,
            "HoldUntilCapable": true,
            "IndoorHumidStatus": 128,
            "IndoorHumidity": 128.0,
            "IndoorHumiditySensorAvailable": false,
            "IndoorHumiditySensorNotFault": true,
            "IsInVacationHoldMode": false,
            "OBPolarity": 0,
            "OutdoorHumidStatus": 128,
            "OutdoorHumidity": 128.0,
            "OutdoorHumidityAvailable": false,
            "OutdoorTemp": 128.0,
            "OutdoorTempStatus": 128,
            "OutdoorTemperatureAvailable": false,
            "RawMessageID": 0,
            "SchedCoolSp": 75.0,
            "SchedHeatSp": 68.0,
            "ScheduleCapable": true,
            "SenseFromHereAllowed": false,
            "SensorAveraging": false,
            "SetpointChangeAllowed": true,
            "SouthernAwayAllowed": false,
            "StatSenseDispTemp": 75.0,
            "StatusCool": 1,
            "StatusHeat": 1,
            "SwitchAutoAllowed": true,
            "SwitchCoolAllowed": true,
            "SwitchEmergencyHeatAllowed": false,
            "SwitchHeatAllowed": true,
            "SwitchOffAllowed": true,
            "SystemSwitchPosition": 4,
            "TemporaryHoldUntilTime": 990,
            "ThermostatLocked": false,
            "TimeOfDayFlag": 0,
            "UIDataID": 9999,
            "VacationHold": 0,
            "VacationHoldUntilTime": 0
        },
        "weather": {
            "HasStation": true,
            "Humidity": "55",
            "Icon": "1_sunny%402x",
            "Phrase": "Sunny",
            "Temperature": "76"
        }
    },
    "success": true
}
```

Most of this is obvious - some of it must be pertinent to other types of thermostats which I do not have.

Honneywell doesn't seem to offer an "offical" API into this data, but they seem to for some of their other alarm data. Unfortunatley, they seem to only want to provide this stuff to alarm monitoring companies, as opposed to end-users. Hopefuly, someday they'll get the hint and open up a real environmental control API for end-users. Until then - Happy hacking!!
