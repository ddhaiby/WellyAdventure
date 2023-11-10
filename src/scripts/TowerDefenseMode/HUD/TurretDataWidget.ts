import { Sizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

export interface ITurretData
{
    name: string;
    texture: Phaser.Textures.Texture | Phaser.Textures.CanvasTexture;
    getLevel: () => number;
    getNextLevel: () => number;
    canUpgrade: () => boolean;

    getRange: () => number;
    getNextRange: () => number;
    
    getCurrentDamage: () => number;
    getNextDamage: () => number;

    getAttackSpeed: () => number;
    getNextAttackSpeed: () => number;
}

export class TurretDataWidget extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    protected turretNameText: Phaser.GameObjects.Text;
    protected turretLevelText: Phaser.GameObjects.Text;

    protected turretATQText: Phaser.GameObjects.Text;
    protected turretATQArrow: Phaser.GameObjects.Text;
    protected turretNextATQText: Phaser.GameObjects.Text;

    protected turretRNGText: Phaser.GameObjects.Text;
    protected turretRNGArrow: Phaser.GameObjects.Text;
    protected turretNextRNGText: Phaser.GameObjects.Text;

    protected turretASPText: Phaser.GameObjects.Text;
    protected turretASPArrow: Phaser.GameObjects.Text;
    protected turretNextASPText: Phaser.GameObjects.Text;

    constructor(scene: Welly_Scene, x?: number | undefined, y?: number | undefined)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = 200;
        this.height = 110;

        const textWidth = 42;
        const rowWidth = 150;
        const textStyle = { fontSize: "14px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY };
        const spaceItem = 6;

        const mainSizer = this.scene.rexUI.add.sizer({
            orientation: "top-to-bottom",
            space: { item: 4 },
            x: 0,
            y: this.height * 0.5
        }).setOrigin(0, 0.5);

        this.add(mainSizer);

        // Name
        this.turretNameText = this.scene.add.text(0, 0, "", textStyle).setOrigin(0, 0.5);
        this.turretNameText.width = rowWidth;
        mainSizer.add(this.turretNameText);

        // ATQ
        const sizerATQ = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { item: spaceItem },
            x: 0,
            y: 0
        }).setOrigin(0, 0);
        sizerATQ.width = rowWidth;

        const turretATQIcon = this.scene.add.image(0, 0, "stats_ATQ").setDisplaySize(24, 24);
        sizerATQ.add(turretATQIcon);

        this.turretATQText = this.scene.add.text(0, 0, "100", textStyle);
        this.turretATQText.width = textWidth;
        sizerATQ.add(this.turretATQText);

        this.turretATQArrow = this.scene.add.text(0, 0, ">>", textStyle);
        sizerATQ.add(this.turretATQArrow);

        this.turretNextATQText = this.scene.add.text(0, 0, "100", textStyle);
        sizerATQ.add(this.turretNextATQText);

        mainSizer.add(sizerATQ);

        // RNG
        const sizerRNG = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { item: spaceItem },
            x: 0,
            y: 0
        }).setOrigin(0, 0);
        sizerRNG.width = rowWidth;

       const turretRNGIcon = this.scene.add.image(0, 0, "stats_RNG").setDisplaySize(24, 24);
        sizerRNG.add(turretRNGIcon);

        this.turretRNGText = this.scene.add.text(0, 0, "200", textStyle);
        this.turretRNGText.width = textWidth;
        sizerRNG.add(this.turretRNGText);

        this.turretRNGArrow = this.scene.add.text(0, 0, ">>", textStyle);
        sizerRNG.add(this.turretRNGArrow);

        this.turretNextRNGText = this.scene.add.text(0, 0, "100", textStyle);
        sizerRNG.add(this.turretNextRNGText);

        mainSizer.add(sizerRNG);

        // ASP
        const sizerASP = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { item: spaceItem },
            x: 0,
            y: 0
        }).setOrigin(0, 0);
        sizerASP.width = rowWidth;

        const turretASPIcon = this.scene.add.image(0, 0, "stats_ASP").setDisplaySize(24, 24);
        sizerASP.add(turretASPIcon);

        this.turretASPText = this.scene.add.text(0, 0, "200", textStyle);
        this.turretASPText.width = textWidth;
        sizerASP.add(this.turretASPText);

        this.turretASPArrow = this.scene.add.text(0, 0, ">>", textStyle);
        sizerASP.add(this.turretASPArrow);

        this.turretNextASPText = this.scene.add.text(0, 0, "100", textStyle);
        sizerASP.add(this.turretNextASPText);

        mainSizer.add(sizerASP);
        mainSizer.layout();
    }

    public updateData(turretData: ITurretData): void
    {
        this.turretNameText.setText(`${turretData.name}    Lv.${turretData.getLevel() + 1}`);

        this.turretATQText.setText(`${turretData.getCurrentDamage()}`);
        this.turretNextATQText.setText(`${turretData.getNextDamage()}`);
        this.turretNextATQText.setVisible(turretData.canUpgrade());
        this.turretATQArrow.setVisible(turretData.canUpgrade());

        this.turretRNGText.setText(`${turretData.getRange()}`);
        this.turretNextRNGText.setText(`${turretData.getNextRange()}`);
        this.turretNextRNGText.setVisible(turretData.canUpgrade());
        this.turretRNGArrow.setVisible(turretData.canUpgrade());

        this.turretASPText.setText(`${turretData.getAttackSpeed()}`);
        this.turretNextASPText.setText(`${turretData.getNextAttackSpeed()}`);
        this.turretNextASPText.setVisible(turretData.canUpgrade());
        this.turretASPArrow.setVisible(turretData.canUpgrade());
    }
}