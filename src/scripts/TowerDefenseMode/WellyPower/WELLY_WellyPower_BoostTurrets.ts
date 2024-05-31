import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyPower, WELLY_WellyPowerData } from "./WELLY_WellyPower";

export class WELLY_WellyPower_BoostTurrets extends WELLY_WellyPower
{
    protected scene: WELLY_SceneTowerDefense;

    protected attackSpeedBoost: number = 1;
    protected damageBoost: number = 1;

    constructor(scene: WELLY_SceneTowerDefense, wellyPowerData: WELLY_WellyPowerData)
    {
        super(scene, wellyPowerData);
    }

    public activate(x?: number, y?: number): void
    {
        super.activate(x, y);

        this.damageBoost = (1 + 0.15 * this.scene.getCurrentWave()) * 20;
        this.attackSpeedBoost = 3;

        this.scene.addBonusDamageTo("ALL", this.damageBoost);
        this.scene.addBonusAttackSpeedTo("ALL", this.attackSpeedBoost);

        for (const turret of this.scene.getTurrets())
        {
            turret.setTint(0x990000);
        }
    }

    public deactivate(): void
    {
        super.deactivate();

        this.scene.removeBonusAttackSpeedTo("ALL", this.attackSpeedBoost);
        this.scene.removeBonusDamageTo("ALL", this.damageBoost);

        for (const turret of this.scene.getTurrets())
        {
            turret.clearTint();
        }
    }
}