import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyBoostData } from "./WELLY_WellyBoostManager";

export class WELLY_WellyBoost
{
    protected scene: WELLY_SceneTowerDefense;

    protected boostData: WELLY_WellyBoostData;

    constructor(scene: WELLY_SceneTowerDefense, boostData: WELLY_WellyBoostData)
    {
        this.scene = scene;
        this.boostData = boostData;
    }

    public activate(): void
    {
    }

    public getDescription(): string
    {
        return this.boostData.description;
    }
}