import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene, WELLY_SceneData, WELLY_SpeedMode } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_SceneTowerDefenseUI } from "./WELLY_SceneTowerDefenseUI";
import { WELLY_WaveSpawner } from "../WaveSystem/WELLY_WaveSpawner";
import { WELLY_MoveToPoint } from "../../Common/PathFinding/WELLY_MoveToEntity";
import { WELLY_Turret, WELLY_TurretSpawnData } from "../Characters/Npcs/Turrets/WELLY_Turret";
import { WELLY_JunkMonster } from "../Characters/Npcs/WELLY_JunkMonster";
import { WELLY_WaveManager } from "../WaveSystem/WELLY_WaveManager";
import { WELLY_TurretPopup } from "../Characters/Npcs/Turrets/WELLY_TurretPopup";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import { WELLY_WaveCountdownWidget } from "../HUD/WELLY_WaveCountdownWidget";
import { WELLY_WellyBoostData, WELLY_WellyBoostManager } from "../WellyBoost/WELLY_WellyBoostManager";
import { WELLY_TurretData } from "../Turrets/WELLY_TurretData";
import { WELLY_TurretPreviewWidget } from "../HUD/WELLY_TurretPreviewWidget";
import { WELLY_GameAnalytics } from "../Analytics/WELLY_GameAnalytics";

export class WELLY_SceneTowerDefense extends WELLY_BaseScene
{
    private sceneUI: WELLY_SceneTowerDefenseUI;

    private boostManager: WELLY_WellyBoostManager;

    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;
    protected layer1: Phaser.Tilemaps.TilemapLayer;

    // Waves
    private waveManager: WELLY_WaveManager;

    private turrets: Phaser.Physics.Arcade.StaticGroup;

    private turretPopup: WELLY_TurretPopup | undefined;

    /** Whether the game is over or still running */
    private isGameOver: boolean = false;

    /** The coins to use to build turrets */
    private coin: number = 0;

    /** The health of the player. The game is over when they reach 0 */
    private playerHealth: number = 0;

    /** The max health of the player. */
    private playerMaxHealth: number = 0;

    /** Shows when the next wave should start */
    private waveCountdownWidgets: WELLY_WaveCountdownWidget[];

    private speedMode: WELLY_SpeedMode = WELLY_SpeedMode.SLOW;
    
    private turretsData: WELLY_TurretData[];

    /** Index from turretsData for the preview */
    private turretPrewiewIndex: number;

    /** A preview of the turret that the player wants to spawn in the game */
    private turretPreviewWidget: WELLY_TurretPreviewWidget;

    /** Indicates where the turret will be spawned. Used with turretPreview */
    private turretSpawnAreaPreview: Phaser.GameObjects.Graphics;

    /** The number of turrets spawned in game per turret type */
    private spawnedTurrets: Map<string /** turretId */, number /** turretCount */>;

    /** The bonus damage for each turret */
    private bonusDamagePerTurret: Map<string /** turretId */, number /** turretCount */>;
    
    /** The bonus attack speed for each turret */
    private bonusAttackSpeedPerTurret: Map<string /** turretId */, number /** turretCount */>;

    /** The bonus range for each turret */
    private bonusRangePerTurret: Map<string /** turretId */, number /** turretCount */>;

    /** The bonus range for each turret */
    private bonusGoldFromDeathPerTurret: Map<string /** turretId */, number /** turretCount */>;

