export declare type WELLY_TurretData =
{
    id: string;
    turretName: string;
    maxInstances: number;
    attackType: string;
    gameStatsPerLevel: WELLY_TurretGameStats[];
};

export declare type WELLY_TurretGameStats =
{
    texture: string;
    price: number;
    damage: number;
    freezeDuration: number;
    freezeTargetCount: number;
    attackSpeed: number;
    range: number;
    framePerAnim: number;
};