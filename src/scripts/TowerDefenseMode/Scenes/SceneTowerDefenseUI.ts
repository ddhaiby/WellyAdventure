import { CST } from "../../Common/CST";
import { WELLY_DialogueBox } from "../../Common/HUD/DialogueBox";
import { WELLY_Bar } from "../../Common/HUD/WELLY_Bar";
import { WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { Welly_Scene, SceneData, SpeedMode } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { BottomMenu } from "../HUD/BottomMenu";
import { EndRunWidget } from "../HUD/EndRunWidget";
import { PauseMenu } from "../HUD/PauseMenu";
import { ITurretData, TurretDataWidget } from "../HUD/TurretDataWidget";
import { WellyBoostSelection } from "../HUD/WellyBoostSelection";
import { WellyBoostData } from "../WellyBoost/WellyBoostManager";

declare type UIKeys = 
{
    escape: Phaser.Input.Keyboard.Key;
}

export class SceneTowerDefenseUI extends Welly_Scene
{
    /** Pause menu */
    private pauseMenu: PauseMenu;

     /** Bottom menu */
    private bottomMenu: BottomMenu;

    /** Display the current coins */
    private coinText: Phaser.GameObjects.Text;

    /** Display the current wave */
    private waveText: Phaser.GameObjects.Text;

    /** Display the data of a given turret */
    private turretDataWidget: TurretDataWidget;
    
    /** Display the health of the player with a bar */
    private playerHealthBar: WELLY_Bar;

    /** Display the current health and max health of the player */
    private healthText: Phaser.GameObjects.Text;

    /** Player face near the health bar */
    private playerFaceImage: Phaser.GameObjects.Image;

    private gameSpeedButton: WELLY_TextButton;

    private wellyBoostSelection: WellyBoostSelection;

    private endRunWidget: EndRunWidget;

    constructor()
    {
        super({key: CST.SCENES.TOWER_DEFENSE_UI});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: SceneData): void
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
        this.createHealthBar();

        const coinIcon = this.add.image(this.playerFaceImage.x + 2, this.playerHealthBar.y + this.playerHealthBar.height + 12, "coin_24").setOrigin(0, 0);
        this.coinText = this.add.text(coinIcon.x + coinIcon.displayWidth + 8, coinIcon.y - 3, "", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.ORANGE, stroke: CST.STYLE.COLOR.BLACK, strokeThickness: 3, fontSize: "24px" });
        this.waveText = this.add.text(this.playerFaceImage.x + 2, this.coinText.y + this.coinText.height + 6, "", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.BLUE, stroke: CST.STYLE.COLOR.BLACK, strokeThickness: 3, fontSize: "24px" });

        this.turretDataWidget = new TurretDataWidget(this, 0, 0);
        this.turretDataWidget.setPosition(this.scale.displaySize.width - this.turretDataWidget.displayWidth * 0.5 - 8, this.scale.displaySize.height - this.turretDataWidget.displayHeight * 0.5 - 8)
        this.turretDataWidget.setVisible(false);

        this.gameSpeedButton = new WELLY_TextButton(this, this.scale.displaySize.width - 30, 36, "X1", {
            fontSize: "30px",
            textOffsetNormalY: -1,
            textOffsetHoveredY: -2,
            textOffsetPressedY: 0,
            textColorNormal: CST.STYLE.COLOR.BLUE,
            textStrokeThickness: 0
        });
        this.gameSpeedButton.onClicked(() => { this.onGameSpeedButtonClicked(); }, this);

        this.createBottomMenu();

        this.wellyBoostSelection = new WellyBoostSelection(this, this.scale.displaySize.width * 0.5, this.scale.displaySize.height * 0.5);
        this.wellyBoostSelection.setVisible(false);
        this.wellyBoostSelection.on("wellyBoostSelected", this.onWellyBoostSelected, this);

        this.pauseMenu = new PauseMenu(this, 0, 0);
        this.pauseMenu.setVisible(false);
        this.pauseMenu.on("requestResume", () => { this.togglePauseMenu(); }, this);
        this.pauseMenu.on("requestRestart", () => { this.requestRestart(); }, this);

        this.endRunWidget = new EndRunWidget(this, 0, 0);
        this.endRunWidget.setVisible(false);
        this.endRunWidget.on("requestRestart", () => { this.requestRestart(); }, this);

    }

    private createShortcuts(): void
    {
        const keys = this.input.keyboard?.addKeys({
            escape: Phaser.Input.Keyboard.KeyCodes.ESC
        }, false) as UIKeys;

        if (keys)
        {
            keys.escape.on('down', () => { this.togglePauseMenu(); }, this);
        }
    }

    private createHealthBar(): void
    {
        this.playerHealthBar = new WELLY_Bar(this, { x: 30, y: 32, width: 200, height: 22, radius: 2,  value: 1, color: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.ORANGE), strokeThickness: 1, strokeColor: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLUE) });
        
        this.healthText = this.add.text(this.playerHealthBar.x +  this.playerHealthBar.width * 0.5, this.playerHealthBar.y + this.playerHealthBar.height * 0.5, "", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.WHITE, stroke: CST.STYLE.COLOR.BLACK, strokeThickness: 4, fontSize: "18px" });
        this.healthText.setOrigin(0.5, 0.5);

        this.playerFaceImage = this.add.image(0, this.healthText.y - 6, "playerFace").setOrigin(0, 0.5);
        this.playerFaceImage.setX(this.playerHealthBar.x - this.playerFaceImage.width * 0.5);
    }

    private createBottomMenu(): void
    {
        const menuWidth = this.scale.displaySize.width;
        const menuHeight = 110;
        this.bottomMenu = new BottomMenu(this, this.scale.displaySize.width * 0.5, this.scale.displaySize.height - menuHeight * 0.5, menuWidth, menuHeight); // Display the bottomMenu below the game

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
        this.pauseMenu.setVisible(!this.pauseMenu.visible);
        this.events.emit("pauseMenuToggled", this.pauseMenu.visible);
    }

    private requestRestart(): void
    {
        this.pauseMenu.setVisible(false);
        this.endRunWidget.setVisible(false);
        this.events.emit("requestRestart");
    }

    public onGameOver(): void
    {
        this.endRunWidget.show();
    }

    public onPlayerCoinChanged(coin: number): void
    {
        this.coinText.setText(`${coin.toString()}`);
    }

    public onPlayerHealthChanged(health: number, maxHealth: number): void
    {
        this.playerHealthBar.setValue(health / maxHealth);
        this.healthText.setText(`${health}/${maxHealth}`);
    }

    public onWaveStarted(currentWave: number): void
    {
        this.waveText.setText(`Wave: ${currentWave.toString()}`);
    }

    public onWaveCompleted(currentWave: number): void
    {
    }

    public onTurretClicked(turretData: ITurretData): void
    {
        this.turretDataWidget.setVisible(true);
        this.updateTurretDataWidget(turretData);
    }

    public updateTurretDataWidget(turretData: ITurretData): void
    {
        this.turretDataWidget.updateData(turretData);
    }

    public hideTurretDataWidget(): void
    {
        this.turretDataWidget.setVisible(false);
    }

    public showWellyBoostSelection(boostDatArray: WellyBoostData[]): void
    {
        this.wellyBoostSelection.show(boostDatArray);
    }

    public hideWellyBoostSelection(): void
    {
        this.wellyBoostSelection.hide();
    }

    protected onWellyBoostSelected(): void
    {
        this.wellyBoostSelection.hide();
        this.events.emit("wellyBoostSelected");
    }

    protected onGameSpeedButtonClicked(): void
    {
        this.events.emit("requestUpdateGameSpeed");
    }

    public onSpeedModeChanged(speedMode: SpeedMode): void
    {
        switch(speedMode)
        {
            case SpeedMode.SLOW: this.gameSpeedButton.setText("X1"); break;
            case SpeedMode.NORMAL: this.gameSpeedButton.setText("X2"); break;
            case SpeedMode.FAST: this.gameSpeedButton.setText("X3"); break;
            case SpeedMode.PAUSE: break;
            default: console.error("SceneTowerDefenseUI::onSpeedModeChanged - Invalid speed mode"); break;   
        }
    }

    public onTurretSpawned(turretId: string, turretRemainInstances: number): void
    {
        this.bottomMenu.updateButtons(turretId, turretRemainInstances);
    }
}