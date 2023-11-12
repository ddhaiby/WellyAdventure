import { SceneTowerDefense } from "../Scenes/SceneTowerDefense";
import { WellyBoost } from "./WellyBoost";

export class WellyBoost_AttackSpeedTurrets extends WellyBoost
{
    constructor(scene: SceneTowerDefense)
    {
        super(scene);
    }

    public activate(): void
    {
        this.scene.addBonusAttackSpeedTo("ALL", 0.15);
    }
}