import { SpawnData } from "../../Common/Characters/CharacterSpawner";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { WaveSpawner } from "./WaveSpawner";

declare type MonsterData = {
    name: string,
    texture: string,
    health: number,
    bodyWidth: number,
    bodyHeight: number,
    coin: number,
    damage: number,
    moveSpeed: number
    depth: number
};

export declare type MonsterSpawnerData = SpawnData &
{
    /** To override the depth of the image */
    depth?: number;

    /** Health of the monster on spawn */
    health: number;

    /** How much coin the player gets from killing this monster */
    coin: number;

    /** Damage of the monster when they reach the end */
    damage: number;
};

declare type WaveInstanceData = {
    monsterCount: number,
    spawnCooldown: number,
    monstersData: any
    spawners: WaveSpawner[],
    waveNumber: number,
    monsterGroup: Phaser.Physics.Arcade.Group
}

export class WaveInstance extends Phaser.Events.EventEmitter
{
    public scene: Welly_Scene;

    /** Number of spawnable monsters for the current wave */
    protected monsterCount: number = 4;

    /** The current number of spawned monsters in the game */
    protected aliveMonsterCount: number = 0;

    /** The number of spawned monsters since the beginning of the game */
    protected spawnedMonsterCount: number = 0;

    /** Base cooldown to spawn a monster */
    protected spawnCooldown: number = 1000;

    protected spawners: WaveSpawner[];

    /** Which wave is it */
    protected waveNumber: number;

    /** All the data related to the monsters */
    protected monstersData: any;

    protected monsterGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: Welly_Scene, waveInstanceData: WaveInstanceData)
    {
        super();

        this.scene = scene;
        this.monsterCount = waveInstanceData.monsterCount;
        this.monstersData = waveInstanceData.monstersData;
        this.spawners = waveInstanceData.spawners;
        this.waveNumber = waveInstanceData.waveNumber;
        this.monsterGroup = waveInstanceData.monsterGroup;

        this.start();
    }

    public start(): void
    {
        this.aliveMonsterCount = 0;
        this.spawnedMonsterCount = 0;

        this.spawnMonster(this.pickRandomSpawner());
    }

    public getWaveNumber(): number
    {
        return this.waveNumber;
    }

    public waitAndSpawnMonster(): void
    {
        const spawner = this.pickRandomSpawner();
        // this.scene.time.delayedCall(this.spawnCooldown + Math.random() * 400, this.spawnMonster, [spawner], this);
        this.scene.time.delayedCall(1000, this.spawnMonster, [spawner], this);
    }

    protected pickRandomSpawner(): WaveSpawner
    {
        return this.spawners[Phaser.Math.Between(0, this.spawners.length - 1)];
    }

    protected spawnMonster(spawner: WaveSpawner): void
    {
        const monsterKeys = Object.keys(this.monstersData);
        const monsterKey =  monsterKeys[Phaser.Math.Between(0, monsterKeys.length - 1)];
        const monsterData = this.monstersData[monsterKey] as MonsterData;

        const monsterSpawnData: MonsterSpawnerData = {
            name: monsterData.name,
            walkSpeed: monsterData.moveSpeed,
            characterTexture: monsterData.texture,
            health: monsterData.health,
            coin: monsterData.coin,
            damage: monsterData.damage,
            depth: monsterData.depth
        };

        const rangeX = 10;
        const rangeY = 30;
        const offsetX = Phaser.Math.FloatBetween(-rangeX, rangeX);
        const offsetY = Phaser.Math.FloatBetween(-rangeY, rangeY);
        const monsterX = spawner.x + offsetX;
        const monsterY = spawner.y + offsetY;

        const monster = new JunkMonster(this.scene, monsterX, monsterY);
        this.monsterGroup.add(monster);
        monster.init(monsterSpawnData);
        
        ++this.aliveMonsterCount;
        ++this.spawnedMonsterCount;

        monster.on("DIE", () => { this.onMonsterDie(monster); }, this);
        monster.on("MOVE_TO_END", () => { this.emit("MONSTER_MOVE_TO_END", monster); }, this);

        const pathConfig = spawner.getPathFindingConfig();
        const adaptedPositions = [] as Phaser.Types.Math.Vector2Like[];
        for (const position of pathConfig.positions)
        {
            adaptedPositions.push({
                x: (position.x != undefined) ? (position.x + offsetX) : undefined,
                y: (position.y != undefined) ? (position.y + offsetY) : undefined,
            });
        }

        monster.moveTo({ positions: adaptedPositions, repeat: pathConfig.repeat });

        if (this.canSpawnMonster())
        {
            this.waitAndSpawnMonster();
        }
    }

    protected canSpawnMonster(): boolean
    {
        return this.spawnedMonsterCount < this.monsterCount;
    }

    protected isWaveCompleted(): boolean
    {
        return !this.canSpawnMonster() && (this.aliveMonsterCount <= 0);
    }

    protected onMonsterDie(monster: JunkMonster): void
    {
        this.emit("MONSTER_DIED", monster);
        --this.aliveMonsterCount;

        if (this.isWaveCompleted())
        {
            this.emit("WAVE_COMPLETED");
        }
    }
}