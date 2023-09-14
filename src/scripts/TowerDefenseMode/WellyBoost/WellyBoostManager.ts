import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";

export class WellyBoostManager
{
    public scene: Welly_Scene;

    protected boostIds: string[];

    constructor(scene: Welly_Scene)
    {
        this.scene = scene;
    }

    public generateRandomBoosts(boostCount: number): string[]
    {
        let boostIds = [] as string[];
        for (let i = 0; i < boostCount; ++i)
        {
            boostIds.push(Phaser.Math.Between(0, 10).toString());
        }

        this.boostIds = boostIds;
        return boostIds;
    }
}