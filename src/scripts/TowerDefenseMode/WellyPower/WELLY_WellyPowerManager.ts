import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_PowerPreviewWidget } from "./WELLY_PowerPreviewWidget";
import { WELLY_WellyPower, WELLY_WellyPowerData } from "./WELLY_WellyPower";
import { WELLY_WellyPower_BoostTurrets } from "./WELLY_WellyPower_BoostTurrets";
import { WELLY_WellyPower_DotArea } from "./WELLY_WellyPower_RainOfTenders";

/** All the powers that we can use and read from the json wellyBoostData */
const WellyPowerList =
{
    "chiefsOnRush": WELLY_WellyPower_BoostTurrets,
    "rainOfTenders": WELLY_WellyPower_DotArea,
}

export class WELLY_WellyPowerManager extends Phaser.Events.EventEmitter
{
    public scene: WELLY_SceneTowerDefense;

    /** All the data related to the monsters */
    protected activeWellyPowers: Map<string, WELLY_WellyPower>;

    /** A preview of the power that the player wants to spawn in the game */
    protected powerPreviewWidget: WELLY_PowerPreviewWidget;

    protected powerPreview: WELLY_WellyPower | undefined;

    constructor(scene: WELLY_SceneTowerDefense)
    {
        super();

        this.scene = scene;

        this.powerPreview = undefined;
        this.powerPreviewWidget = new WELLY_PowerPreviewWidget(this.scene, 0, 0).setVisible(false).setDepth(9999);

        this.activeWellyPowers = new Map<string, WELLY_WellyPower>();

        for (const wellyPowerData of this.scene.cache.json.get("wellyPowerData") as WELLY_WellyPowerData[])
        {
            if (wellyPowerData.activated)
            {
                const powerClass = WellyPowerList[wellyPowerData.id];
                if (powerClass)
                {
                    const newPower = new powerClass(this.scene, wellyPowerData) as WELLY_WellyPower;
                    newPower.on("cooldownStarted", this.onPowerCooldownStart, this);
                    this.activeWellyPowers.set(wellyPowerData.id, newPower);
                }
            }
        }
    }

    public getActivePowers(): Map<string, WELLY_WellyPower>
    {
        return this.activeWellyPowers;
    }

    public activatePower(powerId: string): void
    {
        this.activeWellyPowers.get(powerId)?.tryActivate();
    }

    public onPowerCooldownStart(powerId: string, cooldown: number): void
    {
        this.emit("powerCooldownStart", powerId, cooldown);
    }

    public onStartDragPower(powerId: string): void
    {
        const wellyPower = this.activeWellyPowers.get(powerId);

        if (wellyPower && wellyPower.canActivate())
        {
            this.initPowerPreview(wellyPower);
            this.onDragPower(powerId);
        }
    }

    protected initPowerPreview(wellyPower: WELLY_WellyPower)
    {
        const activePointer = this.scene.input.activePointer;
        activePointer.updateWorldPoint(this.scene.cameras.main);

        this.powerPreview = wellyPower;
        
        this.powerPreviewWidget.setPosition(activePointer.worldX, activePointer.worldY);
        this.powerPreviewWidget.setPowerData(this.powerPreview.getPowerData());
        this.powerPreviewWidget.setValid(true);
        this.powerPreviewWidget.setVisible(true);
    }

    public onDragPower(powerId: string): void
    {
        if (this.powerPreview && this.powerPreview == this.activeWellyPowers.get(powerId))
        {
             const activePointer = this.scene.input.activePointer;
            activePointer.updateWorldPoint(this.scene.cameras.main);
            const worldX = activePointer.worldX;
            const worldY = activePointer.worldY;

            this.powerPreviewWidget.setPosition(worldX, worldY);

            // @ts-ignore
            const tile = this.scene.layer1.getTileAtWorldXY(worldX, worldY);
            const isTurretPositionValid = tile && tile.properties.towerField;
            this.powerPreviewWidget.setValid(isTurretPositionValid);
        }
    }

    public onEndDragPower(powerId: string): void
    {
        if (this.powerPreview)
        {
            if (this.powerPreview == this.activeWellyPowers.get(powerId))
            {
                this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);
                const worldX = this.scene.input.activePointer.worldX;
                const worldY = this.scene.input.activePointer.worldY;

                // @ts-ignore
                const tile = this.scene.layer1.getTileAtWorldXY(worldX, worldY);
                if (tile && tile.properties.towerField)
                {
                    this.powerPreview.tryActivate(tile.pixelX + tile.width * 0.5, tile.pixelY + tile.height * 0.5);
                }
            }
            this.powerPreview = undefined;
        }
        this.powerPreviewWidget.setVisible(false);
    }
}