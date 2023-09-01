import { CST } from "../../Common/CST";
import { Welly_Scene, SceneData } from "../../Common/Scenes/WELLY_Scene";
import { SceneTowerDefenseUI } from "./SceneTowerDefenseUI";
import { WaveSpawner } from "../WaveSystem/WaveSpawner";
import { MoveToPoint } from "../../Common/PathFinding/MoveToEntity";
import { Npc } from "../../Common/Characters/Npcs/Npc";
import { Turret } from "../Characters/Npcs/Turret";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";

export class SceneTowerDefense extends Welly_Scene
{
    private sceneUI: SceneTowerDefenseUI;

    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;

    private spawners: WaveSpawner[];

    private turrets: Phaser.Physics.Arcade.Group;

    /** The money to use to build turrets */
    private money: number = 0;

    constructor()
    {
        super({key: CST.SCENES.TOWER_DEFENSE});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: SceneData): void
    {
        this.spawners = [];
    }

    // Preload
    ////////////////////////////////////////////////////////////////////////

    public preload(): void
    {
    }

    // Create
    ////////////////////////////////////////////////////////////////////////

    public create(): void
    {
        super.create();

        this.createMap();
        this.setupWaveSpawner();
        this.createBaseTurrets();
        this.createCamera();
        this.createPhysics();
        this.initUI();

        this.setMoney(100);
    }

    private createMap(): void
    {
        this.currentMap = this.add.tilemap("towerDefenseMap");

        const tileset = this.currentMap.addTilesetImage("assetTowerDefenseMap", "assetTowerDefenseMap");
        if (tileset)
        {
            const layer1 = this.currentMap.createLayer("Layer1", tileset, 0, 0);
            const layer2 = this.currentMap.createLayer("Layer2", tileset, 0, 0);

            if (layer1)
            {
                const platformsBounds = layer1.getBounds();
                this.physics.world.setBounds(0, 0, platformsBounds.width, platformsBounds.height);
            }
        }
    }

    private setupWaveSpawner(): void
    {
        this.spawners = this.currentMap.createFromObjects("Wave", {name: "WaveSpawner", classType: WaveSpawner}) as WaveSpawner[];

        for (const monsterSpawner of this.spawners)
        {
            let moveToPointId = monsterSpawner.getMoveToPointId();
            let positions = [] as Phaser.Types.Math.Vector2Like[];

            while (moveToPointId >= 0)
            {
                const moveToEntities = this.currentMap.createFromObjects("Wave", {id: moveToPointId, classType: MoveToPoint}) as MoveToPoint[];

                if (moveToEntities.length > 0)
                {
                    positions.push(new Phaser.Math.Vector2(moveToEntities[0].x, moveToEntities[0].y))
                    moveToPointId = moveToEntities[0].moveToPointId;

                    for (const entity of moveToEntities)
                    {
                        entity.destroy();
                    }
                }
                else
                {
                    moveToPointId = -1;
                }
            }

            positions.reverse();

            monsterSpawner.setPathFindingConfig({positions: positions, repeat: 0});
            monsterSpawner.onMonsterDie((monster: JunkMonster)=> { this.onMonsterDie(monster); }, this);

           let i = 0;

            const fn = () => {
                if (++i > 10)
                {
                    return;
                }
                monsterSpawner.spawnNpc();
                this.time.delayedCall(2000, () => { fn(); })
            }

            fn();
        }
    }

    private createBaseTurrets(): void
    {
        this.turrets = this.physics.add.group();

        const turretArray = this.currentMap.createFromObjects("Wave", {name: "Turret", classType: Turret, key: "emptyTurret"}) as Turret[];

        for (const turret of turretArray)
        {
            this.turrets.add(turret);

            for (const spawner of this.spawners)
            {
                // @ts-ignore
                this.physics.add.overlap(this.turrets, spawner.getNpcs(), this.onMonsterInRange, this.isMonsterTargetable, this);
            }
        }
    }

    private createCamera(): void
    {
        const worldBound = this.physics.world.bounds;
        this.cameras.main.zoomTo(CST.GAME.ZOOM.TOWER_DEFENSE, 0.0);
    }

    private createPhysics(): void
    {

    }

    private initUI(): void
    {
        this.sceneUI = this.scene.get<SceneTowerDefenseUI>(CST.SCENES.TOWER_DEFENSE_UI);
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(time: number, delta: number): void
    {
        super.update(time, delta);

        for (const spawner of this.spawners)
        {
            (spawner.getNpcs().getChildren() as Npc[]).forEach((npc: Npc) => { npc.update(); }, this);
            (this.turrets.getChildren() as Turret[]).forEach((turret: Turret) => { turret.update(); }, this);
        }
    }

    private isMonsterTargetable(turret: Turret, monster: JunkMonster): boolean
    {
        return true;
    }

    private onMonsterInRange(turret: Turret, monster: JunkMonster): void
    {
        turret.onMonsterInRange(monster);
    }

    private onMonsterDie(monster: JunkMonster): void
    {
        this.addMoney(10);
    }

    private addMoney(money: number): void
    {
        this.setMoney(this.money + money);
    }

    private removeMoney(cost: number): void
    {
        this.setMoney(this.money - cost);
    }

    private setMoney(money: number): void
    {
        this.money = money;

        if (this.sceneUI)
        {
            this.sceneUI.onMoneyChanged(this.money);
        }
    }
}