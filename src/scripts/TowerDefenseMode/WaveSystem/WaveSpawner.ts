import { CST } from "../../Common/CST";
import { DIRECTIONS, PathFindingConfig } from "../../Common/Characters/CharacterMovementComponent";
import { SpawnData } from "../../Common/Characters/CharacterSpawner";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";

export class WaveSpawner extends Phaser.GameObjects.Image
{
    public scene: Welly_Scene;

    /** The number of spawned npcs since the beginning */
    protected spawnedNpcCount: number = 0;

    /** The entity id we should move to */
    protected moveToPointId: number = -1;

    /** The spawned npcs (alive) in the game */
    private npcs: Phaser.Physics.Arcade.Group;

    protected pathFindingConfig: PathFindingConfig;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y, "");

        this.npcs = scene.physics.add.group();
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

    public getNpcs(): Phaser.Physics.Arcade.Group
    {
        return this.npcs;
    }

    public reset(shouldClearNpcs: boolean = false): void
    {
        this.spawnedNpcCount = 0;

        if (shouldClearNpcs)
        {
            this.npcs.clear(true, true);
        }
    }

    /** Spawn a new npc if possible */
    public spawnNpc(npcLevel: number = 0): JunkMonster | undefined
    {
        if (this.canSpawnNpc())
        {
            const rangeX = 10;
            const rangeY = 70;
            const offsetX = Phaser.Math.FloatBetween(-rangeX, rangeX);
            const offsetY = Phaser.Math.FloatBetween(-rangeY, rangeY);

            const npcX = this.x + offsetX;
            const npcY = this.y + offsetY;

            const npc = new JunkMonster(this.scene, npcX, npcY);
            this.npcs.add(npc);

            const npcSpawn: SpawnData = {
                walkSpeed: 200,
                runSpeed: 200,
                characterTexture: "Amalia",
                startDirection: DIRECTIONS.Up,
                dialogueId: CST.NONE,
                moveToPointId: this.moveToPointId,
                moveToPointRepeat: 0
            };

            npc.init(npcSpawn);
            npc.onDie(() => { this.onNpcDie(npc); }, this);

            const adaptedPositions = [] as Phaser.Types.Math.Vector2Like[];
            for (const position of this.pathFindingConfig.positions)
            {
                adaptedPositions.push({
                    x: (position.x != undefined) ? (position.x + offsetX) : undefined,
                    y: (position.y != undefined) ? (position.y + offsetY) : undefined,
                });
            }

            npc.moveTo({ positions: adaptedPositions, repeat: this.pathFindingConfig.repeat });

            this.emit("NPC_SPAWNED", npc);

            ++this.spawnedNpcCount;

            return npc;
        }
        return undefined;
    }

    public getAlivedNpcCount(): number
    {
        return this.npcs.getLength();
    }

    /** Triggered function when a npc dies */
    protected onNpcDie(InNpc: JunkMonster): void
    {
        this.npcs.remove(InNpc, true, true);
        this.emit("NPC_DIED", InNpc);
    }

    public getMoveToPointId(): number
    {
        return this.moveToPointId;
    }
}