import { WELLY_BaseScene } from "../../Scenes/WELLY_BaseScene";
import { WELLY_Character } from "../WELLY_Character";

export class WELLY_Npc extends WELLY_Character
{
    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);
    }
}