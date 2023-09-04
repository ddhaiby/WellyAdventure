import { CST } from "../../Common/CST";
import { Welly_Scene, SceneData } from "../../Common/Scenes/WELLY_Scene";
import { SceneTowerDefenseUI } from "./SceneTowerDefenseUI";
import { WaveSpawner } from "../WaveSystem/WaveSpawner";
import { MoveToPoint } from "../../Common/PathFinding/MoveToEntity";
import { Npc } from "../../Common/Characters/Npcs/Npc";
import { Turret } from "../Characters/Npcs/Turrets/Turret";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { WaveManager } from "../WaveSystem/WaveManager";
import { TurretPopup } from "../Characters/Npcs/Turrets/TurretPopup";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import { WELLY_Bar } from "../../Common/HUD/WELLY_Bar";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

export class SceneTowerDefense extends Welly_Scene
{
    private sceneUI: SceneTowerDefenseUI;

    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;

    // Waves
    private spawners: WaveSpawner[];
    private waveManager: WaveManager;
    private currentWave: number;

    private turrets: Phaser.Physics.Arcade.StaticGroup;

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
        this.waveManager.start();
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
        this.turrets = this.physics.add.staticGroup();

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
        // Check if the monster is in the disk inside the square body of the turret
        const posBodyTurret = { x: turret.body.x + turret.body.width * 0.5, y: turret.body.y + turret.body.height * 0.5 };
        const posBodyMonster = { x: monster.body.x + monster.body.width * 0.5, y: monster.body.y + monster.body.height * 0.5 };
        const squareDistance = Phaser.Math.Distance.BetweenPointsSquared(posBodyTurret, posBodyMonster);
        const squareRange = turret.getRange() * turret.getRange();
        return (squareDistance <= squareRange);
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
        this.sceneUI.onGoldChanged(this.gold);
    }

    private onTurretClicked(turret: Turret): void
    {
        this.sceneUI.onTurretClicked(turret);

        const outlinePlugin = this.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
        outlinePlugin.add(turret, { thickness: 2, outlineColor: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE) });

        const fnOnTurretUpgrade = () => { this.sceneUI.updateTurretDataWidget(turret); };
        turret.on("upgrade", fnOnTurretUpgrade, this);
        turret.showRangeIndicator();

        const turretPopup = new TurretPopup(turret, turret.x, turret.y);
        turretPopup.on("requestUpgrade", () => { this.tryUpgradeTurret(turret); }, this);
        turretPopup.once("destroyed", () => {
            this.sceneUI.hideTurretDataWidget();
            turret.hideRangeIndicator();
            turret.off("upgrade", fnOnTurretUpgrade, this);
            outlinePlugin.remove(turret);
        }, this); 

        this.tweens.add({ targets: turret, scale: 1.08, yoyo: true, repeat: 0, duration: 100 });
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