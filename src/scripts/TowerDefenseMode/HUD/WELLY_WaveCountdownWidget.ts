import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";

export class WELLY_WaveCountdownWidget extends Phaser.GameObjects.Graphics
{
    public width: number;
    public height: number;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, { x: x, y: y });
        this.scene.add.existing(this);

        this.setDefaultStyles({
            lineStyle: { width: 3, color: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BLUE), alpha: 1 },
            fillStyle: { color: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.ORANGE), alpha: 1 }
        });

        this.width = 48;
        this.height = this.width;

        this.setInteractive(new Phaser.Geom.Rectangle(-this.width * 0.5, -this.height * 0.5, this.width, this.height), Phaser.Geom.Rectangle.Contains);
    }

    public onCountdownTick(remainDuration: number, totalDuration: number): void
    {
        this.clear();
        this.slice(0, 0, this.width * 0.5, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(remainDuration / totalDuration * 360), false);
        this.fillPath();
        this.strokePath();
    }
}