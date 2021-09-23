import { IPlayer } from "interfaces";

export interface IChat {
	player?: IPlayer;
	content: string;
	time: Date;
}

export interface IGroupedChat {
	player?: IPlayer;
	time: Date;
	contents: string[];
}
