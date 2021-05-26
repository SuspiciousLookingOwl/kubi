import Objection, { raw } from "objection";
import { TemplatedApp } from "uWebSockets.js";

import { BlackCard, WhiteCard } from "../database";
import logger from "../util/logger";
import sleep from "../util/sleep";
import Player from "./Player";

enum State {
	WaitingForPlayers = 1,
	StartCountdown = 2,
	WaitingForSubmission = 3,
	WaitingForSelection = 4,
	WaitingForNextRound = 5,
	PostRound = 6,
	PostGame = 7,
}

export default class Room {
	id: string;
	state: State;
	host: Player;
	players: Player[];
	clown: Player | null;
	blackCard: Objection.ModelObject<BlackCard> | null;

	blackCards: BlackCard[];
	whiteCards: WhiteCard[];

	private skipSleep: () => void;
	private sleepTime!: Date;
	private app: TemplatedApp;

	private static START_GAME_DELAY = 3000;
	private static POST_GAME_DELAY = 15000;
	private static BLACK_CARD_DELAY = 60000;
	private static ROUND_DELAY = 3000;
	private static MAX_SCORE = 5;
	private static MAX_PLAYERS = 10;

	constructor(id: string, host: Player, app: TemplatedApp) {
		this.app = app;
		this.id = id;
		this.state = State.WaitingForPlayers;
		this.host = host;
		this.players = [];
		this.clown = null;

		this.blackCard = null;

		this.blackCards = [];
		this.whiteCards = [];

		this.skipSleep = () => {
			return;
		};
		this.app.rooms.set(id, this);
		this.onPlayerJoin(host);
	}

	async startGame(): Promise<void> {
		if (this.state !== State.WaitingForPlayers || this.players.length < 3) return;
		this.state = State.StartCountdown;
		this.broadcast("gameStarting");
		const sleep = this.sleep(Room.START_GAME_DELAY);
		this.players.forEach((p) => {
			p.isPlaying = true;
			p.isCzar = false;
			p.submission = null;
			p.cards = [];
			p.score = 0;
		});

		const maxRounds = (Room.MAX_SCORE - 1) * this.players.length + 1;
		this.blackCards = await BlackCard.query().limit(maxRounds).orderBy(raw("RANDOM()"));
		this.whiteCards = await WhiteCard.query()
			.limit(this.players.length * 7 + maxRounds * this.players.length)
			.orderBy(raw("RANDOM()"));

		await sleep;
		if (this.state !== State.StartCountdown) return;
		this.broadcast("gameStart");
		this.startRound();
	}

