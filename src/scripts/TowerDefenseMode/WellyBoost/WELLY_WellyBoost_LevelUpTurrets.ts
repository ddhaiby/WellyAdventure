import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyBoost } from "./WELLY_WellyBoost";
import { WELLY_WellyBoostData } from "./WELLY_WellyBoostManager";

export class WELLY_WellyBoost_LevelUpTurrets extends WELLY_WellyBoost
{
    constructor(scene: WELLY_SceneTowerDefense, boostData: WELLY_WellyBoostData)
    {
        super(scene, boostData);
    }

    public activate(): void
    {
        for (const turret of this.scene.getTurrets())
        {
            this.scene.tryUpgradeTurret(turret, false);
        }
    }
}