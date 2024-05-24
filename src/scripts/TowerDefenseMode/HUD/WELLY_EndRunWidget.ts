import Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import { WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { WELLY_GameStatistics, WELLY_MonsterStatistics } from "../Analytics/WELLY_GameAnalytics";
import { GridTable, RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import Cell from 'phaser3-rex-plugins/plugins/gameobjects/container/gridtable/table/cell'
import { Label } from 'phaser3-rex-plugins/templates/ui/ui-components.js';

declare type WELLY_MonsterStatisticsSlotData = WELLY_MonsterStatistics;

export class WELLY_EndRunWidget extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    protected title: Phaser.GameObjects.Text;
   
    protected timeTitle: Phaser.GameObjects.Text;
    protected timeValueText: Phaser.GameObjects.Text;
    protected timeValue: number;

    protected customersTitle: Phaser.GameObjects.Text;
    protected customersValueText: Phaser.GameObjects.Text;
    protected customersValue: number;

    protected customersGrid: GridTable;

    protected mainButtons: Sizer;

    protected menuBackground: RoundRectangle;

    constructor(scene: WELLY_BaseScene, x?: number | undefined, y?: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = WELLY_CST.GAME.WIDTH;
        this.height = WELLY_CST.GAME.HEIGHT;

        const background = scene.add.graphics();
        background.fillStyle(0x526CC1, 0.8);
        background.fillRect(-this.width * 0.5, -this.height * 0.5, this.width * 2, this.height * 2);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(background);
        
        this.menuBackground = this.scene.rexUI.add.roundRectangle(this.width * 0.5, this.height * 0.5 - 30, 540, 200, 12, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE));
        this.menuBackground.setStrokeStyle(3, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE), 1);
        this.add(this.menuBackground);

        this.title = this.scene.add.text(this.width * 0.5, 120, "Welly played!", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, fontSize : "64px", color: WELLY_CST.STYLE.COLOR.WHITE }).setOrigin(0.5);
        this.add(this.title);

        this.createElapsedTimeWidget();
        this.createCustomersWidget();
        this.createMainButtons();
    }

    public setVisible(value: boolean): this
    {
        if (!value && this.customersGrid)
        {
            this.customersGrid.setVisible(false);
        }
        
        return super.setVisible(value);
    }

    protected createElapsedTimeWidget(): void
    {
        const titleX = this.menuBackground.x - this.menuBackground.width * 0.5 + 48;
        const titleY = this.menuBackground.y - this.menuBackground.height * 0.5 + 44;
        
        this.timeTitle = this.scene.add.text(titleX, titleY, "YOU COOKED FOR", { fontSize : "30px", color: WELLY_CST.STYLE.COLOR.WHITE, fontFamily: WELLY_CST.STYLE.TEXT.NANUM_PEN_FONT_FAMILY }).setOrigin(0, 0);
        this.add(this.timeTitle);

        this.timeValueText = this.scene.add.text(this.width * 0.5 - 12, this.timeTitle.y + this.timeTitle.height * 0.5, "", { fontSize : "33px", color: WELLY_CST.STYLE.COLOR.WHITE, fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, align: "left" }).setOrigin(0, 0.5);
        this.add(this.timeValueText);
    }

    protected createCustomersWidget(): void
    {
        this.customersTitle = this.scene.add.text(this.timeTitle.x, this.timeTitle.y + this.timeTitle.height + 36, "YOU SERVED", { fontSize : "30px", color: WELLY_CST.STYLE.COLOR.WHITE, fontFamily: WELLY_CST.STYLE.TEXT.NANUM_PEN_FONT_FAMILY  });
        this.customersTitle.setOrigin(0);
        this.add(this.customersTitle);

        this.customersValueText = this.scene.add.text(this.timeValueText.x, this.customersTitle.y + this.customersTitle.height * 0.5, "", { fontSize : "33px", color: WELLY_CST.STYLE.COLOR.WHITE, fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, align: "left" }).setOrigin(0, 0.5);
        this.add(this.customersValueText);

        const gridCellWidth = 48;
        const gridCellHeight = 84;
        const gridColumns = 16;
        const gridVisibleRows = 2;

        this.customersGrid = new GridTable(this.scene, {
            x: this.x + this.width * 0.5,
            y: this.y + this.customersTitle.y + this.customersTitle.displayHeight + 28,
            width: gridCellWidth * gridColumns,
            height: gridVisibleRows * gridCellHeight + 1, // +1 to make sure
            table: {
                cellWidth: gridCellWidth,
                cellHeight: gridCellHeight,
                columns: gridColumns,
                mask: { padding: 2 }
            },
            scroller: { threshold: 0 },
            space: { left: 0, right: 0, top: 0, bottom: 0 },
            mouseWheelScroller: { focus: true, speed: 0.5 },
            createCellContainerCallback: (cell: Cell, cellContainer: Label | null) => {
                const monsterStatsItem = cell.item as WELLY_MonsterStatisticsSlotData;
                cell.setCellContainerAlign(Phaser.Display.Align.CENTER);

                if (cellContainer == null)
                {
                    const background = this.scene.add.image(0,0, `${monsterStatsItem.monsterTexture}`).setDisplaySize(64, 64);
                    const icon = this.scene.add.text(0,0, `x${monsterStatsItem.monsterCount}`, { fontStyle: "bold", color: "white", fontSize: "20px", stroke: "black", strokeThickness: 4});
                    cellContainer = this.scene.rexUI.add.label({
                        width: gridCellWidth,
                        height: gridCellHeight,
                        background: background,
                        icon: icon,
                        space: {
                            left: 16,
                            top: 60
                        }
                    });
                }

                return cellContainer;
            },
            items: []
        }).setOrigin(0.5, 0);
        this.scene.add.existing(this.customersGrid);
        this.customersGrid.layout();
    }

    protected createMainButtons(): void
    {
        const buttonRestart =  new WELLY_TextButton(this.scene, 0, 0, "restart", {
            fontSize : "37px",
            textColorNormal: WELLY_CST.STYLE.COLOR.WHITE,
            textColorPressed: "#FFDFD4",
            pixelPerfect: false,
            textOffsetNormalY: -3,
            textOffsetHoveredY: -2,
            textOffsetPressedY: 3,
            textureNormal: "backgroundMenuButtonNormal",
            texturePressed: "backgroundMenuButtonPressed"
        });
        buttonRestart.onClicked(() => { this.onRestartClicked(); } , this);

        const buttonMainMenu =  new WELLY_TextButton(this.scene, 0, 0, "menu", {
            fontSize : "36px",
            textColorNormal: WELLY_CST.STYLE.COLOR.WHITE,
            textColorPressed: "#FFDFD4",
            pixelPerfect: false,
            textOffsetNormalY: -3,
            textOffsetHoveredY: -2,
            textOffsetPressedY: 3,
            textureNormal: "backgroundMenuButtonNormal",
            texturePressed: "backgroundMenuButtonPressed"
        });
        buttonMainMenu.onClicked(() => { this.onRestartClicked(); } , this);
        this.add(buttonMainMenu);

        this.mainButtons = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { top: 0, item: 40 },
            x: this.width * 0.5,
            y: this.menuBackground.y + this.menuBackground.height * 0.5 + 72
        }).setOrigin(0.5);

        this.add(this.mainButtons);
        this.mainButtons.add(buttonRestart);
        this.mainButtons.add(buttonMainMenu);
        this.mainButtons.layout();
    }

    public show(runStatistics: WELLY_GameStatistics): void
    {
        this.mainButtons.setVisible(false);
        this.timeTitle.setVisible(false);
        this.timeValueText.setVisible(false);
        this.customersTitle.setVisible(false);
        this.customersValueText.setVisible(false);
        this.customersGrid.setVisible(false);

        this.animateTitle(runStatistics);
        this.once("titleAnimationCompleted", () => { this.animateRunTime(runStatistics); }, this);
        this.once("runTimeAnimationCompleted", () => { this.animateScore(runStatistics); }, this);
        this.once("scoreAnimationCompleted", () => { this.animateMainButtons(runStatistics); }, this);
        
        this.setVisible(true);
    }

    protected animateTitle(runStatistics: WELLY_GameStatistics): void
    {
        this.title.setScale(0);

        this.scene.tweens.add({
            targets: this.title,
            scale: 1,
            duration: 200,
            delay: 300,
            callbackScope: this,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.title,
                    scale: 1.3,
                    duration: 150,
                    yoyo: true,
                    callbackScope: this,
                    onComplete: () => { this.emit("titleAnimationCompleted"); }
                });
            }
        });
    }

    protected animateRunTime(runStatistics: WELLY_GameStatistics): void
    {
        this.scene.time.delayedCall(300, () => {
            this.timeTitle.setVisible(true);
            this.timeValueText.setVisible(true);
            this.timeValue = 0;
            
            this.scene.tweens.add({
                targets: this,
                timeValue: runStatistics.elapsedTime,
                duration: 1300,
                callbackScope: this,
                onUpdate:() => {
                    const formatOption = { shouldIncludeSeconds: true, shouldIgnoreZeros: true, daySymbol: "day", hourSymbol: "h",  minuteSymbol: "min", secondSymbol: "sec"};
                    this.timeValueText.setText(`${WELLY_BaseScene.formatTime(this.timeValue, formatOption)}`);
                },
                onComplete: () => {
                    this.emit("runTimeAnimationCompleted");
                }
            });
        });
    }

    protected animateScore(runStatistics: WELLY_GameStatistics): void
    {
        this.scene.time.delayedCall(300, () => {
            this.customersTitle.setVisible(true);
            this.customersValueText.setVisible(true);

            this.customersValue = 0;

            this.scene.tweens.add({
                targets: this,
                customersValue: runStatistics.monsterTotalCount,
                duration: 1300,
                callbackScope: this,
                onUpdate:() => {
                    this.customersValueText.setText(`${Math.floor(this.customersValue)} customers`);
                },
                onComplete: () => {
                    this.emit("scoreAnimationCompleted");
                }
            });
            // this.scene.time.delayedCall(100, () => {
                // this.scoreGrid.setVisible(true);
                // this.scoreGrid.setItems([]);
                // this.showMonsterStat(runStatistics.monsterStatistics, 0);
            // });
        }, undefined, this);
    }

    protected showMonsterStat(monsterStatistics: WELLY_MonsterStatistics[], index: number): void
    {
        if (index < monsterStatistics.length)
        {
            // @ts-ignore - itemTable does have an items property
            Phaser.Utils.Array.Add(this.customersGrid.items, monsterStatistics[index]);
            this.customersGrid.refresh();

            this.scene.time.delayedCall(200, () => {
                this.showMonsterStat(monsterStatistics, index + 1);
            });
        }
        else
        {
            this.emit("scoreAnimationCompleted");
        }
    }

    protected animateMainButtons(runStatistics: WELLY_GameStatistics)
    {
        this.scene.time.delayedCall(250, () => {
            this.mainButtons.setVisible(true);
        });
    }

    private onRestartClicked() : void
    {
        this.emit("requestRestart");
    }
}