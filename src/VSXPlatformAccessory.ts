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
  private readonly timeout: number;
  private readonly ip: string;
  private readonly port: number;
  private readonly log: Logging;
  private readonly inputs: Input[];
  private inputServices: Map<string, Service> = new Map<string, Service>();

  constructor(private readonly platform: VSXPlatform, private readonly accessory: PlatformAccessory) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
    .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Pioneer')
    .setCharacteristic(this.platform.Characteristic.Model, 'VSX')

    this.timeout = platform.config.timeout || TIMEOUT;
    this.ip = platform.config.ip;
    this.port = platform.config.port || 8102
    this.inputs = platform.config.inputs || [];
    this.log = platform.log;

    for (const input of this.inputs) {
      this.log.info("Adding InputService for " + input.name + " number " + input.number);
      const switchService = this.accessory.getService(input.name) || this.accessory.addService(this.platform.Service.Switch, input.name, input.name);
      switchService.getCharacteristic(this.platform.Characteristic.On)
      .on('set', (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        const client = new Socket();
        client.setTimeout(this.timeout);
        client.on('timeout', () => {
          callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
          client.destroy();
        });

        if (value) {
          // Request Power On
          client.connect(this.port, this.ip, () => {
            this.log.info('Set Power On on ' + this.ip + ':' + this.port);
            client.write(REQUEST_POWER_ON);
          });

          // Register Response Handler
          client.on('data', (data) => {
            if (input.number) {
              this.log.info("Change input to " + input.number);
              client.write(input.number + REQUEST_INPUT);
            }
            this.updateStatus();
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
            this.updateStatus();
            client.destroy();
          });
        }
        callback();
      })
      .on('get', (callback: CharacteristicGetCallback) => {
        callback(null, this.inputServices.get(input.number)!.getCharacteristic(this.platform.Characteristic.On).value);
      });
      this.inputServices.set(input.number, switchService);
    }

  }

  updateStatus() {
    const client = new Socket();
    client.setTimeout(this.timeout);
    client.on('timeout', () => {
      this.inputServices.forEach(value => value.updateCharacteristic(this.platform.Characteristic.On, false));
      client.destroy()
    });
    client.on('error', (ex) => {
      this.log.error("Received an error while communicating" + ex);
      this.inputServices.forEach(value => value.updateCharacteristic(this.platform.Characteristic.On, false));
      client.destroy();
    });

    // Query Power
    client.connect(this.port, this.ip, () => {
      this.log.info('Query Power Status on ' + this.ip + ':' + this.port);
      client.write(QUERY_POWER);
    });

    // Handle Response
    client.on('data', (data) => {
      const response = data.toString();
      if (response.includes(STATUS_POWER_OFF)) {
        this.inputServices.forEach(value => value.updateCharacteristic(this.platform.Characteristic.On, false));
        client.destroy();
        return;
      }
      if (response.includes(STATUS_POWER_ON)) {
        client.write(QUERY_INPUT);
        return;
      }
      if (response.includes(INPUT_PREFIX)) {
        const activeInput = response.substr(INPUT_PREFIX.length, 2);
        this.inputServices.forEach((value, key) => {
          if (key == activeInput) {
            this.log.info("Set input to on " + activeInput + " : " + key);
            this.inputServices.get(activeInput)?.updateCharacteristic(this.platform.Characteristic.On, true);
          } else {
            this.log.info("Set input to off " + activeInput + " : " + key);
            this.inputServices.get(activeInput)?.updateCharacteristic(this.platform.Characteristic.On, false);
          }
        })
      }
    });

  }
}
