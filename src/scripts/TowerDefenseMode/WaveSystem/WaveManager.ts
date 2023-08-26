import { Character } from "../../Common/Characters/Character";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { WaveSpawner } from "./WaveSpawner";

export class WaveManager extends Phaser.GameObjects.GameObject
{
    protected _spawners: WaveSpawner[] = [];

    /** The current wave players are facing */
    protected _currentWave: number = 0;

    /** Total number of waves - Set value to 0 or lower for infinite waves */
    protected _waveCount: number = -1;

    /** Number of spawnable npcs for one wave */
    protected _npcCount: number = 4;

    /** The current number of spawned npcs in the game */
    protected _aliveSpawnedNpcCount: number = 0;

    /** The number of spawned npcs since the beginning of the game */
    protected _spawnedNpcCount: number = 0;

    /** Number of npcs killed from the current wave */
    protected _killedNpcCount: number = 0;

    /** Base cooldown to spawn a npx */
    protected _spawnCooldown: number = 4000;

    protected _currentWaveSettings: any;

    constructor(scene: Phaser.Scene, spawners: WaveSpawner[], currentLevel: number)
    {
        super(scene, "WaveManager");
        this.addSpawners(spawners);

        const gameSettings = this.scene.cache.json.get("gameSettings");
        this._currentWaveSettings = gameSettings[Math.min(currentLevel - 1, gameSettings.length)].Enemy;
        this._waveCount = this._currentWaveSettings.WaveCount;
        this._npcCount = this._currentWaveSettings.CountBase + this._currentWaveSettings.CountIncreasePerWaveBase * this._currentWave;
    }

    public addSpawners(newSpawners: WaveSpawner[])
    {
        for (const spawner of newSpawners)
        {
            this._spawners.push(spawner);
            spawner.on("NPC_DIED", (npc: JunkMonster) => { this.onNpcDie(spawner, npc); }, this);
        }
    }

    public get currentWave(): number
    {
        return this._currentWave;
    }

    public startNewWave(currentLevel: number): void
    {
        ++this._currentWave;

        this._aliveSpawnedNpcCount = 0;
        this._spawnedNpcCount = 0;
        this._killedNpcCount = 0;

        const gameSettings = this.scene.cache.json.get("gameSettings");
        this._currentWaveSettings = gameSettings[Math.min(currentLevel - 1, gameSettings.length)];
        this._npcCount = this._currentWaveSettings.Enemy.CountBase + this._currentWaveSettings.Enemy.CountIncreasePerWaveBase * (this._currentWave - 1);
        this._spawnCooldown = Math.max(this._currentWaveSettings.Enemy.SpawnCooldownMin, (this._currentWaveSettings.Enemy.SpawnCooldownBase + this._currentWaveSettings.Enemy.SpawnCooldownIncreasePerWave * (this._currentWave - 1))) * 1000;

        for (const spawner of this._spawners)
        {
            this.waitAndSpawnNpc(spawner);
        }
    }

    protected onNpcDie(spawner: WaveSpawner, npc: JunkMonster): void
    {
        --this._aliveSpawnedNpcCount;
        ++this._killedNpcCount;

        if (this.isWaveCompleted())
        {
            this.onWaveCompleted();
        }
    }

    protected canSpawnNpc(): boolean
    {
        return this._spawnedNpcCount < this._npcCount;
    }

    protected isWaveCompleted(): boolean
    {
        return !this.canSpawnNpc() && this._aliveSpawnedNpcCount <= 0;
    }

    protected waitAndSpawnNpc(spawner: WaveSpawner): void
    {
        ++this._aliveSpawnedNpcCount;
        ++this._spawnedNpcCount;

        this.scene.time.delayedCall(this._spawnCooldown + Math.random() * 400, this.spawnNpc, [spawner, this._currentWave - 1], this);
    }

    protected spawnNpc(spawner: WaveSpawner, npcLevel: number = 0): void
    {
        spawner.spawnNpc(npcLevel);

        if (this.canSpawnNpc())
        {
            this.waitAndSpawnNpc(spawner);
        }
    }

    protected onWaveCompleted(): void
    {
        const allWavesCompleted = (this._waveCount > 0) && (this._currentWave >= this._waveCount);
        this.emit("WAVE_COMPLETED", allWavesCompleted);
    }

    public getKilledCountFromCurrentWave(): number
    {
        return this._killedNpcCount;
    }
}