import React from "react";
import "./ChatBubble.scss";

import { IGroupedChat } from "interfaces";

function ChatBubble({ player, contents, time }: IGroupedChat): JSX.Element {
	return (
		<div className={`flex ${player?.self ? "justify-end" : !player ? "justify-center" : ""}`}>
			{player ? (
				<div>
					{!player.self && <div className="text-sm text-gray-700">{player.name}</div>}
					<div className="">
						{contents.map((c, i) => (
							<div
								key={i}
								className={`chat-bubble ${player.self ? "self-chat-bubble" : "other-chat-bubble"}`}
							>
								{c}
							</div>
						))}
					</div>
					<div className="text-xs px-1 text-gray-500">{time.toLocaleTimeString()}</div>
				</div>
			) : (
				<div className="text-center my-1">
					<div className="font-medium">{contents[0]}</div>
					{/* <div className="text-xs px-1 text-gray-500">{time.toLocaleTimeString()}</div> */}
				</div>
			)}
		</div>
	);
}

export default ChatBubble;
