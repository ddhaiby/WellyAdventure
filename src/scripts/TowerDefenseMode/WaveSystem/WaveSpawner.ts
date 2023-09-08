import { CST } from "../../Common/CST";
import { DIRECTIONS, PathFindingConfig } from "../../Common/Characters/CharacterMovementComponent";
import { SpawnData } from "../../Common/Characters/CharacterSpawner";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";

export class WaveSpawner extends Phaser.GameObjects.Image
{
    public scene: Welly_Scene;

    /** The number of spawned monsters since the beginning */
    protected spawnedMonsterCount: number = 0;

    /** The entity id we should move to */
    protected moveToPointId: number = -1;

    /** The spawned monsters (alive) in the game */
    private monsters: Phaser.Physics.Arcade.Group;

    protected pathFindingConfig: PathFindingConfig;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y, "");

        this.monsters = scene.physics.add.group();
    }

    /** Whether the spawner can spawn a monster */
    public canSpawnMonster(): boolean
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

    public getMonsters(): Phaser.Physics.Arcade.Group
    {
        return this.monsters;
    }

    public reset(shouldClearMonsters: boolean = false): void
    {
        this.spawnedMonsterCount = 0;

        if (shouldClearMonsters)
        {
            this.monsters.clear(true, true);
        }
    }

    /** Spawn a new monster if possible */
    public spawnMonster(spawnData: SpawnData): JunkMonster | undefined
    {
        if (this.canSpawnMonster())
        {
            const rangeX = 10;
            const rangeY = 30;
            const offsetX = Phaser.Math.FloatBetween(-rangeX, rangeX);
            const offsetY = Phaser.Math.FloatBetween(-rangeY, rangeY);

            const monsterX = this.x + offsetX;
            const monsterY = this.y + offsetY;

            const monster = new JunkMonster(this.scene, monsterX, monsterY);
            this.monsters.add(monster);

            const rand = Math.random();
            const texture = rand < 0.2 ? "Amalia" : ( rand < 0.5 ? "wellyWhite" : (rand < 0.75 ? "player": "wellyRed"))

            monster.init(spawnData);
            monster.onDie(() => {
                this.emit("MONSTER_DIED", monster);
                this.monsters.remove(monster, true, true);
            }, this);

            const adaptedPositions = [] as Phaser.Types.Math.Vector2Like[];
            for (const position of this.pathFindingConfig.positions)
            {
                adaptedPositions.push({
                    x: (position.x != undefined) ? (position.x + offsetX) : undefined,
                    y: (position.y != undefined) ? (position.y + offsetY) : undefined,
                });
            }

            monster.moveTo({ positions: adaptedPositions, repeat: this.pathFindingConfig.repeat });

            this.emit("MONSTER_SPAWNED", monster);

            ++this.spawnedMonsterCount;

            return monster;
        }
        return undefined;
    }

    public getAlivedMonsterCount(): number
    {
        return this.monsters.getLength();
    }

    public onMonsterDie(fn: (monster: JunkMonster) => void , context?: any): void
    {
        this.on("MONSTER_DIED", fn, context);
    }

    public getMoveToPointId(): number
    {
        return this.moveToPointId;
    }
}