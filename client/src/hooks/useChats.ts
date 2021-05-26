import { useState } from "react";

import { IChat } from "interfaces";

type PushChat = (chat: Omit<IChat, "time"> | string) => void;

export default (limit = 255): [IChat[], PushChat] => {
	const [chats, setChats] = useState<IChat[]>([]);

	const pushChat: PushChat = (chat) => {
		const newChats = [
			...chats,
			typeof chat === "string"
				? { content: chat, time: new Date() }
				: { ...chat, time: new Date() },
		];
		setChats(newChats.slice(Math.max(newChats.length - limit, 0)));
	};

	return [chats, pushChat];
};
