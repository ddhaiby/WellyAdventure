import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_TurretData } from "./WELLY_TurretData";

export class WELLY_TurretPreviewWidget extends Phaser.GameObjects.Container 
{
    public scene: WELLY_BaseScene;

    private turretImage: Phaser.GameObjects.Image;
    private rangeIndicator: Phaser.GameObjects.Graphics;
    private turretData: WELLY_TurretData;

    private isValid: boolean = true;

    constructor(scene: WELLY_BaseScene, x: number, y: number, turretData?: WELLY_TurretData)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.rangeIndicator = this.scene.add.graphics();
        this.add(this.rangeIndicator);
        
        this.turretImage = this.scene.add.image(0, 0, "");
        this.add(this.turretImage);

        if (turretData)
        {
            this.setTurretData(turretData);
        }
    }

    public setTurretData(turretData: WELLY_TurretData): void
    {
        this.turretData = turretData;
        this.turretImage.setTexture(turretData.gameStatsPerLevel[0].texture);
        this.drawRangeIndicator(turretData.gameStatsPerLevel[0].range);
    }

    private drawRangeIndicator(range: number) : void
    {
        this.rangeIndicator.clear();
        this.rangeIndicator.fillStyle(this.isValid ? 0x0000AA : 0xAA0000, 0.25);
        this.rangeIndicator.fillCircle(0, 0, range * 0.5);
        this.rangeIndicator.lineStyle(3, this.isValid ? 0x0000FF : 0xFF0000, 0.8);
        this.rangeIndicator.strokeCircle(0, 0, range * 0.5);
    }

    public setValid(isValid: boolean): void
    {
        this.isValid = isValid;
        this.drawRangeIndicator(this.turretData.gameStatsPerLevel[0].range);
    }
}