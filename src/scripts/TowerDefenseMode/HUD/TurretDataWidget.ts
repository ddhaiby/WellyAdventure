import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

export interface ITurretData
{
    name: string;
    texture: Phaser.Textures.Texture | Phaser.Textures.CanvasTexture;
    getLevel: () => number;
    getRange: () => number;
    getDamage: () => number;
    getAttackSpeed: () => number;
}

export class TurretDataWidget extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    protected turretNameText: Phaser.GameObjects.Text;
    protected turretLevelText: Phaser.GameObjects.Text;
    protected turretDamageText: Phaser.GameObjects.Text;
    protected turretRangeText: Phaser.GameObjects.Text;
    protected turretAttackSpeedText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x?: number | undefined, y?: number | undefined)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        const backgroundWidth = 200;
        const backgroundHeight = 200;
        const background = this.scene.rexUI.add.roundRectangle(0, 0, backgroundWidth, backgroundHeight, 8, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE));
        background.strokeColor = WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLUE);
        background.lineWidth = 2;
        background.setInteractive();

        this.add(background);

        this.width = background.displayWidth;
        this.height = background.displayHeight;

        const turretIcon = this.scene.add.image(background.x - background.width * 0.5 + 8, background.y - background.height * 0.5 + 12, "canon").setOrigin(0, 0);
        this.add(turretIcon);

        this.turretNameText = this.scene.add.text(turretIcon.x + turretIcon.displayWidth + 8, turretIcon.y + turretIcon.displayHeight * 0.5, "Canon", { fontSize: "20px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY }).setOrigin(0, 0.5);
        this.add(this.turretNameText);

        this.turretLevelText = this.scene.add.text(background.x + background.width * 0.5 - 8, turretIcon.y + turretIcon.displayHeight * 0.5, "Lv. 10", { fontSize: "18px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY }).setOrigin(1, 0.5);
        this.add(this.turretLevelText);

        this.turretDamageText = this.scene.add.text(turretIcon.x, turretIcon.y + turretIcon.displayHeight + 20, "ATQ  10    >>   20", { fontSize: "18px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY }).setOrigin(0, 0.5);
        this.add(this.turretDamageText);

        this.turretRangeText = this.scene.add.text(turretIcon.x, this.turretDamageText.y + this.turretDamageText.displayHeight * 0.5 + 16, "RNG  100   >>   300", { fontSize: "18px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY }).setOrigin(0, 0.5);
        this.add(this.turretRangeText);

        this.turretAttackSpeedText = this.scene.add.text(turretIcon.x, this.turretRangeText.y + this.turretRangeText.displayHeight * 0.5 + 16, "ASP  1    >>   1.5", { fontSize: "18px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY }).setOrigin(0, 0.5);
        this.add(this.turretAttackSpeedText);
    }

    public updateData(turretData: ITurretData): void
    {
        this.turretNameText.setText(turretData.name);
        this.turretLevelText.setText(`${turretData.getLevel()}`);
        this.turretDamageText.setText(`ATQ ${turretData.getDamage()}`);
        this.turretRangeText.setText(`RNG ${turretData.getRange()}`);
        this.turretAttackSpeedText.setText(`ASP ${turretData.getAttackSpeed()}`);
    }
}