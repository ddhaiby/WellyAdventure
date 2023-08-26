import { Npc } from "../../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../../Common/Scenes/WELLY_Scene";

export class JunkMonster extends Npc
{
    public scene: Welly_Scene;
    private health: number = 100;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);

        this.setCollideWorldBounds(false);
    }

    protected die(): void
    {
        this.health = 0;
        this.stopWalking();
        this.disableBody(true, false);

        this.emit("DIE");
    }

    public onDie(fn: Function, context?: any): void
    {
        this.on("DIE", fn, context);
    }
}