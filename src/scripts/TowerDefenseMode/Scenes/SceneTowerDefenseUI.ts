import { CST } from "../../Common/CST";
import { WELLY_DialogueBox } from "../../Common/HUD/DialogueBox";
import { LoadingScreen } from "../../Common/HUD/LoadingScreen";
import { WELLY_Bar } from "../../Common/HUD/WELLY_Bar";
import { Welly_Scene, SceneData } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { PauseMenu } from "../HUD/PauseMenu";
import { ITurretData, TurretDataWidget } from "../HUD/TurretDataWidget";
import { WellyBoostSelection } from "../HUD/WellyBoostSelection";

declare type UIKeys = 
{
    escape: Phaser.Input.Keyboard.Key;
}

export class SceneTowerDefenseUI extends Welly_Scene
{
    /** Pause menu */
    private pauseMenu: PauseMenu;

    /** Display the current golds */
    private goldText: Phaser.GameObjects.Text;

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

        this.goldText = this.add.text(this.playerFaceImage.x + 2, this.playerHealthBar.y + this.playerHealthBar.height + 8, "", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.ORANGE, stroke: CST.STYLE.COLOR.BLACK, strokeThickness: 3, fontSize: "24px" });
        this.waveText = this.add.text(this.playerFaceImage.x + 2, this.goldText.y + this.goldText.height + 6, "", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.BLUE, stroke: CST.STYLE.COLOR.BLACK, strokeThickness: 3, fontSize: "24px" });

        this.turretDataWidget = new TurretDataWidget(this, 0, 0);
        this.turretDataWidget.setPosition(this.scale.displaySize.width - this.turretDataWidget.displayWidth * 0.5 - 8, this.scale.displaySize.height - this.turretDataWidget.displayHeight * 0.5 - 8)
        this.turretDataWidget.setVisible(false);

        const wellyBoostSelection = new WellyBoostSelection(this, this.scale.displaySize.width * 0.5, this.scale.displaySize.height * 0.5);

        this.pauseMenu = new PauseMenu(this, 0, 0);
        this.pauseMenu.setVisible(false);
        this.pauseMenu.on("requestRestart", () => { this.events.emit("requestRestart"); }, this);

        new LoadingScreen(this);
    }

    private createShortcuts(): void
    {
        const keys = this.input.keyboard?.addKeys({
            escape: Phaser.Input.Keyboard.KeyCodes.ESC
        }, false) as UIKeys;

        if (keys)
        {
            keys.escape.on('down', () => {
                this.pauseMenu.setVisible(!this.pauseMenu.visible);
            });
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

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
    }

    public onPlayerGoldChanged(gold: number): void
    {
        this.goldText.setText(`Gold: ${gold.toString()}`);
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
}