import { commandMap } from "./commandHandler";

export interface Message {
	command: keyof typeof commandMap;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
}
