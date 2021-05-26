import "uWebSockets.js";
import { Room, Player } from "../src/classes";

declare module "uWebSockets.js" {
	interface WebSocket {
		player: Player;
	}

	interface TemplatedApp {
		rooms: Map<string, Room>;
	}
}
