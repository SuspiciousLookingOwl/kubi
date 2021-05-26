import { WebSocket } from "uWebSockets.js";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";
import { WhiteCard } from "../database";
import Room from "./Room";
import logger from "../util/logger";

export default class Player {
	id: string;
	ws: WebSocket;
	name: string;
	room: Room | null;
	cards: WhiteCard[];
	isPlaying: boolean;
	isCzar: boolean;
	score: number;
	submission: WhiteCard | null;

	constructor(ws: WebSocket) {
		this.id = Player.generateId();
		this.ws = ws;
		this.name = "Biadab";
		this.room = null;
		this.cards = [];
		this.isPlaying = false;
		this.isCzar = false;
		this.score = 0;
		this.submission = null;
	}

	resetState(leaveRoom = true): void {
		if (leaveRoom) this.room = null;
		this.cards = [];
		this.isPlaying = false;
		this.isCzar = false;
		this.score = 0;
		this.submission = null;
	}

	toJSON(): Record<string, unknown> {
		return {
			id: this.id,
			name: this.name,
			score: this.score,
			isPlaying: this.isPlaying,
			isCzar: this.isCzar,
			isHost: this.id === this.room?.host.id,
		};
	}

	send(event: string, data?: unknown[] | Record<string, unknown>): void {
		logger.debug(event, data);
		this.ws.send(JSON.stringify({ event, data }), false, true);
	}

	private static generateId(): string {
		const nanoid = customAlphabet(alphanumeric, 24);
		return nanoid();
	}
}
