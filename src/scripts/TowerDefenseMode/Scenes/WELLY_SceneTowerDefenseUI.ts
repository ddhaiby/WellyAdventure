import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { WELLY_BaseScene, WELLY_SceneData, WELLY_SpeedMode } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import { WELLY_GameStatistics } from "../Analytics/WELLY_GameAnalytics";
import { WELLY_BottomMenu } from "../HUD/WELLY_BottomMenu";
import { WELLY_EndRunWidget } from "../HUD/WELLY_EndRunWidget";
import { WELLY_PauseMenu } from "../HUD/WELLY_PauseMenu";
import { WELLY_ITurretData, WELLY_TurretDataWidget } from "../HUD/WELLY_TurretDataWidget";
import { WellyBoostSelection } from "../WellyBoost/WELLY_WellyBoostSelection";
import { WELLY_WellyBoostData } from "../WellyBoost/WELLY_WellyBoostManager";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";

declare type WELLY_UIKeys = 
{
    escape: Phaser.Input.Keyboard.Key;
}

declare type WELLY_SceneTowerDefenseUIData = WELLY_SceneData & {
    shouldShowWelcomePage?: boolean
};

export class WELLY_SceneTowerDefenseUI extends WELLY_BaseScene
{
    /** Pause menu */
    protected pauseMenu: WELLY_PauseMenu;

     /** Bottom menu */
    protected bottomMenu: WELLY_BottomMenu;

    /** Display the current coins */
    protected coinText: Phaser.GameObjects.Text;

    protected coinBackground: RoundRectangle;

    /** Display the current wave */
    protected waveText: Phaser.GameObjects.Text;

    /** Display the data of a given turret */
    protected turretDataWidget: WELLY_TurretDataWidget;
    
    /** Display the health of the player with a bar */
    protected playerHealthWidget: Phaser.GameObjects.Image;

    /** Display the current health and max health of the player */
    protected healthText: Phaser.GameObjects.Text;

    protected wellyBoostSelection: WellyBoostSelection;

    protected endRunWidget: WELLY_EndRunWidget;

    protected inGameHUD: Phaser.GameObjects.Container;

    protected shouldShowWelcomePage: boolean = false;

    protected welcomePage: Phaser.GameObjects.Container | undefined;

    constructor()
    {
        super({key: WELLY_CST.SCENES.TOWER_DEFENSE_UI});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: WELLY_SceneTowerDefenseUIData): void
    {
        this.shouldShowWelcomePage = data && data.shouldShowWelcomePage;
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

        this.createShortcuts();

        this.inGameHUD = this.add.container();

        this.createHealthWidget();
        this.createCoinWidget();
        
        const waveIcon = this.add.image(this.playerHealthWidget.x + 4, this.coinText.y + this.coinText.height + 6, "waveIcon").setOrigin(0, 0).setScale(0.75);
        this.inGameHUD.add(waveIcon);

        this.waveText = this.add.text(waveIcon.x + waveIcon.displayWidth + 8, waveIcon.y + 3, "", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.BLUE, stroke: WELLY_CST.STYLE.COLOR.BLACK, strokeThickness: 3, fontSize: "24px" });
        this.inGameHUD.add(this.waveText);

        const menuButton = new WELLY_TextButton(this, WELLY_CST.GAME.WIDTH - 40, 44, "", {
            textureNormal: "menuButtonNormal",
            texturePressed: "menuButtonPressed",
        });
        menuButton.onClicked(() => { this.togglePauseMenu(); } , this);
        this.inGameHUD.add(menuButton);

        this.createBottomMenu();

        this.turretDataWidget = new WELLY_TurretDataWidget(this, 0, 0);
        this.turretDataWidget.setPosition(this.scale.displaySize.width - this.turretDataWidget.displayWidth, this.scale.displaySize.height - this.turretDataWidget.displayHeight);
        this.turretDataWidget.setVisible(false);
        this.inGameHUD.add(this.turretDataWidget);

        this.wellyBoostSelection = new WellyBoostSelection(this, this.scale.displaySize.width * 0.5, this.scale.displaySize.height * 0.5);
        this.wellyBoostSelection.setVisible(false);
        this.wellyBoostSelection.on("wellyBoostSelected", this.onWellyBoostSelected, this);
        this.inGameHUD.add(this.wellyBoostSelection);

        this.pauseMenu = new WELLY_PauseMenu(this, 0, 0);
        this.pauseMenu.setVisible(false);
        this.pauseMenu.on("requestResume", this.togglePauseMenu, this);
        this.pauseMenu.on("requestRestart", this.requestRestart, this);
        this.pauseMenu.on("requestMainMenu", this.requestMainMenu, this);
        
