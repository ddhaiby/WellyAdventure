import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";

export declare type WellyBoostData = {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity: string;
}

export class WellyBoostManager
{
    public scene: Welly_Scene;

    protected boostDatArray: WellyBoostData[];

    /** All the data related to the monsters */
    protected wellyBoostData: WellyBoostData[];

    constructor(scene: Welly_Scene)
    {
        this.scene = scene;

        this.wellyBoostData = this.scene.cache.json.get("wellyBoostData");
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