    constructor()
    {
        super({key: WELLY_CST.SCENES.TOWER_DEFENSE});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: WELLY_SceneData): void
    {
        WELLY_GameAnalytics.resetGameplay();
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
            cheat_boost: Phaser.Input.Keyboard.KeyCodes.O,
            cheat_gameOver: Phaser.Input.Keyboard.KeyCodes.P
        }, false);

        if (keys)
        {
            // @ts-ignore
            keys.cheat_boost.on('down', () => { this.showWellyBoostSelection(); }, this);

            // @ts-ignore
            keys.cheat_gameOver.on('down', () => { this.setGameOver(true); }, this);
        }
        


        super.create();

        this.turretsData = this.cache.json.get("turretsData");
        
        this.turrets = this.physics.add.staticGroup();
        this.turretPreviewWidget = new WELLY_TurretPreviewWidget(this, 0, 0).setVisible(false).setDepth(9999);
        this.spawnedTurrets = new Map<string, number>();
        this.bonusDamagePerTurret = new Map<string, number>();
        this.bonusAttackSpeedPerTurret = new Map<string, number>();
        this.bonusRangePerTurret = new Map<string, number>();
        this.bonusGoldFromDeathPerTurret = new Map<string, number>();

        this.bonusDamagePerTurret.set("ALL", 0);
        this.bonusAttackSpeedPerTurret.set("ALL", 0);
        this.bonusRangePerTurret.set("ALL", 0);
        this.bonusGoldFromDeathPerTurret.set("ALL", 0);

        for (const turretData of this.turretsData)
        {
            this.spawnedTurrets.set(turretData.id, 0);
            this.bonusDamagePerTurret.set(turretData.id, 0);
            this.bonusAttackSpeedPerTurret.set(turretData.id, 0);
            this.bonusRangePerTurret.set(turretData.id, 0);
            this.bonusGoldFromDeathPerTurret.set(turretData.id, 0);
        }

        this.createMap();
        this.createWaveSpawner();
        this.createCamera();
        this.createPhysics();
        this.initUI();
        this.setSpeedMode(WELLY_SpeedMode.SLOW);

        this.boostManager = new WELLY_WellyBoostManager(this);

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
        // @ts-ignore
        const spawners = this.currentMap.createFromObjects("Wave", {name: "WaveSpawner", classType: WELLY_WaveSpawner}) as WELLY_WaveSpawner[];

        for (const monsterSpawner of spawners)
        {
            let moveToPointId = monsterSpawner.getMoveToPointId();
            let positions = [] as Phaser.Math.Vector2[];

            while (moveToPointId >= 0)
            {
                // @ts-ignore
                const moveToEntities = this.currentMap.createFromObjects("Wave", {id: moveToPointId, classType: WELLY_MoveToPoint}) as WELLY_MoveToPoint[];

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
                    moveToPointId = WELLY_CST.INDEX_INVALID;
                }
            }
            monsterSpawner.setPathFindingConfig({positions: positions, repeat: 0});
        }

        // @ts-ignore
        const waveCountdownSpawners = this.currentMap.createFromObjects("Wave", {name: "WaveCountdown", classType: Phaser.GameObjects.Image}) as Phaser.GameObjects.Image[];
        this.waveCountdownWidgets = [];
        
        for (const waveCountdownSpawner of waveCountdownSpawners)
        {
            const waveWidget = new WELLY_WaveCountdownWidget(this, waveCountdownSpawner.x, waveCountdownSpawner.y);
            this.waveCountdownWidgets.push(waveWidget);
            waveWidget.on(Phaser.Input.Events.POINTER_UP, () => { this.onWaveCountdownWidgetClicked(waveWidget); }, this);
            waveWidget.on(Phaser.Input.Events.POINTER_DOWN, () => { this.sound.play("buttonPressed", { volume: 0.15 }); }, this);
            waveCountdownSpawner.destroy();
        }

        this.waveManager = new WELLY_WaveManager(this, spawners);
        this.waveManager.onWaveStarted(this.onWaveStarted, this)
        this.waveManager.onWaveCompleted(this.onWaveCompleted, this);
        this.waveManager.onWaveTimerStarted(this.onWaveTimerStarted, this);
        this.waveManager.onWaveTimerTick(this.onWaveTimerTick, this);
        this.waveManager.on("MONSTER_MOVE_TO_END", this.onMonsterReachEndPoint, this);
        this.waveManager.on("MONSTER_DIED", this.onMonsterDie, this);

        this.physics.add.overlap(this.turrets, this.waveManager.getMonsters(), this.onMonsterInRange, this.isMonsterTargetable, this);
    }

    private createCamera(): void
    {
        this.cameras.main.zoomTo(WELLY_CST.GAME.ZOOM.TOWER_DEFENSE, 0.0);
        this.cameras.main.centerOn(this.layer1.x + this.layer1.width * 0.5, this.layer1.y + this.layer1.height * 0.5);
    }

    private createPhysics(): void
    {

    }

    private initUI(): void
    {
        this.sceneUI = this.scene.get(WELLY_CST.SCENES.TOWER_DEFENSE_UI) as WELLY_SceneTowerDefenseUI;

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

    private setSpeedMode(inSpeedMode: WELLY_SpeedMode): void
    {
        this.speedMode = inSpeedMode;
        this.sceneUI.onSpeedModeChanged(inSpeedMode);

        switch (this.speedMode)
        {
            case WELLY_SpeedMode.SLOW:
                this.time.timeScale = 1;
                this.tweens.timeScale = 1;
                this.anims.globalTimeScale = 1;
                break;
            case WELLY_SpeedMode.NORMAL:
                this.time.timeScale = 2;
                this.tweens.timeScale = 2;
                this.anims.globalTimeScale = 1;
                break;
            case WELLY_SpeedMode.FAST:
                this.time.timeScale = 4;
                this.tweens.timeScale = 4;
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
        this.initPlayerHealth();
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

        WELLY_GameAnalytics.instance.update(time, delta);

        const monsters = this.waveManager.getMonsters().getChildren() as WELLY_JunkMonster[];
        monsters.forEach((monster: WELLY_JunkMonster) => { monster.update(); }, this);

        const turrets = (this.turrets.getChildren() as WELLY_Turret[]);
        turrets.forEach((turret: WELLY_Turret) => { turret.update(); }, this);
    }

    private isMonsterTargetable(turret: WELLY_Turret, monster: WELLY_JunkMonster): boolean
    {
        // Check if the monster is in the disk inside the square body of the turret
        const posBodyTurret = { x: turret.body.x + turret.body.width * 0.5, y: turret.body.y + turret.body.height * 0.5 };
        const posBodyMonster = { x: monster.body.x + monster.body.width * 0.5, y: monster.body.y + monster.body.height * 0.5 };
        const squareDistance = Phaser.Math.Distance.BetweenPointsSquared(posBodyTurret, posBodyMonster);
        const squareRange = turret.getCurrentRange() * turret.getCurrentRange();
        return (squareDistance <= squareRange);
    }

    private onMonsterInRange(turret: WELLY_Turret, monster: WELLY_JunkMonster): void
    {
        turret.onMonsterInRange(monster);
    }

    private onMonsterDie(monster: WELLY_JunkMonster, sourceTurret?: WELLY_Turret): void
    {
        if (!this.isGameOver)
        {
            WELLY_GameAnalytics.instance.onMonsterDie(monster.name, monster.texture.key);

            let monsterCoin = monster.getCoin();

            if (sourceTurret)
            {
                const turretId = sourceTurret.getTurretId();
                const bonusCoinForTurret = this.bonusGoldFromDeathPerTurret.has(turretId) ? this.bonusGoldFromDeathPerTurret.get(turretId) : 0;
                const bonusCoinAllTurret = this.bonusGoldFromDeathPerTurret.has("ALL") ? this.bonusGoldFromDeathPerTurret.get("ALL") : 0;
                monsterCoin = monsterCoin + bonusCoinForTurret + bonusCoinAllTurret;
            }
            
            this.addPlayerCoin(monsterCoin);

            // TODO Make a function so it could be reuse anywhere. There is a similar code for the countdown widget
            const coinText = this.add.text(monster.x, monster.y - monster.displayHeight * 0.5 - 10, `+${monsterCoin}`, { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.ORANGE, stroke: "#000000", strokeThickness: 3, fontSize: "21px" });

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
    }

    private onMonsterReachEndPoint(monster: WELLY_JunkMonster): void
    {
        this.cameras.main.shake(80, 0.003);
        this.removePlayerHealth(monster.getCurrentDamage());
        monster.die();
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

    private initPlayerHealth(): void
    {
        this.setPlayerHealth(100, 100);
        this.sceneUI.onPlayerHealthChanged(this.playerHealth, this.playerMaxHealth);
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

    private onTurretClicked(turret: WELLY_Turret): void
    {
        this.sceneUI.onTurretClicked(turret);
        this.showTurretPopup(turret);
    }

    private showTurretPopup(turret: WELLY_Turret): void
    {
        this.rexOutlinePipelinePlugin.remove(turret, "hoverTurret");
        this.rexOutlinePipelinePlugin.add(turret, { thickness: 2, outlineColor: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE), name: "turretShowPopup" });

        turret.showRangeIndicator();

        this.turretPopup = new WELLY_TurretPopup(turret, turret.x, turret.y);
        this.turretPopup.on("requestUpgrade", () => { this.tryUpgradeTurret(turret); }, this);
        this.turretPopup.once("destroyed", () => { this.hideTurretPopup(); }, this); 

        this.tweens.add({ targets: turret, scale: 1.08, yoyo: true, repeat: 0, duration: 100 });
    }

    private hideTurretPopup(): void
    {
        if (this.turretPopup)
        {
            const turret = this.turretPopup.getTurret();

            this.sceneUI.hideTurretDataWidget();
            turret.hideRangeIndicator();
            this.rexOutlinePipelinePlugin.remove(turret, "turretShowPopup");

            this.turretPopup.destroy();
        }   
    }

    private onTurretHoverStarted(turret: WELLY_Turret): void
    {
        this.rexOutlinePipelinePlugin.add(turret, { thickness: 2, outlineColor: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE), name: "hoverTurret" });
    }

    private onTurretHoverEnded(turret: WELLY_Turret): void
    {
        this.rexOutlinePipelinePlugin.remove(turret, "hoverTurret");
    }

    public tryUpgradeTurret(turret: WELLY_Turret, hasPrice: boolean = true): void
    {
        const upgradePrice = hasPrice ? turret.getUpgradePrice() : 0;
        if (turret.canUpgrade() && (this.coin >= upgradePrice))
        {
            turret.upgrade();

            if (upgradePrice > 0)
            {
                this.removePlayerCoin(upgradePrice);
            }

            this.sceneUI.updateTurretDataWidget(turret);
        }
    }

    private onWaveStarted(currentWave: number): void
    {
        this.sceneUI.onWaveStarted(currentWave);
    }

    private onWaveCompleted(currentWave: number): void
    {
        WELLY_GameAnalytics.instance.onWaveCleared();
        this.sceneUI.onWaveCompleted(currentWave);

        if (this.waveManager.shouldGetBonusFromWave(currentWave))
        {
            this.showWellyBoostSelection();
        }
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

    private onWaveCountdownWidgetClicked(waveWidget: WELLY_WaveCountdownWidget): void
    {
        this.waveManager.startNextWave();

        const bonusCoin = 100;
        this.addPlayerCoin(bonusCoin);

        const coinText = this.add.text(waveWidget.x, waveWidget.y - 24, `+${bonusCoin}`, { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.ORANGE, stroke: "#000000", strokeThickness: 3, fontSize: "21px" });
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
        this.hideTurretPopup();

        const boostDatArray = this.boostManager.generateRandomBoosts(3);

        this.scene.pause();
        this.sceneUI.showWellyBoostSelection(boostDatArray);
    }

    protected onWellyBoostSelected(boostData: WELLY_WellyBoostData): void
    {
        this.boostManager.grantBoost(boostData);
        this.sceneUI.hideWellyBoostSelection();
        this.scene.resume();
    }

    protected onUpdateGameSpeedRequested(): void
    {
        switch (this.speedMode)
        {
            case WELLY_SpeedMode.SLOW: this.setSpeedMode(WELLY_SpeedMode.NORMAL); break;
            case WELLY_SpeedMode.NORMAL: this.setSpeedMode(WELLY_SpeedMode.FAST); break;
            case WELLY_SpeedMode.FAST: this.setSpeedMode(WELLY_SpeedMode.SLOW); break;
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
                this.onDragTurret();
            }
            else
            {
                this.turretPrewiewIndex = WELLY_CST.INDEX_INVALID;
            }
        }
        else
        {
            this.turretPrewiewIndex = WELLY_CST.INDEX_INVALID;
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
        if (this.turretPrewiewIndex != WELLY_CST.INDEX_INVALID)
        {
            const activePointer = this.input.activePointer;
            activePointer.updateWorldPoint(this.cameras.main);
            const worldX = activePointer.worldX;
            const worldY = activePointer.worldY;

            this.turretPreviewWidget.setPosition(worldX, worldY);

            const tile = this.layer1.getTileAtWorldXY(worldX, worldY);
            const isTurretPositionValid = tile && tile.properties.towerField;
            const color = isTurretPositionValid ? WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE) : WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.RED);

            this.turretPreviewWidget.setValid(isTurretPositionValid);

            this.turretSpawnAreaPreview.clear();

            if (tile)
            {
                this.turretSpawnAreaPreview.fillStyle(color);
                this.turretSpawnAreaPreview.fillRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
            }
        }
    }

    protected onEnDragTurret(): void
    {
        if (this.turretPrewiewIndex != WELLY_CST.INDEX_INVALID)
        {
            this.input.activePointer.updateWorldPoint(this.cameras.main);
            const worldX = this.input.activePointer.worldX;
            const worldY = this.input.activePointer.worldY;

            const tile = this.layer1.getTileAtWorldXY(worldX, worldY);
            if (tile && tile.properties.towerField)
            {
                const turretLevel = 0; 
                const turretPreviewData = this.turretsData[this.turretPrewiewIndex];
                const price = turretPreviewData.gameStatsPerLevel[turretLevel].price;
                this.trySpawnTurret(tile.pixelX + tile.width * 0.5, tile.pixelY + tile.height * 0.5, turretPreviewData, turretLevel, price);
            }

            this.turretPreviewWidget.setVisible(false);
            this.turretSpawnAreaPreview.destroy();

            this.turretPrewiewIndex = WELLY_CST.INDEX_INVALID;
        }
    }

    public getTurrets(): WELLY_Turret[]
    {
        return this.turrets.getChildren() as WELLY_Turret[];
    }
    
    public addBonusDamageTo(turretId: string, bonusDamage: number): void
    {
        if ((bonusDamage > 0) && this.bonusDamagePerTurret.has(turretId))
        {
            this.bonusDamagePerTurret.set(turretId, this.bonusDamagePerTurret.get(turretId) + bonusDamage);
            this.updateAllTurretBonusDamage();
        }
    }

    public addBonusAttackSpeedTo(turretId: string, bonusAttackSpeed: number): void
    {
        if ((bonusAttackSpeed > 0) && this.bonusAttackSpeedPerTurret.has(turretId))
        {
            this.bonusAttackSpeedPerTurret.set(turretId, this.bonusAttackSpeedPerTurret.get(turretId) + bonusAttackSpeed);
            this.updateAllTurretBonusAttackSpeed();
        }
    }

    public addBonusRangeTo(turretId: string, bonusRange: number): void
    {
        if ((bonusRange > 0) && this.bonusRangePerTurret.has(turretId))
        {
            this.bonusRangePerTurret.set(turretId, this.bonusRangePerTurret.get(turretId) + bonusRange);
            this.updateAllTurretBonusRange();
        }
    }

    public addBonusMoneyFromDeathTo(turretId: string, bonusMoney: number): void
    {
        if ((bonusMoney > 0) && this.bonusGoldFromDeathPerTurret.has(turretId))
        {
            this.bonusGoldFromDeathPerTurret.set(turretId, this.bonusGoldFromDeathPerTurret.get(turretId) + bonusMoney);
        }
    }

    private trySpawnTurret(x: number, y: number, turretData: WELLY_TurretData, level: number = 0, price: number = 0)
    {
        if (this.canSpawnTurret(turretData, price))
        {
            this.spawnTurret(x, y, turretData, level);
            this.removePlayerCoin(price);
        }
    }

    private canSpawnTurret(turretData: WELLY_TurretData, price: number): boolean
    {
        const turretCount = this.spawnedTurrets.get(turretData.id) ?? 0;
        return (this.coin >= price) && (turretCount < turretData.maxInstances)
    }

    private spawnTurret(x: number, y: number, turretData: WELLY_TurretData, level: number = 0): void
    {
        const turret = new WELLY_Turret(this, 0, 0);
        turret.setBonusDamage(this.bonusDamagePerTurret.get(turretData.id) + this.bonusDamagePerTurret.get("ALL"));
        turret.setBonusAttackSpeed(this.bonusAttackSpeedPerTurret.get(turretData.id) + this.bonusAttackSpeedPerTurret.get("ALL"));
        turret.setBonusRange(this.bonusRangePerTurret.get(turretData.id) + this.bonusRangePerTurret.get("ALL"));
        turret.setPosition(x, y - turret.height * 0.5);

        this.turrets.add(turret);

        const spawnData: WELLY_TurretSpawnData = {
            name: turretData.turretName,
            level: level,
            turretData: turretData,
            characterTexture: "",
            walkSpeed: 0,
        };
        turret.init(spawnData);

        let turretCount = this.spawnedTurrets.get(turretData.id) ?? 0;
        ++turretCount;
        this.spawnedTurrets.set(turretData.id, turretCount);

        turret.setInteractive();
        turret.on(Phaser.Input.Events.POINTER_UP, () => { this.onTurretClicked(turret); }, this);
        turret.on(Phaser.Input.Events.POINTER_OVER, () => { this.onTurretHoverStarted(turret); }, this);
        turret.on(Phaser.Input.Events.POINTER_OUT, () => { this.onTurretHoverEnded(turret); }, this);

        this.sceneUI.onTurretSpawned(turretData.id, turretData.maxInstances - turretCount);
    }

    public updateAllTurretBonusDamage(): void
    {
        for (const turret of this.turrets.getChildren() as WELLY_Turret[])
        {
            const turretId = turret.getTurretId();
            if (this.bonusDamagePerTurret.has(turretId))
            {
                turret.setBonusDamage(this.bonusDamagePerTurret.get(turretId) + this.bonusDamagePerTurret.get("ALL"));
            }
        }
    }

    public updateAllTurretBonusAttackSpeed(): void
    {
        for (const turret of this.turrets.getChildren() as WELLY_Turret[])
        {
            const turretId = turret.getTurretId();
            if (this.bonusAttackSpeedPerTurret.has(turretId))
            {
                turret.setBonusAttackSpeed(this.bonusAttackSpeedPerTurret.get(turretId) + this.bonusAttackSpeedPerTurret.get("ALL"));
            }
        }
    }

    public updateAllTurretBonusRange(): void
    {
        for (const turret of this.turrets.getChildren() as WELLY_Turret[])
        {
            const turretId = turret.getTurretId();
            if (this.bonusRangePerTurret.has(turretId))
            {
                turret.setBonusRange(this.bonusRangePerTurret.get(turretId) + this.bonusRangePerTurret.get("ALL"));
            }
        }
    }

    private setGameOver(isGameOver: boolean): void
    {
        if (this.isGameOver != isGameOver)
        {
            this.isGameOver = isGameOver;

            if (this.isGameOver)
            {
                (this.turrets.getChildren() as WELLY_Turret[]).forEach((turret: WELLY_Turret) => {
                    turret.disableBody(false, false);
                }, this);

                for (const widget of this.waveCountdownWidgets)
                {
                    widget.setVisible(false);
                }

                this.waveManager.clear();

                this.sceneUI.onGameOver(WELLY_GameAnalytics.instance.getGameStatistics());
            }
        }
    }
}