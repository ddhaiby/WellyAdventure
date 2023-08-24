import { Npc } from "./Npc";
import { Welly_Scene } from "../../Scenes/WELLY_Scene";

export class JunkMonster extends Npc
{
    public scene: Welly_Scene;

    protected die(): void
    {
        // this.health = 0;
        // this.stopWalking();
        // this.disableBody(true, false);
        // this.healthBar.setVisible(false);
        this.emit("DIE");
    }

    public onDie(fn: Function, context?: any): void
    {
        this.on("DIE", fn, context);
    }
}