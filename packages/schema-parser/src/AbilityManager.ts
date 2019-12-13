import * as o3 from "@alipay/o3";
import { Oasis } from "./Oasis";
import { pluginHook } from "./plugins/PluginManager";

export class AbilityManager {
  private abilityMap: { [id: string]: o3.NodeAbility } = {};

  constructor(private oasis: Oasis) {}

  @pluginHook({ after: "abilityAdded" })
  public add(nodeConfig: AbilityConfig) {}

  public update(id: string, key: string, value: any) {
    this.get(id)[key] = value;
  }

  public get(id: string): o3.NodeAbility {
    return this.abilityMap[id];
  }

  public delete(id: string) {}
}
