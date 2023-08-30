import { Welly_Scene } from "../../Scenes/WELLY_Scene";
import { Character } from "../Character";

export class Npc extends Character
{
    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
    }
}