        this.endRunWidget = new WELLY_EndRunWidget(this, 0, 0);
        this.endRunWidget.setVisible(false);
        this.endRunWidget.on("requestRestart", this.requestRestart, this);
        this.endRunWidget.on("requestMainMenu", this.requestMainMenu, this);

        if (this.shouldShowWelcomePage)
        {
            this.showWelcomePage();
        }
    }

    protected createShortcuts(): void
    {
        const keys = this.input.keyboard?.addKeys({
            escape: Phaser.Input.Keyboard.KeyCodes.ESC
        }, false) as WELLY_UIKeys;

        if (keys)
        {
            keys.escape.on('down', () => { this.togglePauseMenu(); }, this);
        }
    }

    protected createHealthWidget(): void
    {
        this.playerHealthWidget = this.add.image(12, 12, "healthWidget").setOrigin(0);
        this.inGameHUD.add(this.playerHealthWidget);

        this.healthText = this.add.text(this.playerHealthWidget.x +  this.playerHealthWidget.width - 7, this.playerHealthWidget.y + this.playerHealthWidget.height * 0.5 + 2, "", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.WHITE, fontSize: "33px" });
        this.healthText.setOrigin(1, 0.5);
        
        this.inGameHUD.add(this.healthText);
    }

    protected createCoinWidget(): void
    {
        const backgroundHeight = 36;
        this.coinBackground = this.rexUI.add.roundRectangle(this.playerHealthWidget.x + 2, this.playerHealthWidget.y + this.playerHealthWidget.height + backgroundHeight * 0.5 + 14, 140, backgroundHeight, backgroundHeight * 0.5, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.YELLOW), 1);
        this.coinBackground.setOrigin(0, 0.5);
        this.inGameHUD.add(this.coinBackground);

        const coinIcon = this.add.image(this.playerHealthWidget.x + 2, this.coinBackground.y, "coinIcon").setOrigin(0, 0.5);
        this.inGameHUD.add(coinIcon);

        this.coinText = this.add.text(coinIcon.x + coinIcon.width + 8, this.coinBackground.y, "", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.WHITE, fontSize: "32px" });
        this.coinText.setOrigin(0, 0.5);
        this.inGameHUD.add(this.coinText);
    }

    protected createBottomMenu(): void
    {
        const menuWidth = this.scale.displaySize.width;
        const menuHeight = 120;
        this.bottomMenu = new WELLY_BottomMenu(this, this.scale.displaySize.width * 0.5, this.scale.displaySize.height - menuHeight * 0.5, menuWidth, menuHeight); // Display the bottomMenu below the game

        this.bottomMenu.on("audioButtonClicked", () => {}, this);
        this.bottomMenu.on("gameSpeedButtonClicked", this.onGameSpeedButtonClicked, this);
        this.bottomMenu.on("powerRequested", this.onPowerRequested, this);

        this.bottomMenu.on("startDragPower", this.onStartDragPower, this);
        this.bottomMenu.on("dragPower", this.onDragPower, this);
        this.bottomMenu.on("endDragPower", this.onEndDragPower, this);

        const turretButtons = this.bottomMenu.getTurretButtons();

        for (let i = 0; i < turretButtons.length; ++i)
        {
            const turretButton = turretButtons[i];

            turretButton.on(Phaser.Input.Events.DRAG_START, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.events.emit("startDragTurret", i);
            }, this);

            turretButton.on(Phaser.Input.Events.DRAG, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.events.emit("dragTurret");
            }, this);

            turretButton.on(Phaser.Input.Events.DRAG_END, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.events.emit("endDragTurret");
            }, this);
        }

        this.inGameHUD.add(this.bottomMenu);
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
    }

    protected togglePauseMenu(): void
    {
        if (this.welcomePage?.visible)
        {
            return;

        }

        const newVisibility = !this.pauseMenu.visible;

        if (!newVisibility || !this.endRunWidget.visible)
        {
            this.pauseMenu.setVisible(newVisibility);
            this.events.emit("pauseMenuToggled", newVisibility);
        }
    }

    protected requestRestart(): void
    {
        this.pauseMenu.setVisible(false);
        this.endRunWidget.setVisible(false);
        this.events.emit("requestRestart");
    }

    protected requestMainMenu(): void
    {
        const sceneGame = this.scene.get(WELLY_CST.SCENES.TOWER_DEFENSE);

        if (!sceneGame.scene.isPaused())
        {
            sceneGame.scene.pause();
        }
        sceneGame.scene.setVisible(false);

        if (!this.scene.isPaused())
        {
            this.scene.pause();
        }
        this.scene.setVisible(false);

        const sceneMainMenu = this.scene.get(WELLY_CST.SCENES.TOWER_DEFENSE_MAIN_MENU);
        sceneMainMenu.scene.restart();
    }

    public onGameOver(runStatistics: WELLY_GameStatistics): void
    {
        this.endRunWidget.show(runStatistics);
    }

    public onPlayerCoinChanged(coin: number): void
    {
        this.coinText.setText(`${coin}`);
        this.coinBackground.resize(100 + 14 * coin.toString().length, this.coinBackground.height);
    }

    public onPlayerHealthChanged(health: number, maxHealth: number): void
    {
        this.healthText.setText(`${health}/${maxHealth}`);
    }

    public onWaveStarted(currentWave: number): void
    {
        this.waveText.setText(`${currentWave.toString()}`);
    }

    public onWaveCompleted(currentWave: number): void
    {
    }

    public onTurretClicked(turretData: WELLY_ITurretData): void
    {
        //this.turretDataWidget.setVisible(true);
        this.updateTurretDataWidget(turretData);
    }

    public updateTurretDataWidget(turretData: WELLY_ITurretData): void
    {
        //this.turretDataWidget.updateData(turretData);
    }

    public hideTurretDataWidget(): void
    {
        this.turretDataWidget.setVisible(false);
    }

    public showWellyBoostSelection(boostDatArray: WELLY_WellyBoostData[]): void
    {
        this.wellyBoostSelection.show(boostDatArray);
    }

    public hideWellyBoostSelection(): void
    {
        this.wellyBoostSelection.hide();
    }

    protected onWellyBoostSelected(boostData: WELLY_WellyBoostData): void
    {
        this.wellyBoostSelection.hide();
        this.events.emit("wellyBoostSelected", boostData);
    }

    protected onGameSpeedButtonClicked(): void
    {
        this.events.emit("requestUpdateGameSpeed");
    }

    protected onPowerRequested(powerId: string): void
    {
        this.events.emit("powerRequested", powerId);
    }

    protected onStartDragPower(powerId: string): void
    {
        this.events.emit("startDragPower", powerId);
    }

    protected onDragPower(powerId: string): void
    {
        this.events.emit("dragPower", powerId);
    }

    protected onEndDragPower(powerId: string): void
    {
        this.events.emit("endDragPower", powerId);
    }

    public onPowerCooldownStart(powerId: string, cooldown: number): void
    {
        this.bottomMenu.onPowerCooldownStart(powerId, cooldown);
    }

    public onSpeedModeChanged(speedMode: WELLY_SpeedMode): void
    {
        this.bottomMenu.updateGameSpeed(speedMode);
    }

    public onTurretSpawned(turretId: string, turretRemainInstances: number): void
    {
        this.bottomMenu.updateButtons(turretId, turretRemainInstances);
    }

    public showWelcomePage(): void
    {
        this.welcomePage = this.add.container();

        const gameWidth = WELLY_CST.GAME.WIDTH
        const gameHeight = WELLY_CST.GAME.HEIGHT;

        const background = this.add.graphics();
        background.fillStyle(0x526CC1, 0.8);
        background.fillRect(0, 0, gameWidth, gameHeight);
        this.welcomePage.add(background);

        const sizerTexts = this.rexUI.add.sizer(WELLY_CST.GAME.WIDTH * 0.5, WELLY_CST.GAME.HEIGHT * 0.5, {
            space: { item: 20 },
            orientation: "top-to-bottom",
        });
        sizerTexts.setOrigin(0.5);
        sizerTexts.add(this.add.image(0, 0, "welcomeTitle"), { align: 'left' });
        sizerTexts.add(this.add.image(0, 0, "welcomeText"), { align: 'left' });
        sizerTexts.layout();

        this.welcomePage.add(sizerTexts);

        const continueButton = new WELLY_TextButton(this, WELLY_CST.GAME.WIDTH - 96, WELLY_CST.GAME.HEIGHT - 34, "continue", {
            fontSize : "37px",
            textColorNormal: WELLY_CST.STYLE.COLOR.WHITE,
            textColorPressed: "#FFDFD4",
            pixelPerfect: false,
            textOffsetNormalY: -2,
            textOffsetHoveredY: -1,
            textOffsetPressedY: 2,
        });
        continueButton.onClicked(this.closeWelcomePage, this);
        this.welcomePage.add(continueButton);

        this.inGameHUD.setVisible(false);

        this.time.delayedCall(3500, () => {
            this.closeWelcomePage();
        }, undefined, this);
    }

    public closeWelcomePage(): void
    {
        this.welcomePage?.destroy(true);
        this.welcomePage = undefined;
        
        this.inGameHUD.setVisible(true);
    }
}