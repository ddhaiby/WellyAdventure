import { SceneTowerDefense } from "../Scenes/SceneTowerDefense";
import { WellyBoost } from "./WellyBoost";

export class WellyBoost_BoostDamageTurrets extends WellyBoost
{
    constructor(scene: SceneTowerDefense)
    {
        super(scene);
    }

    public activate(): void
    {
        this.scene.addBonusDamageTo("ALL", 10);
    }
}