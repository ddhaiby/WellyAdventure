import { CST } from "../../Common/CST";
import { DIRECTIONS, PathFindingConfig } from "../../Common/Characters/CharacterMovementComponent";
import { SpawnData } from "../../Common/Characters/CharacterSpawner";
import { JunkMonster } from "../../Common/Characters/Npcs/JunkMonster";
import { Npc } from "../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";

export class WaveSpawner extends Phaser.GameObjects.Image
{
    public scene: Welly_Scene;

    /** The number of spawned npcs since the beginning */
    protected spawnedNpcCount: number = 0;

    /** The entity id we should move to */
    protected moveToPointId: number = -1;

    /** The list of the spawned npcs (alive) in the game */
    protected npcs: Npc[];

    protected pathFindingConfig: PathFindingConfig;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y, "");
    }

    /** Whether the spawner can spawn a npc */
    public canSpawnNpc(): boolean
    {
        return true;
    }

    public setPathFindingConfig(inConfig: PathFindingConfig): void
    {
        this.pathFindingConfig = inConfig;
    }

    public getPathFindingConfig(): PathFindingConfig
    {
        return this.pathFindingConfig;
    }

    public reset(shouldKillNpc: boolean = false): void
    {
        this.spawnedNpcCount = 0;

        if (shouldKillNpc)
        {
            for (const npc of this.npcs)
            {
                npc.destroy();
            }

            this.npcs = [];
        }
    }

    /** Spawn a new npc if possible */
    public spawnNpc(npcLevel: number = 0): Npc | undefined
    {
        if (this.canSpawnNpc())
        {
            const npcX = this.x + Phaser.Math.FloatBetween(-5, 5);
            const npcY = this.y + Phaser.Math.FloatBetween(-5, 5);

            const npc = new JunkMonster(this.scene, npcX, npcY);

            const npcSpawn: SpawnData = {
                walkSpeed: 200,
                runSpeed: 200,
                characterTexture: "Amalia",
                startDirection: DIRECTIONS.Down,
                dialogueId: CST.NONE,
                moveToPointId: this.moveToPointId,
                moveToPointRepeat: 0
            };

            npc.init(npcSpawn);
            npc.onDie(() => { this.onNpcDie(npc); }, this);

            npc.moveTo({ positions: this.pathFindingConfig.positions, repeat: this.pathFindingConfig.repeat });

            this.emit("NPC_SPAWNED", npc);

            ++this.spawnedNpcCount;

            return npc;
        }
        return undefined;
    }

    public getAlivedNpcCount(): number
    {
        return this.npcs.length;
    }

    /** Triggered function when a npc dies */
    protected onNpcDie(InNpc: JunkMonster): void
    {
        const npcIndex = this.npcs.findIndex((npc: Npc) => {
            return npc == InNpc;
        }, this);

        if (npcIndex >= 0)
        {
            this.npcs.slice(npcIndex);
        }
        
        this.emit("NPC_DIED", InNpc);
    }

    public getMoveToPointId(): number
    {
        return this.moveToPointId;
    }
}