import { SpawnData } from "../../Common/Characters/CharacterSpawner";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import {  WaveSpawner } from "./WaveSpawner";

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

class WaveInstance extends Phaser.Events.EventEmitter
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

export class WaveManager extends Phaser.GameObjects.GameObject
{
    public scene: Welly_Scene;

    /** Spawners to spawn the monster */
    protected spawners: WaveSpawner[] = [];

    /** All the running wave instances */
    protected waveInstances: WaveInstance[] = [];

    /** The current wave */
    protected currentWave: number = 0;

    /** Total number of waves - Set value to 0 or lower for infinite waves */
    protected waveCount: number = -1;

    protected tickNextWaveTimerEvent: Phaser.Time.TimerEvent;

    /** All the data related to the monsters */
    protected monstersData: any;

    /** The spawned monsters (alive) in the game */
    private monsters: Phaser.Physics.Arcade.Group;

    constructor(scene: Welly_Scene, spawners: WaveSpawner[])
    {
        super(scene, "WaveManager");
        this.addSpawners(spawners);

        this.tickNextWaveTimerEvent = this.scene.time.addEvent({});

        this.monstersData = this.scene.cache.json.get("monstersData");
        this.monsters = scene.physics.add.group();
    }

    public addSpawners(newSpawners: WaveSpawner[])
    {
        for (const spawner of newSpawners)
        {
            this.spawners.push(spawner);
        }
    }

    public getCurrentWave(): number
    {
        return this.currentWave;
    }

    public start(): void
    {
        this.waveInstances = [];
        this.startNextWaveTimer();
    }

    public restart(): void
    {
        this.clear();
        this.start();
    }

    protected startNextWaveTimer(): void
    {
        this.clearWaveTimer();

        const allWavesCompleted = (this.waveCount > 0) && (this.currentWave >= this.waveCount);
        if (!allWavesCompleted)
        {
            const waitWaveDuration = 10000;
            this.tickNextWaveTimer(waitWaveDuration, waitWaveDuration);
            this.emit("WAVE_TIMER_STARTED", waitWaveDuration);
        }
    }

    protected tickNextWaveTimer(remainDuration: number, totalDuration: number): void
    {
        if (remainDuration > 0)
        {          
            const tickDuration = 100;
  
            this.tickNextWaveTimerEvent = this.scene.time.delayedCall(tickDuration, () => {
                remainDuration -= tickDuration;
                this.tickNextWaveTimer(remainDuration, totalDuration);
                this.emit("WAVE_TIMER_TICK", remainDuration, totalDuration);
            }, undefined, this);
        }
        else
        {
            this.startNextWave();
        }
    }

    public startNextWave(): void
    {
        ++this.currentWave;

        const waveInstance = new WaveInstance(this.scene, {
            monsterCount: 4,
            spawnCooldown: 4000,
            monstersData: this.monstersData,
            spawners: this.spawners,
            waveNumber: this.currentWave,
            monsterGroup: this.monsters
        });
        waveInstance.on("MONSTER_DIED", this.onMonsterDie, this);
        waveInstance.on("MONSTER_MOVE_TO_END", this.onMonsterMoveToEnd, this);
        waveInstance.on("WAVE_COMPLETED", () => { this.onWaveInstanceCompleted(waveInstance); }, this);
        this.waveInstances.push(waveInstance);

        this.emit("WAVE_STARTED", this.currentWave);

        this.startNextWaveTimer();
    }

    protected onMonsterDie(monster: JunkMonster): void
    {
        this.emit("MONSTER_DIED", monster);
        this.monsters.remove(monster, true, true);
    }

    protected onMonsterMoveToEnd(monster: JunkMonster): void
    {
        this.emit("MONSTER_MOVE_TO_END", monster);
    }

    protected onWaveInstanceCompleted(waveInstance: WaveInstance): void
    {
        const index = this.waveInstances.indexOf(waveInstance);

        if (index >= 0)
        {
            this.waveInstances.splice(index, 1);
        }

        this.emit("WAVE_COMPLETED", waveInstance.getWaveNumber());
    }

    public clear(): void
    {
        this.clearWaveTimer();

        this.monsters.clear(true, true);

        this.waveInstances = [];
    }

    public getMonsters(): Phaser.Physics.Arcade.Group
    {
        return this.monsters;
    }

    protected clearWaveTimer(): void
    {
        this.tickNextWaveTimerEvent.remove();
        this.tickNextWaveTimerEvent.destroy();
    }

    public onWaveStarted(fn: (currentWave: number) => void , context?: any): void
    {
        this.on("WAVE_STARTED", fn, context);
    }

    public onWaveCompleted(fn: (currentWave: number) => void , context?: any): void
    {
        this.on("WAVE_COMPLETED", fn, context);
    }

    public onWaveTimerStarted(fn: () => void , context?: any): void
    {
        this.on("WAVE_TIMER_STARTED", fn, context);
    }

    public onWaveTimerTick(fn: (remainDuration: number, totalDuration: number) => void , context?: any): void
    {
        this.on("WAVE_TIMER_TICK", fn, context);
    }
}