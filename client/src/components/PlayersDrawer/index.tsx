import React, { useState } from "react";
import {
	List,
	Drawer,
	Box,
	ListItem,
	Divider,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Modal,
	TextField,
	Typography,
	Button,
} from "@material-ui/core";
import { Create } from "@material-ui/icons";
import "./PlayersDrawer.scss";

import ListPlayer from "./ListPlayer";
import { IPlayer } from "interfaces";

interface Props {
	players: IPlayer[];
	onNameChange: (name: string) => void;
}

function PlayersDrawer({ players, onNameChange }: Props): JSX.Element {
	const [name, setName] = useState("Biadab");
	const [open, setOpen] = useState(false);

	const nameChangeHandler = () => {
		localStorage.setItem("name", name);
		onNameChange(name);
		setOpen(false);
	};

	return (
		<Drawer variant="permanent" open PaperProps={{ className: "drawer" }}>
			<Modal open={open} onClose={() => nameChangeHandler()} className="modal">
				<div className="modal-content">
					<Box py={1}>
						<Typography variant="h6">Change Name:</Typography>
					</Box>
					<TextField
						variant="outlined"
						fullWidth
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyPress={(e) => {
							if (e.code === "Enter" || e.code === "NumpadEnter") nameChangeHandler();
						}}
					/>
					<Box py={2}>
						<Button variant="outlined" onClick={nameChangeHandler}>
							Change
						</Button>
					</Box>
				</div>
			</Modal>
			<List>
				<ListItem>
					<ListItemText primary={`Hi, ${name}`} />
					<ListItemSecondaryAction>
						<IconButton edge="end" onClick={() => setOpen(true)}>
							<Create />
						</IconButton>
					</ListItemSecondaryAction>
				</ListItem>
			</List>
			<Divider />
			<Box display="flex" height="100%" alignItems="center">
				<Box width="100%">
					<List>
						{players.map((p) => (
							<ListPlayer key={p.id} player={p} />
						))}
					</List>
				</Box>
			</Box>
		</Drawer>
	);
}

export default PlayersDrawer;
