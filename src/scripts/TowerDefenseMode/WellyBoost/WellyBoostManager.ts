import { SceneTowerDefense } from "../Scenes/SceneTowerDefense";
import { WellyBoost } from "./WellyBoost";
import { WellyBoost_AttackSpeedTurrets } from "./WellyBoost_AttackSpeedTurrets";
import { WellyBoost_BoostDamageTurrets } from "./WellyBoost_BoostDamageTurrets";
import { WellyBoost_LevelUpTurrets } from "./WellyBoost_LevelUpTurrets";
import { WellyBoost_RangeTurrets } from "./WellyBoost_RangeTurrets";

export declare type WellyBoostData = {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity: string;
}

/** All the boost that we can use and read from the json wellyBoostData */
const WellyBoostList =
{
    "fullTraining": WellyBoost_LevelUpTurrets,
    "damageBonus": WellyBoost_BoostDamageTurrets,
    "attackSpeedBonus": WellyBoost_AttackSpeedTurrets,
    "rangeBonus": WellyBoost_RangeTurrets,
}

export class WellyBoostManager
{
    public scene: SceneTowerDefense;

    protected boostDatArray: WellyBoostData[];

    /** All the data related to the monsters */
    protected wellyBoostData: WellyBoostData[];

    constructor(scene: SceneTowerDefense)
    {
        this.scene = scene;

        this.wellyBoostData = this.scene.cache.json.get("wellyBoostData");
    }

    public grantBoost(boostData: WellyBoostData): void
    {
        const boostClass = WellyBoostList[boostData.id];
        if (boostClass)
        {
            const newBoost = new boostClass(this.scene) as WellyBoost;
            newBoost.activate();
        }
    }

    public generateRandomBoosts(boostCount: number): WellyBoostData[]
    {
        let boostDatArray = [] as WellyBoostData[];

        let indexes = new Array(this.wellyBoostData.length);
        for (let i = 0; i < indexes.length; ++i)
        {
            indexes[i] = i;
        }
        
        const safeCount = Math.min(boostCount, indexes.length)
        for (let i = 0; i < safeCount; ++i)
        {
            const boostIndex = indexes[Phaser.Math.Between(0, indexes.length - 1)];
            const wellyBoost = this.wellyBoostData[boostIndex];
            boostDatArray.push(wellyBoost);
        }

        this.boostDatArray = boostDatArray;
        return boostDatArray;
    }
}