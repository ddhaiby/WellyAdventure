import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyBoost } from "./WELLY_WellyBoost";
import { WELLY_WellyBoost_AttackSpeedTurrets } from "./WELLY_WellyBoost_AttackSpeedTurrets";
import { WELLY_WellyBoost_BoostDamageTurrets } from "./WELLY_WellyBoost_BoostDamageTurrets";
import { WELLY_WellyBoost_LevelUpTurrets } from "./WELLY_WellyBoost_LevelUpTurrets";
import { WELLY_WellyBoost_MoneyFromDeath } from "./WELLY_WellyBoost_MoneyFromDeath";
import { WELLY_WellyBoost_RangeTurrets } from "./WELLY_WellyBoost_RangeTurrets";

export declare type WELLY_WellyBoostData = {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity: string;
}

/** All the boost that we can use and read from the json wellyBoostData */
const WellyBoostList =
{
    "fullTraining": WELLY_WellyBoost_LevelUpTurrets,
    "damageBonus": WELLY_WellyBoost_BoostDamageTurrets,
    "attackSpeedBonus": WELLY_WellyBoost_AttackSpeedTurrets,
    "rangeBonus": WELLY_WellyBoost_RangeTurrets,
    "moneyBonusFromDeath": WELLY_WellyBoost_MoneyFromDeath,
}

export class WELLY_WellyBoostManager
{
    public scene: WELLY_SceneTowerDefense;

    protected boostDatArray: WELLY_WellyBoostData[];

    /** All the data related to the monsters */
    protected wellyBoostData: WELLY_WellyBoostData[];

    protected rerollCount: number = 3;

    constructor(scene: WELLY_SceneTowerDefense)
    {
        this.scene = scene;

        this.wellyBoostData = this.scene.cache.json.get("wellyBoostData");
    }

    public grantBoost(boostData: WELLY_WellyBoostData): void
    {
        const boostClass = WellyBoostList[boostData.id];
        if (boostClass)
        {
            const newBoost = new boostClass(this.scene) as WELLY_WellyBoost;
            newBoost.activate();
        }
    }

    public generateRandomBoosts(boostCount: number): WELLY_WellyBoostData[]
    {
        let boostDatArray = [] as WELLY_WellyBoostData[];

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
            Phaser.Utils.Array.Remove(indexes, boostIndex);
        }

        this.boostDatArray = boostDatArray;
        return boostDatArray;
    }

    public tryReroll(boostCount: number = 3): WELLY_WellyBoostData[] | undefined
    {
        if (this.canReroll())
        {
            --this.rerollCount;
            return this.generateRandomBoosts(boostCount);
        }
        return undefined;
    }

    public canReroll(): boolean
    {
        return this.rerollCount > 0;
    }

    public getRerollCount(): number
    {
        return this.rerollCount;
    }
}