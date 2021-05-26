import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IMessage<T = any> {
	event: string;
	data: T;
}

interface UseWebSocket {
	sendMessage: (command: string, data: unknown) => void;
	lastMessage: IMessage | null;
}

export default (): UseWebSocket => {
	const { sendMessage, lastMessage: rawLastMessage } = useWebSocket("ws://localhost:9001");
	const [lastMessage, setLastMessage] = useState<IMessage | null>(null);

	useEffect(() => {
		if (!rawLastMessage) return setLastMessage(null);
		try {
			setLastMessage(JSON.parse(rawLastMessage.data));
		} catch {
			// Not a recognizable message
		}
	}, [rawLastMessage]);

	const send: UseWebSocket["sendMessage"] = (command, data) => {
		sendMessage(JSON.stringify({ command, data }));
	};

	return {
		sendMessage: send,
		lastMessage,
	};
};
