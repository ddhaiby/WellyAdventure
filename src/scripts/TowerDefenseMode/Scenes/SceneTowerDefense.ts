import { CST } from "../../Common/CST";
import { Welly_Scene, SceneData, SpeedMode } from "../../Common/Scenes/WELLY_Scene";
import { SceneTowerDefenseUI } from "./SceneTowerDefenseUI";
import { WaveSpawner } from "../WaveSystem/WaveSpawner";
import { MoveToPoint } from "../../Common/PathFinding/MoveToEntity";
import { Npc } from "../../Common/Characters/Npcs/Npc";
import { Turret, TurretSpawnData } from "../Characters/Npcs/Turrets/Turret";
import { JunkMonster } from "../Characters/Npcs/JunkMonster";
import { WaveManager } from "../WaveSystem/WaveManager";
import { TurretPopup } from "../Characters/Npcs/Turrets/TurretPopup";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { WaveCountdownWidget } from "../HUD/WaveCountdownWidget";
import { WellyBoostManager } from "../WellyBoost/WellyBoostManager";
import { TurretData } from "../Turrets/TurretData";
import { TurretPreviewWidget } from "../HUD/TurretPreviewWidget";
import { GameAnalytics } from "../Analytics/GameAnalytics";

export class SceneTowerDefense extends Welly_Scene
{
    private sceneUI: SceneTowerDefenseUI;

    private boostManager: WellyBoostManager;

    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;
    protected layer1: Phaser.Tilemaps.TilemapLayer;

    // Waves
    private spawners: WaveSpawner[];
    private waveManager: WaveManager;

    private turrets: Phaser.Physics.Arcade.StaticGroup;

    private turretPopup: TurretPopup;

    /** Whether the game is over or still running */
    private isGameOver: boolean = false;

    /** The coins to use to build turrets */
    private coin: number = 0;

    /** The health of the player. The game is over when they reach 0 */
    private playerHealth: number = 0;

    /** The max health of the player. */
    private playerMaxHealth: number = 0;

    /** Shows when the next wave should start */
    private waveCountdownWidgets: WaveCountdownWidget[];

    private speedMode: SpeedMode = SpeedMode.SLOW;
    
    private lastSpeedMode: SpeedMode = SpeedMode.SLOW;

    private turretsData: TurretData[];

    /** Index from turretsData for the preview */
    private turretPrewiewIndex: number;

    /** A preview of the turret that the player wants to spawn in the game */
    private turretPreviewWidget: TurretPreviewWidget;

    /** Indicates where the turret will be spawned. Used with turretPreview */
    private turretSpawnAreaPreview: Phaser.GameObjects.Graphics;

    private spawnedTurrets: Map<string /** turretId */, number /** turretCount */>;

    constructor()
    {
        super({key: CST.SCENES.TOWER_DEFENSE});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: SceneData): void
    {
        GameAnalytics.resetGameplay();
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
        const keys = this.input.keyboard?.addKeys({
            escape: Phaser.Input.Keyboard.KeyCodes.O
        }, false);
        // @ts-ignore
        keys.escape.on('down', () => { this.setGameOver(true); }, this);




        super.create();

        this.turretsData = this.cache.json.get("turretsData");

        this.turrets = this.physics.add.staticGroup();
        this.turretPreviewWidget = new TurretPreviewWidget(this, 0, 0).setVisible(false).setDepth(9999);
        this.spawnedTurrets = new Map<string, number>();

        for (const turretData of this.turretsData)
        {
            this.spawnedTurrets.set(turretData.id, 0);
        }

        this.createMap();
        this.createWaveSpawner();
        this.createCamera();
        this.createPhysics();
        this.initUI();
        this.setSpeedMode(SpeedMode.SLOW);

        this.boostManager = new WellyBoostManager(this);

        this.startGame();
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
                    moveToPointId = CST.INDEX_INVALID;
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
        this.sceneUI.events.removeAllListeners("requestUpdateGameSpeed");
        this.sceneUI.events.removeAllListeners("startDragTurret");
        this.sceneUI.events.removeAllListeners("dragTurret");
        this.sceneUI.events.removeAllListeners("endDragTurret");
        this.sceneUI.events.removeAllListeners("pauseMenuToggled");

        this.sceneUI.events.on("requestRestart", () => { this.onRestartRequested(); }, this);
        this.sceneUI.events.on("wellyBoostSelected", this.onWellyBoostSelected, this);
        this.sceneUI.events.on("requestUpdateGameSpeed", this.onUpdateGameSpeedRequested, this);

        this.sceneUI.events.on("startDragTurret", this.onStartDragTurret, this);
        this.sceneUI.events.on("dragTurret", this.onDragTurret, this);
        this.sceneUI.events.on("endDragTurret", this.onEnDragTurret, this);

        this.sceneUI.events.on("pauseMenuToggled", this.onPauseMenuToggled, this);
    }

