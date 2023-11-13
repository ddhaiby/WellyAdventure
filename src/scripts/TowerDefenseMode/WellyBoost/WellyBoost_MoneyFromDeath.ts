import { SceneTowerDefense } from "../Scenes/SceneTowerDefense";
import { WellyBoost } from "./WellyBoost";

export class WellyBoost_MoneyFromDeath extends WellyBoost
{
    constructor(scene: SceneTowerDefense)
    {
        super(scene);
    }

    public activate(): void
    {
        this.scene.addBonusMoneyFromDeathTo("ALL", 50);
    }
}