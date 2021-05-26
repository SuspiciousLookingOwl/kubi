import { TemplatedApp, WebSocket } from "uWebSockets.js";
import { Room } from "./classes";
import { Message } from "./interfaces";
import logger from "./util/logger";

const joinRoom = (id: unknown, ws: WebSocket, app: TemplatedApp): void => {
	if (ws.player.room || typeof id !== "string") return;
	const room = app.rooms.get(id);
	if (room) room.onPlayerJoin(ws.player);
	else if (/^[a-zA-Z0-9]{4,32}$/.test(id)) {
		new Room(id, ws.player, app);
	}
};

const leaveRoom = (_data: unknown, ws: WebSocket): void => {
	if (!ws.player?.room) return;
	ws.player.room.onPlayerLeave(ws.player);
};

const changeName = (data: unknown, ws: WebSocket): void => {
	const player = ws.player;
	if (!player?.room || typeof data !== "string") return;
	player.room.onPlayerNameChange(player, data.toString());
};

const submitCard = (data: unknown, ws: WebSocket): void => {
	const player = ws.player;
	if (!player?.room || typeof data !== "number") return;
	player.room.onSubmitWhiteCard(player, data);
};

const chat = (data: unknown, ws: WebSocket): void => {
	if (!ws.player?.room || typeof data !== "string") return;
	ws.player.room.onChat(ws.player, data);
};

const czarSelect = (data: unknown, ws: WebSocket): void => {
	if (!ws.player?.room || typeof data !== "number") return;
	ws.player.room.onCzarSelect(data, ws.player);
};

export const commandMap = {
	joinRoom,
	leaveRoom,
	changeName,
	submitCard,
	czarSelect,
	chat,
};

// command handler
export default (message: Message, ws: WebSocket, app: TemplatedApp): void => {
	logger.debug("commandHandler", message);
	if (!(message.command in commandMap)) return;
	commandMap[message.command](message.data, ws, app);
};
