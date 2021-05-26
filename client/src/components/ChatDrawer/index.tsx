import React, { useEffect, useRef, useState } from "react";
import {
	Box,
	Divider,
	Drawer,
	IconButton,
	InputAdornment,
	List,
	TextField,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import "./ChatDrawer.scss";

import ChatBubble from "./ChatBubble";
import { IChat } from "interfaces";

interface Props {
	chats: IChat[];
	onSendChat: (message: string) => void;
}

function ChatDrawer({ chats, onSendChat }: Props): JSX.Element {
	const [message, setMessage] = useState("");
	const bottomDrawer = useRef<HTMLDivElement>(null);
	const [isScrollBottom, setIsScrollBottom] = useState(true);

	const sendChatHandler = () => {
		if (!message) return;
		onSendChat(message);
		setMessage("");
	};

	useEffect(() => {
		if (!bottomDrawer?.current || !isScrollBottom) return;
		bottomDrawer.current.scrollIntoView();
	}, [chats]);

	return (
		<Drawer
			variant="permanent"
			open
			anchor="right"
			PaperProps={{
				className: "drawer chat-drawer",
				onScroll: (e) => {
					const el = e.target as HTMLElement;
					setIsScrollBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100);
				},
			}}
		>
			<List>
				{chats.map((c, i) => (
					<ChatBubble key={i} player={c.player} content={c.content} time={c.time} />
				))}
				<div ref={bottomDrawer} />
			</List>
			<div className="chat-input-field">
				<Divider />
				<Box p={1} borderLeft={1} borderColor="grey.300">
					<TextField
						fullWidth
						placeholder="Send a Message"
						variant="outlined"
						onChange={(e) => setMessage(e.target.value)}
						value={message}
						size="small"
						onKeyPress={(e) => {
							if (e.code === "Enter" || e.code === "NumpadEnter") sendChatHandler();
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={sendChatHandler}>
										<Send />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</Box>
			</div>
		</Drawer>
	);
}

export default ChatDrawer;
