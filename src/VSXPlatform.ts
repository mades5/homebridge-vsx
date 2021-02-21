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

import {PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import {VSXPlatformAccessory} from "./VSXPlatformAccessory";

export class VSXPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly accessories: PlatformAccessory[] = [];

  constructor(public readonly log: Logging, public readonly config: PlatformConfig, public readonly api: API) {
    api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      log.info("VSX Platform 'didFinishLaunching'");

      const uuid = this.api.hap.uuid.generate(this.config.ip + this.config.port);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing VSX accessory from cache:', existingAccessory.displayName);
        new VSXPlatformAccessory(this, existingAccessory);
      } else {
        this.log.info('Adding new VSX accessory');
        const accessory = new this.api.platformAccessory(this.config.name!, uuid);
        new VSXPlatformAccessory(this, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }


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


}

