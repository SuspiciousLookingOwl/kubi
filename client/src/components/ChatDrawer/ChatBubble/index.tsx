import React from "react";
import { Box, ListItem, ListItemText, Paper, Typography } from "@material-ui/core";
import "./ChatBubble.scss";

import { IChat } from "interfaces";

function ChatBubble({ player, content, time }: IChat): JSX.Element {
	return (
		<ListItem dense alignItems="flex-start">
			<ListItemText
				primary={
					player ? (
						<React.Fragment>
							<Box mr={1} display="inline">
								<b>{player.name}</b>
							</Box>
							<Typography component="span" variant="caption" display="inline" color="textSecondary">
								{time.toTimeString().split(" ")[0]}
							</Typography>
						</React.Fragment>
					) : undefined
				}
				secondaryTypographyProps={{ component: "span" }}
				secondary={
					player ? (
						<Paper className="chat-bubble" elevation={0}>
							<Typography component="span" variant="body2" color="textPrimary">
								{content}
							</Typography>
						</Paper>
					) : (
						<Typography component="span" variant="body2" color="textPrimary">
							<b>{content}</b>
						</Typography>
					)
				}
			/>
		</ListItem>
	);
}

export default ChatBubble;
