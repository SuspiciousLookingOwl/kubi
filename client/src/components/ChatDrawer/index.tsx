import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatDrawer.scss";

import ChatBubble from "./ChatBubble";
import { IChat, IGroupedChat } from "interfaces";

interface Props {
	chats: IChat[];
	onSendChat: (message: string) => void;
}

function ChatDrawer({ chats, onSendChat }: Props): JSX.Element {
	const [message, setMessage] = useState("");
	const bottomDrawer = useRef<HTMLDivElement>(null);
	const [isScrollBottom, setIsScrollBottom] = useState(true);
	// const [groupedChat, setGroupedChat] = useState<IGroupedChat[]>([]);

	const groupedChats = useMemo(() => {
		return chats.reduce((g, c) => {
			const last = g[g.length - 1];
			if (!last) {
				g.push({
					player: c.player,
					contents: [c.content],
					time: c.time,
				});
			} else {
				if (c.player && last.player === c.player) {
					last.contents.push(c.content);
					last.time = c.time;
				} else {
					g.push({
						player: c.player,
						contents: [c.content],
						time: c.time,
					});
				}
			}
			return g;
		}, [] as IGroupedChat[]);
	}, [chats]);

	const sendChatHandler = () => {
		if (!message) return;
		onSendChat(message);
		setMessage("");
	};

	useEffect(() => {
		if (!bottomDrawer?.current || !isScrollBottom) return;
		bottomDrawer.current.scrollIntoView();
	}, [groupedChats]);

	return (
		<div
			className="chat-drawer"
			onScroll={(e) => {
				const el = e.target as HTMLElement;
				setIsScrollBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100);
			}}
		>
			{groupedChats.map((c, i) => (
				<ChatBubble key={i} player={c.player} contents={c.contents} time={c.time} />
			))}
			<div ref={bottomDrawer} />
			<input
				className="chat-input-field"
				placeholder="Send a Message"
				onChange={(e) => setMessage(e.target.value)}
				value={message}
				onKeyPress={(e) => {
					if (e.code === "Enter" || e.code === "NumpadEnter") sendChatHandler();
				}}
			/>
		</div>
	);
}

export default ChatDrawer;