    protected onRestartRequested(): void
    {
        this.sceneUI.scene.restart();
        this.scene.restart();
    }

    private onPauseMenuToggled(isPauseMenuVisible: boolean): void
    {
        if (isPauseMenuVisible)
        {
            this.scene.pause();
        }
        else
        {
            this.scene.resume();
        }
    }

    private setSpeedMode(inSpeedMode: SpeedMode): void
    {
        this.lastSpeedMode = this.speedMode;
        this.speedMode = inSpeedMode;
        this.sceneUI.onSpeedModeChanged(inSpeedMode);

        switch (this.speedMode)
        {
            case SpeedMode.SLOW:
                this.time.timeScale = 1;
                this.anims.globalTimeScale = 1;
                break;
            case SpeedMode.NORMAL:
                this.time.timeScale = 2;
                this.anims.globalTimeScale = 1;
                break;
            case SpeedMode.FAST:
                this.time.timeScale = 4;
                this.anims.globalTimeScale = 1;
                break;
            default:
                console.error("SceneTowerDefense::updateSpeedMode - Invalid speed mode");
                break;
        }

        this.physics.world.timeScale = 1 / this.time.timeScale;
    }

    private startGame(): void
    {
        this.setGameOver(false);
        this.setPlayerCoin(100);
        this.setPlayerHealth(100, 100);
        this.onWaveStarted(0);
        this.waveManager.start();

        // Wait a few milliseconds to let the camera update correctly
        this.time.delayedCall(100, () => { this.showWellyBoostSelection() }, undefined, this);
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(time: number, delta: number): void
    {
        super.update(time, delta);

        GameAnalytics.instance.update(time, delta);

        for (const spawner of this.spawners)
        {
            (spawner.getMonsters().getChildren() as Npc[]).forEach((npc: Npc) => { npc.update(); }, this);
        }
        (this.turrets.getChildren() as Turret[]).forEach((turret: Turret) => { turret.update(); }, this);
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
        GameAnalytics.instance.onMonsterDie(monster.name, monster.texture.key);
        this.addPlayerCoin(monster.getCoin());
    }

    private onMonsterReachEndPoint(monster: JunkMonster): void
    {
        this.removePlayerHealth(monster.getDamage());
        this.waveManager.removeMonster(monster);
        this.cameras.main.shake(80, 0.003);
    }

    private addPlayerCoin(coin: number): void
    {
        this.setPlayerCoin(this.coin + coin);
    }

    private removePlayerCoin(cost: number): void
    {
        this.setPlayerCoin(this.coin - cost);
    }

    private setPlayerCoin(coin: number): void
    {
        this.coin = coin;
        this.sceneUI.onPlayerCoinChanged(this.coin);
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
        
        if (this.playerHealth != health)
        {
            this.playerHealth = Phaser.Math.Clamp(health, 0, this.playerMaxHealth);
            this.sceneUI.onPlayerHealthChanged(this.playerHealth, this.playerMaxHealth);

            if (this.playerHealth <= 0)
            {
                this.setGameOver(true);
            }
        }
    }

    private onTurretClicked(turret: Turret): void
    {
        this.sceneUI.onTurretClicked(turret);

        const outlinePlugin = this.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
        outlinePlugin.remove(turret, "hoverTurret");
        outlinePlugin.add(turret, { thickness: 2, outlineColor: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.LIGHT_BLUE) });

        const fnOnTurretUpgrade = () => { this.sceneUI.updateTurretDataWidget(turret); };
        turret.on("upgrade", fnOnTurretUpgrade, this);
        turret.showRangeIndicator();

        this.turretPopup = new TurretPopup(turret, turret.x, turret.y);
        this.turretPopup.on("requestUpgrade", () => { this.tryUpgradeTurret(turret); }, this);
        this.turretPopup.once("destroyed", () => {
            this.sceneUI.hideTurretDataWidget();
            turret.hideRangeIndicator();
            turret.off("upgrade", fnOnTurretUpgrade, this);
            outlinePlugin.remove(turret);
        }, this); 

        this.tweens.add({ targets: turret, scale: 1.08, yoyo: true, repeat: 0, duration: 100 });
    }

