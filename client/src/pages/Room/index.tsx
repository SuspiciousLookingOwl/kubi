import React, { useEffect, useState } from "react";
import { Grid, Box, Typography } from "@material-ui/core";
import { useParams } from "react-router-dom";
import "./Root.scss";

import { Card, Deck, ChatDrawer, PlayersDrawer } from "components";
import { IPlayer, IRoomState, ICard } from "interfaces";
import { useChats, usePlayers, useWebSocket } from "hooks";

interface RoundStartEvent {
	id: number;
	content: string;
	czar: string;
}

enum State {
	WaitingForPlayers = 1,
	StartCountdown = 2,
	WaitingForSubmission = 3,
	WaitingForSelection = 4,
	WaitingForNextRound = 5,
	PostRound = 6,
	PostGame = 7,
}

function Room(): JSX.Element {
	const { id: roomId } = useParams<{ id: string }>();
	const [playerId, setPlayerId] = useState("");
	const [chats, pushChat] = useChats();
	const [cards, setCards] = useState<ICard[]>([]);
	const [state, setState] = useState<State>(1);
	const [blackCard, setBlackCard] = useState("");
	const [cardSubmissions, setCardSubmissions] = useState<ICard[]>([]);
	const { players, setPlayers, updatePlayer, getPlayer, resetPlayers } = usePlayers();

	const { sendMessage, lastMessage } = useWebSocket();

	useEffect(() => {
		sendMessage("joinRoom", roomId);
	}, []);

	useEffect(() => {
		if (!lastMessage) return;
		const { event, data } = lastMessage;
		if (event in eventHandler) eventHandler[event as keyof typeof eventHandler](data);
	}, [lastMessage]);

	const getCzar = () => {
		return players.find((p) => p.isCzar);
	};

	const onCardSelect = (card: ICard) => {
		sendMessage("submitCard", card.id);
	};

	const onCzarCardSelect = (card: ICard) => {
		sendMessage("czarSelect", card.id);
	};

	const onNameChange = (name: string) => {
		sendMessage("changeName", name);
	};

	const eventHandler = {
		connected({ id }: { id: string }) {
			setPlayerId(id);
		},
		chat({ from, content }: { from: string; content: string }) {
			const player = players.find((p) => p.id === from);
			if (!player) return;
			pushChat({ player, content });
		},
		roomState({ state, players }: IRoomState) {
			setPlayers(players);
			setState(state);
		},
		gameStarting() {
			setState(State.StartCountdown);
			pushChat("Game starting...");
		},
		gameEnded() {
			pushChat("Game ended...");
		},
		roundStart({ content, czar: czarId }: RoundStartEvent) {
			setBlackCard(content.replace("_", "_____"));
			const czar = players.find((p) => p.id === czarId);

			pushChat(`Round Started. ${czar?.name} is the czar`);
			resetPlayers();
			updatePlayer(czarId, { isCzar: true });
			setState(State.WaitingForSubmission);
		},
		roundSelection(cards: ICard[]) {
			pushChat("Selection Stage!");
			setCardSubmissions(cards);
			setState(State.WaitingForSelection);
		},
		czarSelect({ id }: IPlayer) {
			const player = players.find((p) => p.id === id);
			if (!player) return;
			pushChat(`${player.name} win the round!`);
		},
		playerJoin(player: IPlayer) {
			pushChat({ content: `${player.name} joined` });
		},
		whiteCards(cards: ICard[]) {
			setCards(cards);
		},
		playerNameChange({ id, name }: { id: string; name: string }) {
			updatePlayer(id, { name });
		},
	};

	return (
		<div className="root">
			<nav className="drawer">
				<PlayersDrawer players={players} onNameChange={onNameChange} />
			</nav>
			<Grid container justify="center" alignItems="center">
				{state === State.WaitingForSelection ? (
					<React.Fragment>
						<Typography variant="h4">Waiting for {getCzar()?.name} to Select a Card</Typography>
						<Box width={1} display="flex" justifyContent="center">
							<Card size="lg" variant="black">
								{blackCard}
							</Card>
						</Box>
						<Deck
							cards={cardSubmissions}
							showActions={!!getPlayer(playerId)?.isCzar}
							onCardSelect={onCzarCardSelect}
						/>
					</React.Fragment>
				) : (
					<React.Fragment>
						<Box width={1} display="flex" justifyContent="center">
							<Card size="lg" variant="black">
								{blackCard}
							</Card>
						</Box>
						<Deck cards={cards} showActions onCardSelect={onCardSelect} />
					</React.Fragment>
				)}
			</Grid>
			<nav className="drawer">
				<ChatDrawer chats={chats} onSendChat={(msg) => sendMessage("chat", msg)} />
			</nav>
		</div>
	);
}

export default Room;
