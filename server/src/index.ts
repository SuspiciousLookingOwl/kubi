import { App, DEDICATED_COMPRESSOR_3KB } from "uWebSockets.js";
import "./util/logger";
import handleCommand from "./commandHandler";
import { Message } from "./interfaces";
import { rateLimit } from "./util/limiter";
import Player from "./classes/Player";
import logger from "./util/logger";

const decoder = new TextDecoder("utf-8");
const PORT = 9001;

const app = App();
app.rooms = new Map();

app.ws("/*", {
	idleTimeout: 0,
	maxBackpressure: 1024,
	maxPayloadLength: 512,

	compression: DEDICATED_COMPRESSOR_3KB,

	open: (ws) => {
		ws.player = new Player(ws);
		ws.send(JSON.stringify({ event: "connected", data: { id: ws.player.id } }));
		logger.debug(`Connected: ${ws.player.id}`);
	},

	close: (ws) => {
		const player = ws.player;
		logger.debug(`Disconnected: ${player.id}`);
		if (player.room) player.room.onPlayerLeave(player);
	},

	message: (ws, rawMessage) => {
		if (rateLimit(ws) || !ws.player) return;

		ws.send(rawMessage, true, true);

		let message: Message;
		try {
			message = JSON.parse(decoder.decode(rawMessage));
		} catch (err) {
			return;
		}

		handleCommand(message, ws, app);
	},
});

app.listen(PORT, (token) => {
	if (token) console.log(`Listening to port ${PORT}`);
});
