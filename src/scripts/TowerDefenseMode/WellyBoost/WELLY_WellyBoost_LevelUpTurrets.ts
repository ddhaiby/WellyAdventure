import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyBoost } from "./WELLY_WellyBoost";

export class WELLY_WellyBoost_LevelUpTurrets extends WELLY_WellyBoost
{
    constructor(scene: WELLY_SceneTowerDefense)
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