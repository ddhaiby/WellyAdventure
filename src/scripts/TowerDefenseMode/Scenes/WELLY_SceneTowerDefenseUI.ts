import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_DialogueBox } from "../../Common/HUD/WELLY_DialogueBox";
import { WELLY_Bar } from "../../Common/HUD/WELLY_Bar";
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

export class WELLY_SceneTowerDefenseUI extends WELLY_BaseScene
{
    /** Pause menu */
    private pauseMenu: WELLY_PauseMenu;

     /** Bottom menu */
    private bottomMenu: WELLY_BottomMenu;

    /** Display the current coins */
    private coinText: Phaser.GameObjects.Text;

    private coinBackground: RoundRectangle;

    /** Display the current wave */
    private waveText: Phaser.GameObjects.Text;

    /** Display the data of a given turret */
    private turretDataWidget: WELLY_TurretDataWidget;
    
    /** Display the health of the player with a bar */
    private playerHealthWidget: Phaser.GameObjects.Image;

    /** Display the current health and max health of the player */
    private healthText: Phaser.GameObjects.Text;

    private wellyBoostSelection: WellyBoostSelection;

    private endRunWidget: WELLY_EndRunWidget;

    constructor()
    {
        super({key: WELLY_CST.SCENES.TOWER_DEFENSE_UI});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: WELLY_SceneData): void
    {
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
        this.createHealthWidget();
        this.createCoinWidget();
        
        const waveIcon = this.add.image(this.playerHealthWidget.x + 4, this.coinText.y + this.coinText.height + 6, "waveIcon").setOrigin(0, 0).setScale(0.75);
        this.waveText = this.add.text(waveIcon.x + waveIcon.displayWidth + 8, waveIcon.y + 3, "", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.BLUE, stroke: WELLY_CST.STYLE.COLOR.BLACK, strokeThickness: 3, fontSize: "24px" });

        const menuButton = new WELLY_TextButton(this, WELLY_CST.GAME.WIDTH - 40, 44, "", {
            textureNormal: "menuButtonNormal",
            texturePressed: "menuButtonPressed",
        });
        menuButton.onClicked(() => { this.togglePauseMenu(); } , this);

        this.createBottomMenu();

        this.turretDataWidget = new WELLY_TurretDataWidget(this, 0, 0);
        this.turretDataWidget.setPosition(this.scale.displaySize.width - this.turretDataWidget.displayWidth, this.scale.displaySize.height - this.turretDataWidget.displayHeight);
        this.turretDataWidget.setVisible(false);

        this.wellyBoostSelection = new WellyBoostSelection(this, this.scale.displaySize.width * 0.5, this.scale.displaySize.height * 0.5);
        this.wellyBoostSelection.setVisible(false);
        this.wellyBoostSelection.on("wellyBoostSelected", this.onWellyBoostSelected, this);

        this.pauseMenu = new WELLY_PauseMenu(this, 0, 0);
        this.pauseMenu.setVisible(false);
        this.pauseMenu.on("requestResume", () => { this.togglePauseMenu(); }, this);
        this.pauseMenu.on("requestRestart", () => { this.requestRestart(); }, this);

        this.endRunWidget = new WELLY_EndRunWidget(this, 0, 0);
        this.endRunWidget.setVisible(false);
        this.endRunWidget.on("requestRestart", () => { this.requestRestart(); }, this);
    }

    private createShortcuts(): void
    {
        const keys = this.input.keyboard?.addKeys({
            escape: Phaser.Input.Keyboard.KeyCodes.ESC
        }, false) as WELLY_UIKeys;

        if (keys)
        {
            keys.escape.on('down', () => { this.togglePauseMenu(); }, this);
        }
    }

    private createHealthWidget(): void
    {
        this.playerHealthWidget = this.add.image(12, 12, "healthWidget").setOrigin(0);
        
        this.healthText = this.add.text(this.playerHealthWidget.x +  this.playerHealthWidget.width - 7, this.playerHealthWidget.y + this.playerHealthWidget.height * 0.5 + 2, "", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.WHITE, fontSize: "33px" });
        this.healthText.setOrigin(1, 0.5);
    }

    private createCoinWidget(): void
    {
        const backgroundHeight = 36;
        this.coinBackground = this.rexUI.add.roundRectangle(this.playerHealthWidget.x + 2, this.playerHealthWidget.y + this.playerHealthWidget.height + backgroundHeight * 0.5 + 14, 140, backgroundHeight, backgroundHeight * 0.5, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.YELLOW), 1);
        this.coinBackground.setOrigin(0, 0.5);

        const coinIcon = this.add.image(this.playerHealthWidget.x + 2, this.coinBackground.y, "coinIcon").setOrigin(0, 0.5);
        
        this.coinText = this.add.text(coinIcon.x + coinIcon.width + 8, this.coinBackground.y, "", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.WHITE, fontSize: "32px" });
        this.coinText.setOrigin(0, 0.5);
    }

    private createBottomMenu(): void
    {
        const menuWidth = this.scale.displaySize.width;
        const menuHeight = 120;
        this.bottomMenu = new WELLY_BottomMenu(this, this.scale.displaySize.width * 0.5, this.scale.displaySize.height - menuHeight * 0.5, menuWidth, menuHeight); // Display the bottomMenu below the game

        this.bottomMenu.on("audioButtonClicked", () => {}, this);
        this.bottomMenu.on("gameSpeedButtonClicked", () => { this.onGameSpeedButtonClicked(); }, this);

        const turretButtons = this.bottomMenu.getTurretButtons();

        for (let i = 0; i < turretButtons.length; ++i)
        {
            const button = turretButtons[i];

            button.on(Phaser.Input.Events.DRAG_START, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.events.emit("startDragTurret", i);
            }, this);

            button.on(Phaser.Input.Events.DRAG, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.events.emit("dragTurret");
            }, this);

            button.on(Phaser.Input.Events.DRAG_END, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.events.emit("endDragTurret");
            }, this);
        }
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
    }

    private togglePauseMenu(): void
    {
        const newVisibility = !this.pauseMenu.visible;

        if (!newVisibility || !this.endRunWidget.visible)
        {
            this.pauseMenu.setVisible(newVisibility);
            this.events.emit("pauseMenuToggled", newVisibility);
        }
    }

    private requestRestart(): void
    {
        this.pauseMenu.setVisible(false);
        this.endRunWidget.setVisible(false);
        this.events.emit("requestRestart");
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

    public onSpeedModeChanged(speedMode: WELLY_SpeedMode): void
    {
        this.bottomMenu.updateGameSpeed(speedMode);
    }

    public onTurretSpawned(turretId: string, turretRemainInstances: number): void
    {
        this.bottomMenu.updateButtons(turretId, turretRemainInstances);
    }
}