# homebridge-pioneer

homebridge-pioneer is a plugin made for [homebridge](https://github.com/nfarina/homebridge),
which allows switching on and off your Pioneer AV receiver and change the input channel. 
All AV receivers (VSX and SC), which work with the iControl AV5 App are supported.
This work is derived from the original "hombridge-vsx" and is meant to be a drop-in replacement. 

## Installation

1. Install the homebridge framework using `npm install -g homebridge`
2. Install **homebridge-pioneer** using `npm install -g homebridge-pioneer`
3. Update your configuration file. See `sample-config.json` in this repository for a sample. 

## Accessory configuration example
```json
"accessories": [
        {
            "accessory": "VSX",
            "description": "SC-LX57",
            "ip": "192.168.1.6",
            "name": "Receiver Apple TV",
            "port": 8102,
            "input": "15"
        }
]
```

*Notice: Port 23 is the default port for older devices. If port 23 doesn't work for you try port 8102.*

This version is a direct fork from homebridge-vsx to prepare a major update
