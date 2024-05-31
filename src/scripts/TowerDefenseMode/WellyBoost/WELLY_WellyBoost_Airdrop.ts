import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyBoost } from "./WELLY_WellyBoost";
import { WELLY_WellyBoostData } from "./WELLY_WellyBoostManager";

export class WELLY_WellyBoost_Airdrop extends WELLY_WellyBoost
{
    constructor(scene: WELLY_SceneTowerDefense, boostData: WELLY_WellyBoostData)
    {
        super(scene, boostData);
    }

    protected getCoinValue(): number
    {
        return (1 + this.scene.getCurrentWave()) * 200;
    }

    public activate(): void
    {
        this.scene.addPlayerCoin(this.getCoinValue());
    }

    public getDescription(): string {
        return this.boostData.description.replace("COIN_VALUE", this.getCoinValue().toString())
    }
}