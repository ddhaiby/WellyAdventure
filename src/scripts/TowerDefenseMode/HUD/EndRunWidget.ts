import Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { GPC_TextButtonStyle, WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { GameStatistics as RunStatistics, MonsterStatistics } from "../Analytics/GameAnalytics";
import { GridTable } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import Cell from 'phaser3-rex-plugins/plugins/gameobjects/container/gridtable/table/cell'
import { Label } from 'phaser3-rex-plugins/templates/ui/ui-components.js';

declare type MonsterStatisticsSlotData = MonsterStatistics;

export class EndRunWidget extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    protected title: Phaser.GameObjects.Text;

    protected elapsedTimeWidget: Sizer;
    protected timeTitle: Phaser.GameObjects.Text;
    protected timeValueText: Phaser.GameObjects.Text;
    protected timeValue: number;

    protected scoreTitle: Phaser.GameObjects.Text;
    protected scoreGrid: GridTable;

    protected mainButtons: Sizer;

    constructor(scene: Welly_Scene, x?: number | undefined, y?: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = this.scene.scale.displaySize.width;
        this.height = this.scene.scale.displaySize.height;

        const background = scene.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLACK), 0.85);
        background.fillRect(-this.width * 0.5, -this.height * 0.5, this.width * 2, this.height * 2);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(background);
        
        this.title = this.scene.add.text(this.width * 0.5, 100, "WELLY PLAYED", { fontSize : "80px", color: CST.STYLE.COLOR.WHITE, fontStyle: "bold", strokeThickness: 2, stroke: "black" }).setOrigin(0.5);
        this.add(this.title);

        this.createElapsedTimeWidget();
        this.createFedPeopleWidget();
        this.createMainButtons();
    }

    public setVisible(value: boolean): this
    {
        if (!value && this.scoreGrid)
        {
            this.scoreGrid.setVisible(false);
        }
        
        return super.setVisible(value);
    }

    protected createElapsedTimeWidget(): void
    {
        this.timeTitle = this.scene.add.text(0, 0, "You cooked for", { fontSize : "28px", color: CST.STYLE.COLOR.WHITE, fontStyle: "bold", strokeThickness: 2, stroke: "black" }).setOrigin(0.5);
        this.timeValueText = this.scene.add.text(0, 0, "5min 06sec", { fontSize : "44px", color: CST.STYLE.COLOR.ORANGE, fontStyle: "bold", strokeThickness: 2, stroke: "black" }).setOrigin(0.5);

        this.elapsedTimeWidget = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { top: 0, item: 40 },
            x: this.width * 0.5,
            y: this.title.y + this.title.displayHeight * 0.5 + 36
        }).setOrigin(0.5, 0);

        this.add(this.elapsedTimeWidget);
        this.elapsedTimeWidget.add(this.timeTitle);
        this.elapsedTimeWidget.add(this.timeValueText);
        this.elapsedTimeWidget.layout();
    }

    protected createFedPeopleWidget(): void
    {
        this.scoreTitle = this.scene.add.text(this.elapsedTimeWidget.x - this.elapsedTimeWidget.displayWidth * 0.5, this.elapsedTimeWidget.y + this.elapsedTimeWidget.displayHeight + 36, "You served", { fontSize : "28px", color: CST.STYLE.COLOR.WHITE, fontStyle: "bold", strokeThickness: 2, stroke: "black" });
        this.scoreTitle.setOrigin(0);
        this.add(this.scoreTitle);

        const gridCellWidth = 72;
        const gridCellHeight = 84;
        const gridColumns = 8;
        const gridVisibleRows = 2;

        this.scoreGrid = new GridTable(this.scene, {
            x: this.x + this.width * 0.5,
            y: this.y + this.scoreTitle.y + this.scoreTitle.displayHeight + 28,
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
                const monsterStatsItem = cell.item as MonsterStatisticsSlotData;
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
        this.scene.add.existing(this.scoreGrid);
        this.scoreGrid.layout();
    }

    protected createMainButtons(): void
    {
        const buttonStyle = {
            fontSize : "54px",
            textColorNormal: CST.STYLE.COLOR.ORANGE,
            textColorHovered: CST.STYLE.COLOR.WHITE,
            textColorPressed: CST.STYLE.COLOR.GREY,
            textStrokeThickness : 6,
            textStroke: CST.STYLE.COLOR.BLACK,
            pixelPerfect: false,
            textOffsetNormalY: 0,
            textOffsetHoveredY: -1,
            textOffsetPressedY: 3
        } as GPC_TextButtonStyle ;

        const buttonRestart =  new WELLY_TextButton(this.scene, 0, 0, "RESTART", buttonStyle);
        buttonRestart.setTextures("");
        buttonRestart.onClicked(() => { this.onRestartClicked(); } , this);
        this.add(buttonRestart);

        const buttonMainMenu =  new WELLY_TextButton(this.scene, 0, 0, "MAIN MENU", buttonStyle);
        buttonMainMenu.setTextures("");
        buttonMainMenu.onClicked(() => { this.onRestartClicked(); } , this);
        this.add(buttonMainMenu);

        this.mainButtons = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { top: 0, item: 40 },
            x: this.width * 0.5,
            y: this.height - 80
        }).setOrigin(0.5);

        this.add(this.mainButtons);
        this.mainButtons.add(buttonRestart);
        this.mainButtons.add(buttonMainMenu);
        this.mainButtons.layout();
    }

    public show(runStatistics: RunStatistics): void
    {
        this.mainButtons.setVisible(false);
        this.scoreTitle.setVisible(false);
        this.scoreGrid.setVisible(false);
        this.elapsedTimeWidget.setVisible(false);

        this.animateTitle(runStatistics);
        this.once("titleAnimationCompleted", () => { this.animateRunTime(runStatistics); }, this);
        this.once("runTimeAnimationCompleted", () => { this.animateScore(runStatistics); }, this);
        this.once("scoreAnimationCompleted", () => { this.animateMainButtons(runStatistics); }, this);
        
        this.setVisible(true);
    }

    protected animateTitle(runStatistics: RunStatistics): void
    {
        this.title.setScale(0);

        this.scene.tweens.add({
            targets: this.title,
            scale: 1,
            angle: 360,
            duration: 400,
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

    protected animateRunTime(runStatistics: RunStatistics): void
    {
        this.scene.time.delayedCall(400, () => {
            this.elapsedTimeWidget.setVisible(true);
            this.timeTitle.setVisible(true);
            this.timeValueText.setVisible(false);

            this.scene.time.delayedCall(800, () => {
                this.timeValueText.setVisible(true);
                this.timeValue = 0;

                this.scene.tweens.add({
                    targets: this,
                    timeValue: runStatistics.elapsedTime,
                    duration: 1300,
                    callbackScope:this,
                    onUpdate:() => {
                        const formatOption = { shouldIncludeSeconds: true, shouldIgnoreZeros: true, daySymbol: "day", hourSymbol: "h",  minuteSymbol: "min", secondSymbol: "sec"};
                        this.timeValueText.setText(`${Welly_Scene.formatTime(this.timeValue, formatOption)}`);
                    },
                    onComplete: () => {
                        this.emit("runTimeAnimationCompleted");
                    }
                });
            });
        });
    }

    protected animateScore(runStatistics: RunStatistics): void
    {
        this.scene.time.delayedCall(500, () => {
            this.scoreTitle.setVisible(true);

            this.scene.time.delayedCall(800, () => {
                this.scoreGrid.setVisible(true);
                this.scoreGrid.setItems([]);
                this.showMonsterStat(runStatistics.monsterStatistics, 0);
            });
        }, undefined, this);
    }

    protected showMonsterStat(monsterStatistics: MonsterStatistics[], index: number): void
    {
        if (index < monsterStatistics.length)
        {
            // @ts-ignore - itemTable does have an items property
            Phaser.Utils.Array.Add(this.scoreGrid.items, monsterStatistics[index]);
            this.scoreGrid.refresh();

            this.scene.time.delayedCall(200, () => {
                this.showMonsterStat(monsterStatistics, index + 1);
            });
        }
        else
        {
            this.emit("scoreAnimationCompleted");
        }
    }

    protected animateMainButtons(runStatistics: RunStatistics)
    {
        this.scene.time.delayedCall(500, () => {
            this.mainButtons.setVisible(true);
        });
    }

    private onRestartClicked() : void
    {
        this.emit("requestRestart");
    }
}