    private onTurretHoverStarted(turret: Turret): void
    {
        const outlinePlugin = this.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
        outlinePlugin.add(turret, { thickness: 2, outlineColor: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE), name: "hoverTurret" });
    }

    private onTurretHoverEnded(turret: Turret): void
    {
        const outlinePlugin = this.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
        outlinePlugin.remove(turret, "hoverTurret");
    }

    private tryUpgradeTurret(turret: Turret): void
    {
        const upgradePrice = turret.getUpgradePrice();
        if (turret.canUpgrade() && (this.coin >= upgradePrice))
        {
            turret.upgrade();
            this.removePlayerCoin(upgradePrice);
        }
    }

    private onWaveStarted(currentWave: number): void
    {
        this.sceneUI.onWaveStarted(currentWave);
    }

    private onWaveCompleted(currentWave: number): void
    {
        GameAnalytics.instance.onWaveCleared();
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

        const bonusCoin = 100;
        this.addPlayerCoin(bonusCoin);

        const coinText = this.add.text(waveWidget.x, waveWidget.y - 24, `+${bonusCoin}`, { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.ORANGE, stroke: "#000000", strokeThickness: 3, fontSize: "21px" });
        coinText.setOrigin(0.5, 1);

        this.tweens.add({
            targets: coinText,
            duration: 150,
            y: coinText.y - 10,
            onComplete: () => {
                this.tweens.add({
                    targets: coinText,
                    duration: 800,
                    y: coinText.y + 30,
                    alpha: 0,
                    onComplete: () => { coinText.destroy(); }
                });
            }
        });
    }

    protected showWellyBoostSelection(): void
    {
        const boostDatArray = this.boostManager.generateRandomBoosts(3);

        this.scene.pause();
        this.sceneUI.showWellyBoostSelection(boostDatArray);
    }

    protected onWellyBoostSelected(): void
    {
        this.sceneUI.hideWellyBoostSelection();
        this.sceneUI.scene.resume(CST.SCENES.TOWER_DEFENSE);
    }

    protected onUpdateGameSpeedRequested(): void
    {
        switch (this.speedMode)
        {
            case SpeedMode.SLOW: this.setSpeedMode(SpeedMode.NORMAL); break;
            case SpeedMode.NORMAL: this.setSpeedMode(SpeedMode.FAST); break;
            case SpeedMode.FAST: this.setSpeedMode(SpeedMode.SLOW); break;
            default: console.error("SceneTowerDefense::onUpdateGameSpeedRequested - Invalid speed mode"); break;
        }
    }

    protected onStartDragTurret(turretIndex: number): void
    {
        if ((turretIndex >= 0) && (turretIndex < this.turretsData.length))
        {
            const turretData = this.turretsData[turretIndex];
            const turretCount = this.spawnedTurrets.get(turretData.id);

            if ((turretCount != undefined) && (turretCount < this.turretsData[turretIndex].maxInstances))
            {
                if (this.turretPopup)
                {
                    this.turretPopup.destroy();
                    this.turretPopup = undefined;
                }

                this.initTurretPreview(turretIndex);
            }
            else
            {
                this.turretPrewiewIndex = CST.INDEX_INVALID;
            }
        }
        else
        {
            this.turretPrewiewIndex = CST.INDEX_INVALID;
        }
    }

    protected initTurretPreview(turretIndex: number)
    {
        this.turretPrewiewIndex = turretIndex;

        const activePointer = this.input.activePointer;
        activePointer.updateWorldPoint(this.cameras.main);
        
        this.turretPreviewWidget.setPosition(activePointer.worldX, activePointer.worldY);
        this.turretPreviewWidget.setTurretData(this.turretsData[this.turretPrewiewIndex]);
        this.turretPreviewWidget.setValid(true);
        this.turretPreviewWidget.setVisible(true);

        this.turretSpawnAreaPreview = this.add.graphics();
    }

    protected onDragTurret(): void
    {
        if (this.turretPrewiewIndex != CST.INDEX_INVALID)
        {
            const activePointer = this.input.activePointer;
            activePointer.updateWorldPoint(this.cameras.main);
            const worldX = activePointer.worldX;
            const worldY = activePointer.worldY;

            this.turretPreviewWidget.setPosition(worldX, worldY);

            const tile = this.layer1.getTileAtWorldXY(worldX, worldY);
            const isTurretPositionValid = tile.properties.towerField;
            const color = isTurretPositionValid ? WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.LIGHT_BLUE) : WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.RED);

            this.turretPreviewWidget.setValid(isTurretPositionValid);

            this.turretSpawnAreaPreview.clear();
            this.turretSpawnAreaPreview.fillStyle(color);
            this.turretSpawnAreaPreview.fillRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
        }
    }

    protected onEnDragTurret(): void
    {
        if (this.turretPrewiewIndex != CST.INDEX_INVALID)
        {
            this.input.activePointer.updateWorldPoint(this.cameras.main);
            const worldX = this.input.activePointer.worldX;
            const worldY = this.input.activePointer.worldY;

            const tile = this.layer1.getTileAtWorldXY(worldX, worldY);
            if (tile.properties.towerField)
            {
                const turretLevel = 0; 
                const turretPreviewData = this.turretsData[this.turretPrewiewIndex];
                const price = turretPreviewData.gameStatsPerLevel[turretLevel].price
                this.trySpawnTurret(tile.pixelX + tile.width * 0.5, tile.pixelY + tile.height * 0.5, turretPreviewData, turretLevel, price);
            }

            this.turretPreviewWidget.setVisible(false);
            this.turretSpawnAreaPreview.destroy();

            this.turretPrewiewIndex = CST.INDEX_INVALID;
        }
        
    }

    private trySpawnTurret(x: number, y: number, turretData: TurretData, level: number = 0, price: number = 0)
    {
        if (this.canSpawnTurret(turretData, price))
        {
            this.spawnTurret(x, y, turretData, level);
            this.removePlayerCoin(price);
        }
    }

    private canSpawnTurret(turretData: TurretData, price: number): boolean
    {
        const turretCount = this.spawnedTurrets.get(turretData.id) ?? 0;
        return (this.coin >= price) && (turretCount < turretData.maxInstances)
    }

    private spawnTurret(x: number, y: number, turretData: TurretData, level: number = 0): void
    {
        const turret = new Turret(this, 0, 0);
        turret.setPosition(x, y - turret.height * 0.5);

        this.turrets.add(turret);

        const spawnData: TurretSpawnData = {
            name: turretData.turretName,
            level: level,
            turretData: turretData,
            characterTexture: "",
            walkSpeed: 0
        };
        turret.init(spawnData);

        let turretCount = this.spawnedTurrets.get(turretData.id) ?? 0;
        ++turretCount;
        this.spawnedTurrets.set(turretData.id, turretCount);

        for (const spawner of this.spawners)
        {
            // @ts-ignore
            this.physics.add.overlap(this.turrets, spawner.getMonsters(), this.onMonsterInRange, this.isMonsterTargetable, this);
        }

        turret.setInteractive();
        turret.on(Phaser.Input.Events.POINTER_UP, () => { this.onTurretClicked(turret); }, this);
        turret.on(Phaser.Input.Events.POINTER_OVER, () => { this.onTurretHoverStarted(turret); }, this);
        turret.on(Phaser.Input.Events.POINTER_OUT, () => { this.onTurretHoverEnded(turret); }, this);

        this.sceneUI.onTurretSpawned(turretData.id, turretData.maxInstances - turretCount);
    }

    private setGameOver(isGameOver: boolean): void
    {
        if (this.isGameOver != isGameOver)
        {
            this.isGameOver = isGameOver;

            if (this.isGameOver)
            {
                (this.turrets.getChildren() as Turret[]).forEach((turret: Turret) => {
                    turret.disableBody(false, false);
                }, this);
    
                for (const widget of this.waveCountdownWidgets)
                {
                    widget.setVisible(false);
                }
    
                this.waveManager.clear();
    
                this.sceneUI.onGameOver(GameAnalytics.instance.getGameStatistics());
            }   
        }
    }
}