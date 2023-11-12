import { SceneTowerDefense } from "../Scenes/SceneTowerDefense";
import { WellyBoost } from "./WellyBoost";

export class WellyBoost_RangeTurrets extends WellyBoost
{
    constructor(scene: SceneTowerDefense)
    {
        super(scene);
    }

    public activate(): void
    {
        this.scene.addBonusRangeTo("ALL", 10);
    }
}