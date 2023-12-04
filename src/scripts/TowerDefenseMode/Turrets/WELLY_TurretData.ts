export declare type WELLY_TurretData =
{
    id: string;
    turretName: string;
    maxInstances: number;
    gameStatsPerLevel: WELLY_TurretGameStats[];
};

export declare type WELLY_TurretGameStats =
{
    texture: string;
    price: number;
    damage: number;
    attackSpeed: number;
    range: number;
};