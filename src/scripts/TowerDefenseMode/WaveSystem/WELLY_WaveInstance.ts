import { WELLY_SpawnData } from "../../Common/Characters/WELLY_CharacterSpawner";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_JunkMonster } from "../Characters/Npcs/WELLY_JunkMonster";
import { WELLY_Turret } from "../Characters/Npcs/Turrets/WELLY_Turret";
import { WELLY_WaveSpawner } from "./WELLY_WaveSpawner";

declare type WELLY_MonsterData = {
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

export declare type WELLY_MonsterSpawnerData = WELLY_SpawnData &
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

declare type WELLY_WaveInstanceData = {
    monsterCount: number,
    spawnCooldown: number,
    spawnCooldownVariation: number,
    spawnCooldownMinimum: number,
    healthPercentageBonus: number,
    monstersData: any
    spawners: WELLY_WaveSpawner[],
    waveNumber: number,
    monsterGroup: Phaser.Physics.Arcade.Group
}

export class WELLY_WaveInstance extends Phaser.Events.EventEmitter
{
    public scene: WELLY_BaseScene;

    /** Number of spawnable monsters for the current wave */
    protected monsterCount: number = 4;

    /** The current number of spawned monsters in the game */
    protected aliveMonsterCount: number = 0;

    /** The number of spawned monsters since the beginning of the game */
    protected spawnedMonsterCount: number = 0;

    /** Base cooldown to spawn a monster */
    protected spawnCooldown: number = 1000;

    /** Noise cooldown to diversify the moment of spawn */
    protected spawnCooldownVariation: number = 100;
    
    protected spawnCooldownMinimum: number = 100;

    protected healthPercentageBonus: number = 0;

    protected spawners: WELLY_WaveSpawner[];

    /** Which wave is it */
    protected waveNumber: number;

    /** All the data related to the monsters */
    protected monstersData: any;

    protected monsterGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: WELLY_BaseScene, waveInstanceData: WELLY_WaveInstanceData)
    {
        super();

        this.scene = scene;
        this.monsterCount = waveInstanceData.monsterCount;
        this.monstersData = waveInstanceData.monstersData;
        this.spawners = waveInstanceData.spawners;
        this.waveNumber = waveInstanceData.waveNumber;
        this.monsterGroup = waveInstanceData.monsterGroup;

        this.spawnCooldown = waveInstanceData.spawnCooldown;
        this.spawnCooldownVariation = waveInstanceData.spawnCooldownVariation;
        this.healthPercentageBonus = waveInstanceData.healthPercentageBonus;

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
        const cooldown = Math.max(this.spawnCooldownMinimum, this.spawnCooldown + (Math.random() * this.spawnCooldownVariation * 2 - this.spawnCooldownVariation));
        this.scene.time.delayedCall(cooldown, this.spawnMonster, [spawner], this);
    }

    protected pickRandomSpawner(): WELLY_WaveSpawner
    {
        return this.spawners[Phaser.Math.Between(0, this.spawners.length - 1)];
    }

    protected spawnMonster(spawner: WELLY_WaveSpawner): void
    {
        const monsterKeys = Object.keys(this.monstersData);
        const monsterKey =  monsterKeys[Phaser.Math.Between(0, monsterKeys.length - 1)];
        const monsterData = this.monstersData[monsterKey] as WELLY_MonsterData;

        const monsterSpawnData: WELLY_MonsterSpawnerData = {
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

        const monster = new WELLY_JunkMonster(this.scene, monsterX, monsterY);
        this.monsterGroup.add(monster);
        monster.init(monsterSpawnData);

        monster.setMaxHealth(monster.getMaxHealth() * (1 + this.healthPercentageBonus));
        monster.setHealth(monster.getMaxHealth());

        ++this.aliveMonsterCount;
        ++this.spawnedMonsterCount;

        monster.on("DIE", (sourceTurret?: WELLY_Turret) => { this.onMonsterDie(monster, sourceTurret); }, this);
        monster.on("MOVE_TO_END", () => { this.emit("MONSTER_MOVE_TO_END", monster); }, this);

        const pathConfig = spawner.getPathFindingConfig();
        const adaptedPositions = [] as Phaser.Math.Vector2[];
        for (const position of pathConfig.positions)
        {
            adaptedPositions.push(new Phaser.Math.Vector2(position.x + offsetX, position.y + offsetY));
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

    protected onMonsterDie(monster: WELLY_JunkMonster, sourceTurret?: WELLY_Turret): void
    {
        this.emit("MONSTER_DIED", monster, sourceTurret);
        --this.aliveMonsterCount;

        if (this.isWaveCompleted())
        {
            this.emit("WAVE_COMPLETED");
        }
    }
}