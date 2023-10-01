export declare type TurretData =
{
    id: string;
    turretName: string;
    maxInstances: number;
    gameStatsPerLevel: TurretGameStats[];
};

export declare type TurretGameStats =
{
    texture: string;
    price: number;
    damage: number;
    attackSpeed: number;
    range: number;
};