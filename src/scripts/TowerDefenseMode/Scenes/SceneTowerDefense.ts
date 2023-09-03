import { CST } from "../../Common/CST";
import { Welly_Scene, SceneData } from "../../Common/Scenes/WELLY_Scene";
import { SceneTowerDefenseUI } from "./SceneTowerDefenseUI";
import { WaveSpawner } from "../WaveSystem/WaveSpawner";
import { MoveToPoint } from "../../Common/PathFinding/MoveToEntity";
import { Npc } from "../../Common/Characters/Npcs/Npc";
import { Turret } from "../Characters/Npcs/Turret";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { WaveManager } from "../WaveSystem/WaveManager";
import { ModalBehavoir } from "phaser3-rex-plugins/plugins/modal";
import { WELLY_Popup } from "../../Common/HUD/WELLY_Popup";
import { TurretPopup } from "../HUD/TurretPopup";

export class SceneTowerDefense extends Welly_Scene
{
    private sceneUI: SceneTowerDefenseUI;

    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;

    // Waves
    private spawners: WaveSpawner[];
    private waveManager: WaveManager;
    private currentWave: number;

    private turrets: Phaser.Physics.Arcade.Group;

    /** The gold to use to build turrets */
    private gold: number = 0;

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
        this.createTurrets();
        this.createCamera();
        this.createPhysics();
        this.initUI();

        this.setGold(100);
        this.waveManager.startNextWave();
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
        this.currentWave = 0;
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
        }

        this.waveManager = new WaveManager(this, this.spawners);
        this.waveManager.onWaveStarted(this.onWaveStarted, this)
        this.waveManager.onWaveCompleted(this.onWaveCompleted, this)
    }

    private createTurrets(): void
    {
        this.turrets = this.physics.add.group();

        const turretArray = this.currentMap.createFromObjects("Wave", {name: "Turret", classType: Turret, key: "emptyTurret"}) as Turret[];

        for (const turret of turretArray)
        {
            this.turrets.add(turret);

            turret.init();

            for (const spawner of this.spawners)
            {
                // @ts-ignore
                this.physics.add.overlap(this.turrets, spawner.getMonsters(), this.onMonsterInRange, this.isMonsterTargetable, this);
            }

            turret.setInteractive();
            turret.on(Phaser.Input.Events.POINTER_UP, () => { this.onTurretClicked(turret); }, this);
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
            (spawner.getMonsters().getChildren() as Npc[]).forEach((npc: Npc) => { npc.update(); }, this);
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
        this.addGold(10);
    }

    private addGold(gold: number): void
    {
        this.setGold(this.gold + gold);
    }

    private removeGold(cost: number): void
    {
        this.setGold(this.gold - cost);
    }

    private setGold(gold: number): void
    {
        this.gold = gold;

        if (this.sceneUI)
        {
            this.sceneUI.onGoldChanged(this.gold);
        }
    }

    private onTurretClicked(turret: Turret): void
    {
        const turretPopup = new TurretPopup(turret, turret.x, turret.y);
        turretPopup.on("requestUpgrade", () => {
            this.tryUpgradeTurret(turret);
        }, this);
    }

    private tryUpgradeTurret(turret: Turret): void
    {
        if (this.gold >= 50)
        {
            turret.upgrade();
            this.removeGold(50);
        }
    }

    private onWaveStarted(currentWave: number): void
    {
        this.sceneUI.onWaveStarted(currentWave);
    }

    private onWaveCompleted(currentWave: number): void
    {
        this.addGold(100);
        this.sceneUI.onWaveCompleted(currentWave);
    }
}