	async startRound(): Promise<void> {
		if (this.state !== State.StartCountdown && this.state !== State.PostRound) return;
		this.state = State.WaitingForSubmission;
		let czarIndex = this.players.findIndex((p) => p.isCzar);
		this.players.forEach((p) => {
			if (!p.isPlaying) return;
			p.isCzar = false;
			// p.isPlaying = true;
			p.submission = null;
			p.cards = [...p.cards, ...this.whiteCards.splice(0, 7 - p.cards.length)];
			p.send("whiteCards", p.cards);
		});
		if (czarIndex < 0) {
			czarIndex = Math.floor(Math.random() * this.players.length);
			this.players[czarIndex].isCzar = true;
		} else {
			if (czarIndex >= this.players.length - 1) czarIndex = 0;
			else czarIndex++;
			this.players[czarIndex].isCzar = true;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const blackCard = this.blackCards.shift()!.toJSON();
		this.blackCard = blackCard;
		this.broadcast("roundStart", { ...blackCard, czar: this.players[czarIndex].id });
		await this.sleep(Room.BLACK_CARD_DELAY);
		this.selectionStage();
	}

	async selectionStage(): Promise<void> {
		if (this.state !== State.WaitingForSubmission) return;
		this.state = State.WaitingForSelection;
		this.playingPlayers.forEach((p) => {
			if (p.isCzar || p.submission) return;
			const index = Math.floor(Math.random() * p.cards.length);
			p.submission = p.cards[index];
			p.cards.splice(index, 1);
			this.broadcast("playerSubmit", { id: p.id });
		});
		this.broadcast(
			"roundSelection",
			this.playingPlayers
				.filter((p) => !!p.submission)
				.map((p) => ({ c: p.submission, s: Math.random() }))
				.sort((a, b) => a.s - b.s)
				.map((a) => a.c)
		);
		await this.sleep(Room.BLACK_CARD_DELAY);
		this.postRound();
	}

	async postRound(): Promise<void> {
		if (this.state !== State.WaitingForSelection) return;
		if (!this.clown) {
			const players = this.playingPlayers.filter((p) => !p.isCzar);
			const randomClown = players[Math.floor(Math.random() * players.length)];
			if (randomClown && randomClown.submission) this.onCzarSelect(randomClown.submission.id);
		}
		this.state = State.PostRound;
		await this.sleep(Room.ROUND_DELAY);

		const winner = this.players.find((p) => p.score >= Room.MAX_SCORE);
		if (winner) this.postGame(winner);
		else this.startRound();
	}

	async postGame(winner: Player | null = null): Promise<void> {
		this.state = State.PostGame;
		this.broadcast("gameEnded");
		if (this.players.length <= 2) this.state = State.WaitingForPlayers;
		if (winner) {
			this.broadcast("playerWin", { id: winner.id });
			await this.sleep(Room.POST_GAME_DELAY);
		} else this.startGame();
	}

	onPlayerJoin(player: Player): void {
		if (this.players.length >= Room.MAX_PLAYERS) throw new Error();
		player.ws.subscribe(this.id);
		player.room = this;
		this.players.push(player);
		this.broadcast("playerJoin", {
			id: player.id,
			name: player.name,
		});
		this.broadcast("roomState", {
			state: this.state,
			players: this.players,
			sleepTime: this.sleepTime,
		});
		if (this.state === State.WaitingForPlayers && this.players.length > 2) this.startGame();
	}

	onPlayerLeave(player: Player): void {
		const index = this.players.findIndex((p) => p.ws === player.ws);
		if (index < 0) return;
		this.players.splice(index, 1);
		player.resetState();
		this.broadcast("playerLeave", {
			id: player.id,
		});
		if (this.state !== State.WaitingForPlayers && this.players.length <= 2) {
			this.state = State.WaitingForPlayers;
			this.skipSleep();
			this.postGame();
		}
	}

	onCzarSelect(cardOrPlayer?: number | Player, czar: Player | null = null): void {
		if (this.state !== State.WaitingForSelection || (czar && !czar.isCzar)) return;
		let clown = cardOrPlayer;
		if (typeof clown === "number") clown = this.players.find((p) => p.submission?.id === clown);
		if (clown instanceof Player) {
			clown.score++;
			this.clown = clown;
			this.broadcast("czarSelect", { id: clown.id });
			this.skipSleep();
		}
	}

	onSubmitWhiteCard(player: Player, cardId: number): void {
		if (
			this.state !== State.WaitingForSubmission ||
			player.isCzar ||
			!player.isPlaying ||
			player.submission
		) {
			return;
		}

		const index = player.cards.findIndex((c) => c.id === cardId);
		if (index < 0) return;

		player.submission = player.cards[index];
		player.cards.splice(index, 1);
		this.broadcast("playerSubmit", {
			id: player.id,
		});

		// if all players submitted their card
		if (this.playingPlayers.every((p) => p.submission || p.isCzar)) this.skipSleep();
	}

	onPlayerNameChange(player: Player, name: string): void {
		name = name.trim().substring(0, 16);
		if (!name) return;
		player.name = name;
		this.broadcast("playerNameChange", {
			id: player.id,
			name,
		});
	}

	onChat(player: Player, content: string): void {
		content = content.trim().substring(0, 256);
		if (!content) return;
		this.broadcast("chat", {
			from: player.id,
			content,
		});
	}

	private get playingPlayers() {
		return this.players.filter((p) => p.isPlaying);
	}

	private broadcast(event: string, data?: unknown[] | Record<string, unknown>) {
		logger.debug(event, data);
		this.app.publish(this.id, JSON.stringify({ event, data }), false, true);
	}

	async sleep(ms: number): Promise<void> {
		const [promise, cancellation] = sleep(ms);
		this.skipSleep = cancellation;
		this.sleepTime = new Date();
		await promise;
	}
}
