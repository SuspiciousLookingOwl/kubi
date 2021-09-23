import { IPlayer } from "./Player";

export interface IRoomState {
	state: number;
	players: IPlayer[];
}
