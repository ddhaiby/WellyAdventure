import { WELLY_Player } from "../Characters/Players/WELLY_Player";

export interface WELLY_IInteractable
{
    onInteract(source: WELLY_Player): void;
}