import { CST } from "../../Common/CST";
import { DIRECTIONS } from "../../Common/Characters/CharacterMovementComponent";
import { SpawnData } from "../../Common/Characters/CharacterSpawner";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { MonsterSpawnerData, WaveSpawner } from "./WaveSpawner";

declare type MonsterData = {
    texture: string,
    health: number,
    bodyWidth: number,
    bodyHeight: number,
    gold: number,
    moveSpeed: number
    depth: number
}

export class WaveManager extends Phaser.GameObjects.GameObject
{
    /** Spawners to spawn the monster */
    protected spawners: WaveSpawner[] = [];

    /** The current wave */
    protected currentWave: number = 0;

    /** Total number of waves - Set value to 0 or lower for infinite waves */
    protected waveCount: number = -1;

    /** Number of spawnable monsters for the current wave */
    protected monsterCount: number = 4;

    /** The current number of spawned monsters in the game */
    protected aliveMonsterCount: number = 0;

    /** The number of spawned monsters since the beginning of the game */
    protected spawnedMonsterCount: number = 0;

    /** Base cooldown to spawn a monster */
    protected spawnCooldown: number = 4000;

    protected tickNextWaveTimerEvent: Phaser.Time.TimerEvent;

    /** All the data related to the monsters */
    protected monstersData: any;

    constructor(scene: Welly_Scene, spawners: WaveSpawner[])
    {
        super(scene, "WaveManager");
        this.addSpawners(spawners);

        this.tickNextWaveTimerEvent = this.scene.time.addEvent({});

        this.monstersData = this.scene.cache.json.get("monstersData");
    }

    public addSpawners(newSpawners: WaveSpawner[])
    {
        for (const spawner of newSpawners)
        {
            this.spawners.push(spawner);
            spawner.on("MONSTER_DIED", (monster: JunkMonster) => { this.onMonsterDie(spawner, monster); }, this);
        }
    }

    public getCurrentWave(): number
    {
        return this.currentWave;
    }

    public start(): void
    {
        this.startNextWaveTimer();
    }

    protected startNextWaveTimer(): void
    {
        this.tickNextWaveTimerEvent.remove();
        this.tickNextWaveTimerEvent.destroy();

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

        this.aliveMonsterCount = 0;
        this.spawnedMonsterCount = 0;

        // const gameSettings = this.scene.cache.json.get("gameSettings");
        // this.currentWaveSettings = gameSettings[Math.min(currentLevel - 1, gameSettings.length)];
        // this.monsterCount = this.currentWaveSettings.Enemy.CountBase + this.currentWaveSettings.Enemy.CountIncreasePerWaveBase * (this.currentWave - 1);
        // this.spawnCooldown = Math.max(this.currentWaveSettings.Enemy.SpawnCooldownMin, (this.currentWaveSettings.Enemy.SpawnCooldownBase + this.currentWaveSettings.Enemy.SpawnCooldownIncreasePerWave * (this.currentWave - 1))) * 1000;

        this.monsterCount = 3;
        this.spawnCooldown = 1000;

        for (const spawner of this.spawners)
        {
            this.waitAndSpawnMonster(spawner);
        }

        this.emit("WAVE_STARTED", this.currentWave);

        this.startNextWaveTimer();
    }

    protected onMonsterDie(spawner: WaveSpawner, monster: JunkMonster): void
    {
        --this.aliveMonsterCount;

        if (this.isWaveCompleted())
        {
            this.emit("WAVE_COMPLETED", this.currentWave);
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

    protected waitAndSpawnMonster(spawner: WaveSpawner): void
    {
        ++this.aliveMonsterCount;
        ++this.spawnedMonsterCount;

        this.scene.time.delayedCall(this.spawnCooldown + Math.random() * 400, this.spawnMonster, [spawner, this.currentWave - 1], this);
    }

    protected spawnMonster(spawner: WaveSpawner): void
    {
        const monsterKeys = Object.keys(this.monstersData);
        const val = Phaser.Math.Between(0, monsterKeys.length - 1);
        const monsterKey =  monsterKeys[val];
        const monsterData = this.monstersData[monsterKey] as MonsterData;

        const monsterSpawnData: MonsterSpawnerData = {
            walkSpeed: monsterData.moveSpeed,
            characterTexture: monsterData.texture,
            health: monsterData.health,
            gold: monsterData.gold,
            depth: monsterData.depth
        };

        spawner.spawnMonster(monsterSpawnData);

        if (this.canSpawnMonster())
        {
            this.waitAndSpawnMonster(spawner);
        }
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