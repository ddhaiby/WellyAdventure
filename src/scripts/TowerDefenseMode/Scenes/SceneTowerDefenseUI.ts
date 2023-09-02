import { CST } from "../../Common/CST";
import { WELLY_DialogueBox } from "../../Common/HUD/DialogueBox";
import { Welly_Scene, SceneData } from "../../Common/Scenes/WELLY_Scene";

declare type UIKeys = 
{
    skip: Phaser.Input.Keyboard.Key;
}

export class SceneTowerDefenseUI extends Welly_Scene
{
    private goldText: Phaser.GameObjects.Text;
    private waveText: Phaser.GameObjects.Text;
    
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

        this.goldText = this.add.text(24, 24, "", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.ORANGE, fontSize: "24px" })
        this.waveText = this.add.text(24, 60, "Wave 1", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, color: CST.STYLE.COLOR.BLUE, fontSize: "24px" })
    }

    private createShortcuts(): void
    {
        const keys = this.input.keyboard?.addKeys({
            skip: Phaser.Input.Keyboard.KeyCodes.ESC,
        }, false) as UIKeys;

        if (keys)
        {
            keys.skip.on('down', () => {
            });
        }
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
    }

    public onGoldChanged(gold: number): void
    {
        this.goldText.setText(`Gold: ${gold.toString()}`);
    }

    public onWaveStarted(currentWave: number): void
    {
        this.waveText.setText(`Wave: ${currentWave.toString()}`);
    }

    public onWaveCompleted(currentWave: number): void
    {
    }
}