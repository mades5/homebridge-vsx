# homebridge-vsx-2 [![npm version](https://badge.fury.io/js/homebridge-vsx-2.svg)](https://badge.fury.io/js/homebridge-vsx-2)

homebridge-vsx-2 is a plugin made for [homebridge](https://github.com/nfarina/homebridge),
which allows switching on and off your Pioneer AV receiver. All AV receivers (VSX and SC),
which work with the iControl AV5 App are supported.

## Installation

1. Install the homebridge framework using `npm install -g homebridge`
2. Install **homebridge-vsx-2** using `npm install -g homebridge-vsx-2`
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
