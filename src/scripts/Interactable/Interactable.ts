import { Player } from "../Characters/Players/Player";

export interface IInteractable
{
    onInteract(source: Player): void;
}