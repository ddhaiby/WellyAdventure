import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { WaveInstance } from "./WaveInstance";
import {  WaveSpawner } from "./WaveSpawner";

declare type WaveDataSettings = {
    spawnCooldownBase: number;
    spawnCooldownVariation: number;
    spawnCooldownMinimum: number;
    spawnCooldownDecreasePerWave: number;
    healthPercentageIncreasePerWave: number;
    monsterCountBase: number;
    monsterCountIncreasePerWaveMin: number;
    monsterCountIncreasePerWaveMax: number;
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

    /** How many monsters were spawned on last wave */
    protected monsterCountLastWave: number = 0;

    protected tickNextWaveTimerEvent: Phaser.Time.TimerEvent;

    /** All the data related to the monsters */
    protected monstersData: any;

    /** All the data related to the waves */
    protected waveData: WaveDataSettings;

    /** The spawned monsters (alive) in the game */
    private monsters: Phaser.Physics.Arcade.Group;

    constructor(scene: Welly_Scene, spawners: WaveSpawner[])
    {
        super(scene, "WaveManager");
        this.addSpawners(spawners);

        this.tickNextWaveTimerEvent = this.scene.time.addEvent({});

        this.monstersData = this.scene.cache.json.get("monstersData");
        this.waveData = this.scene.cache.json.get("waveData");
        this.monsters = scene.physics.add.group();

        this.monsterCountLastWave = this.waveData.monsterCountBase;
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
            const waitWaveDuration = 20000;
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
        const monsterCount = this.generateMonsterCount();
        this.monsterCountLastWave = monsterCount;

        const spawnCooldown = this.waveData.spawnCooldownBase - this.waveData.spawnCooldownDecreasePerWave * this.currentWave;
        const healthPercentageBonus = this.waveData.healthPercentageIncreasePerWave * this.currentWave;

        const waveInstance = new WaveInstance(this.scene, {
            monsterCount: monsterCount,
            spawnCooldown: spawnCooldown,
            spawnCooldownVariation: this.waveData.spawnCooldownVariation,
            spawnCooldownMinimum: this.waveData.spawnCooldownMinimum,
            monstersData: this.monstersData,
            spawners: this.spawners,
            waveNumber: this.currentWave + 1,
            monsterGroup: this.monsters,
            healthPercentageBonus: healthPercentageBonus
        });
        waveInstance.on("MONSTER_DIED", this.onMonsterDie, this);
        waveInstance.on("MONSTER_MOVE_TO_END", this.onMonsterMoveToEnd, this);
        waveInstance.on("WAVE_COMPLETED", () => { this.onWaveInstanceCompleted(waveInstance); }, this);
        this.waveInstances.push(waveInstance);

        ++this.currentWave;

        this.emit("WAVE_STARTED", this.currentWave);

        this.startNextWaveTimer();
    }

    protected generateMonsterCount(): number
    {
        return Math.max(1, this.monsterCountLastWave + Phaser.Math.Between(-this.waveData.monsterCountIncreasePerWaveMin, this.waveData.monsterCountIncreasePerWaveMax));
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
        this.monsterCountLastWave = this.waveData.monsterCountBase;

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