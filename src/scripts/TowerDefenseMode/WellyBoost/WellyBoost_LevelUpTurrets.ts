import { SceneTowerDefense } from "../Scenes/SceneTowerDefense";
import { WellyBoost } from "./WellyBoost";

export class WellyBoost_LevelUpTurrets extends WellyBoost
{
    constructor(scene: SceneTowerDefense)
    {
        super(scene);
    }

    public activate(): void
    {
        for (const turret of this.scene.getTurrets())
        {
            this.scene.tryUpgradeTurret(turret, false);
        }
    }
}