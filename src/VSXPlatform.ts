import {
  API,
  APIEvent,
  Characteristic,
  DynamicPlatformPlugin,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from "homebridge";

import {Input} from "./Input";
import {PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import {VSXPlatformAccessory} from "./VSXPlatformAccessory";

export class VSXPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly accessories: PlatformAccessory[] = [];

  constructor(public readonly log: Logging, public readonly config: PlatformConfig, public readonly api: API) {
    api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      log.info("VSX Platform 'didFinishLaunching'");
      this.config.inputs.forEach((value: Input) => {
        this.addAccessory(value);
      });
    });
  }

  /*
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory): void {
    this.log("Configuring accessory %s", accessory.displayName);
    this.accessories.push(accessory);
  }


  addAccessory(input: Input) {
    const uuid = this.api.hap.uuid.generate(input.name + input.number);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      new VSXPlatformAccessory(this, existingAccessory, input);
    } else {
      this.log.info('Adding new accessory:', input.name);
      const accessory = new this.api.platformAccessory(input.name, uuid);
      accessory.context.input = input;
      new VSXPlatformAccessory(this, accessory, input);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }
}

