import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyBoost } from "./WELLY_WellyBoost";

export class WELLY_WellyBoost_AttackSpeedTurrets extends WELLY_WellyBoost
{
    constructor(scene: WELLY_SceneTowerDefense)
    {
        super(scene);
    }

    public activate(): void
    {
        this.scene.addBonusAttackSpeedTo("ALL", 0.15);
    }
}