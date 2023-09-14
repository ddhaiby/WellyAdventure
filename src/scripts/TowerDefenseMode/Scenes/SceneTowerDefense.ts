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
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { WaveCountdownWidget } from "../HUD/WaveCountdownWidget";

export class SceneTowerDefense extends Welly_Scene
{
    private sceneUI: SceneTowerDefenseUI;

    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;
    protected layer1: Phaser.Tilemaps.TilemapLayer;

    // Waves
    private spawners: WaveSpawner[];
    private waveManager: WaveManager;

    private turrets: Phaser.Physics.Arcade.StaticGroup;

    /** The gold to use to build turrets */
    private gold: number = 0;

    /** The health of the player. The game is over when they reach 0 */
    private playerHealth: number = 100;

     /** The max health of the player. */
     private playerMaxHealth: number = 100;

    /** Shows when the next wave should start */
    private waveCountdownWidgets: WaveCountdownWidget[];

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
        this.createWaveSpawner();
        this.createTurrets();
        this.createCamera();
        this.createPhysics();
        this.initUI();

        this.setPlayerGold(100);
        this.setPlayerHealth(100, 100);
        this.onWaveStarted(0);
        this.waveManager.start();

        // Wait a few milliseconds to let the camera update correctly
        this.time.delayedCall(100, () => { this.showWellyBoostSelection() }, undefined, this);
    }

    private createMap(): void
    {
        this.currentMap = this.add.tilemap("towerDefenseMap");

        const tileset = this.currentMap.addTilesetImage("assetTowerDefenseMap", "assetTowerDefenseMap");
        if (tileset)
        {
            this.layer1 = this.currentMap.createLayer("Layer1", tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
            this.currentMap.createLayer("Layer2", tileset, 0, 0);

            const platformsBounds = this.layer1.getBounds();
            this.physics.world.setBounds(-platformsBounds.width, -platformsBounds.height, platformsBounds.width * 2, platformsBounds.height * 2);
        }
    }

    private createWaveSpawner(): void
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
            monsterSpawner.onMonsterDie(this.onMonsterDie, this);
            monsterSpawner.on("MONSTER_MOVE_TO_END", this.onMonsterReachEndPoint, this);
        }

        const waveCountdownSpawners = this.currentMap.createFromObjects("Wave", {name: "WaveCountdown", classType: Phaser.GameObjects.Image}) as Phaser.GameObjects.Image[];
        this.waveCountdownWidgets = [];
        
        for (const waveCountdownSpawner of waveCountdownSpawners)
        {
            const waveWidget = new WaveCountdownWidget(this, waveCountdownSpawner.x, waveCountdownSpawner.y);
            this.waveCountdownWidgets.push(waveWidget);
            waveWidget.on(Phaser.Input.Events.POINTER_UP, () => { this.onWaveCountdownWidgetClicked(waveWidget); }, this);
            waveCountdownSpawner.destroy();
        }

        this.waveManager = new WaveManager(this, this.spawners);
        this.waveManager.onWaveStarted(this.onWaveStarted, this)
        this.waveManager.onWaveCompleted(this.onWaveCompleted, this);
        this.waveManager.onWaveTimerStarted(this.onWaveTimerStarted, this);
        this.waveManager.onWaveTimerTick(this.onWaveTimerTick, this);
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
        this.cameras.main.zoomTo(CST.GAME.ZOOM.TOWER_DEFENSE, 0.0);
        this.cameras.main.centerOn(this.layer1.x + this.layer1.width * 0.5, this.layer1.y + this.layer1.height * 0.5);
    }

    private createPhysics(): void
    {

    }

    private initUI(): void
    {
        this.sceneUI = this.scene.get<SceneTowerDefenseUI>(CST.SCENES.TOWER_DEFENSE_UI);

        this.sceneUI.events.removeAllListeners("requestRestart");
        this.sceneUI.events.removeAllListeners("wellyBoostSelected");

        this.sceneUI.events.on("requestRestart", () => { this.scene.restart(); }, this);
        this.sceneUI.events.on("wellyBoostSelected", this.onWellyBoostSelected, this);
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
        this.addPlayerGold(monster.getGold());
    }

    private onMonsterReachEndPoint(monster: JunkMonster): void
    {
        this.removePlayerHealth(monster.getDamage());
        this.waveManager.removeMonster(monster);
    }

    private addPlayerGold(gold: number): void
    {
        this.setPlayerGold(this.gold + gold);
    }

    private removePlayerGold(cost: number): void
    {
        this.setPlayerGold(this.gold - cost);
    }

    private setPlayerGold(gold: number): void
    {
        this.gold = gold;
        this.sceneUI.onPlayerGoldChanged(this.gold);
    }

    private addPlayerHealth(health: number): void
    {
        this.setPlayerHealth(this.playerHealth + health);
    }

    private removePlayerHealth(damage: number): void
    {
        this.setPlayerHealth(this.playerHealth - damage);
    }

    private setPlayerHealth(health: number, maxHealth?: number): void
    {
        if ((maxHealth != undefined) && (maxHealth > 0))
        {
            this.playerMaxHealth = maxHealth;
        }
        
        this.playerHealth = Phaser.Math.Clamp(health, 0, this.playerMaxHealth);
        this.sceneUI.onPlayerHealthChanged(this.playerHealth, this.playerMaxHealth);
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
            this.removePlayerGold(50);
        }
    }

    private onWaveStarted(currentWave: number): void
    {
        this.sceneUI.onWaveStarted(currentWave);
    }

    private onWaveCompleted(currentWave: number): void
    {
        this.sceneUI.onWaveCompleted(currentWave);
    }

    private onWaveTimerStarted(): void
    {
    }

    private onWaveTimerTick(remainDuration: number, totalDuration: number): void
    {
        for (const waveWidget of this.waveCountdownWidgets)
        {
            waveWidget.onCountdownTick(remainDuration, totalDuration);
        }
    }

    private onWaveCountdownWidgetClicked(waveWidget: WaveCountdownWidget): void
    {
        this.waveManager.startNextWave();

        const bonusGold = 100;
        this.addPlayerGold(bonusGold);

        const goldText = this.add.text(waveWidget.x, waveWidget.y - 24, `+${bonusGold}`, { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.ORANGE, stroke: "#000000", strokeThickness: 3, fontSize: "21px" });
        goldText.setOrigin(0.5, 1);

        this.tweens.add({
            targets: goldText,
            duration: 150,
            y: goldText.y - 10,
            onComplete: () => {
                this.tweens.add({
                    targets: goldText,
                    duration: 800,
                    y: goldText.y + 30,
                    alpha: 0,
                    onComplete: () => { goldText.destroy(); }
                });
            }
        });
    }

    protected showWellyBoostSelection(): void
    {
        this.scene.pause();
        this.sceneUI.showWellyBoostSelection();
    }

    protected onWellyBoostSelected(): void
    {
        this.sceneUI.hideWellyBoostSelection();
        this.sceneUI.scene.resume(CST.SCENES.TOWER_DEFENSE);
    }
}