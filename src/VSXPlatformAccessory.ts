import {
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAPStatus,
  Logging,
  PlatformAccessory,
  Service
} from "homebridge";
import {Socket} from "net";
import {VSXPlatform} from "./VSXPlatform";
import {Input} from "./Input";

const QUERY_POWER = '?P\r\n';
const QUERY_INPUT = '?F\r\n';
const STATUS_POWER_OFF = "PWR1";
const STATUS_POWER_ON = "PWR0";
const REQUEST_POWER_OFF = 'PF\r\n';
const REQUEST_POWER_ON = 'PO\r\n';
const INPUT_PREFIX = "FN";
const REQUEST_INPUT = INPUT_PREFIX + '\r\n';
const TIMEOUT = 8000;

export class VSXPlatformAccessory {
  private service: Service;
  private readonly timeout: number;
  private readonly ip: string;
  private readonly port: number;
  private readonly log: Logging;

  constructor(private readonly platform: VSXPlatform, private readonly accessory: PlatformAccessory, private readonly input: Input) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
    .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Pioneer')
    .setCharacteristic(this.platform.Characteristic.Model, 'VSX')

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .on('get', this.getOn.bind(this));               // GET - bind to the `getOn` method below

    this.timeout = platform.config.timeout || TIMEOUT;
    this.ip = platform.config.ip;
    this.port = platform.config.port || 8102
    this.input = input;
    this.log = platform.log;
  }
  
  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    const client = new Socket();
    client.setTimeout(this.timeout);
    this.connectionErrorHandler(client, callback);

    if (value) {
      // Request Power On
      client.connect(this.port, this.ip, () => {
        this.log.info('Set Power On on ' + this.ip + ':' + this.port);
        client.write(REQUEST_POWER_ON);
      });

      // Register Response Handler
      client.on('data', (data) => {
        if (this.input.number) {
          this.log.info("Change input to " + this.input.number);
          client.write(this.input.number + REQUEST_INPUT);
        }
        callback();
        client.destroy();
      });
    }

    if (!value) {
      // Request Power Off
      client.connect(this.port, this.ip, () => {
        this.log.info('Set Power Off on ' + this.ip + ':' + this.port);
        client.write(REQUEST_POWER_OFF);
      });

      client.on('data', (data) => {
        callback();
        client.destroy();
      });
    }
  }
  
  getOn(callback: CharacteristicGetCallback) {
    const client = new Socket();
    client.setTimeout(this.timeout);
    this.connectionErrorHandler(client, callback);

    // Query Power
    client.connect(this.port, this.ip, () => {
      this.log.info('Query Power Status on ' + this.ip + ':' + this.port);
      client.write(QUERY_POWER);
    });

    // Handle Response
    client.on('data', (data) => {
      // me.log('Received data: ' + data);
      const response = data.toString();
      if (response.includes(STATUS_POWER_OFF)) {
        this.reportSwitchOff(client,callback);
      }
      if (response.includes(STATUS_POWER_ON)) {
        this.queryInput(client,callback);
      }
      if (response.includes(INPUT_PREFIX)) {
        this.reportOnIfInputMatches(client,callback, response);
      }
    });
  }
    
  connectionErrorHandler(client: Socket, callback: CharacteristicGetCallback) {
    client.on('error', (ex) => {
      this.log.error("Received an error while communicating" + ex);
      client.destroy();
      callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });
    client.on('timeout',  () => {
      this.log.error("Received a timeout while communicating");
      client.destroy();
      callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });
  }

  reportSwitchOff(client: Socket, callback: CharacteristicGetCallback) {
    this.log.info("Switch Off");
    client.destroy();
    callback(null, false);
  }

  reportSwitchOn(client: Socket, callback: CharacteristicGetCallback) {
    this.log.info("Switch On")
    client.destroy();
    callback(null, true);
  }

  queryInput(client: Socket, callback: CharacteristicGetCallback) {
    this.log.info("Power is On");
    if (this.input.number) {
      this.log.info("Setting input to " + this.input.number);
      client.write(QUERY_INPUT); // Request input
    } else {
      this.reportSwitchOn(client, callback);
    }
  }

  reportOnIfInputMatches(client: Socket, callback: CharacteristicGetCallback, response: string) {
    if (response.includes(this.input.number!.toString())) {
      this.log.info("Receiver has correct input selected")
      this.reportSwitchOn(client, callback);
    } else {
      this.log.info("Receiver has different input selected");
      this.reportSwitchOff(client,callback);
    }
  }

}
