import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { IPlayer, IRoomState, ICard } from "interfaces";
import { useChats, usePlayers, useWebSocket } from "hooks";
import ChatDrawer from "components/ChatDrawer";
import Card from "components/Card";
import Deck from "components/Deck";

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
	const [blackCard, setBlackCard] = useState("Loading...");
	const [cardSubmissions, setCardSubmissions] = useState<ICard[]>([]);
	const { players, setPlayers, updatePlayer, getPlayer, resetPlayers } = usePlayers();

	const { sendMessage, lastMessage } = useWebSocket();

	const self = useMemo(() => getPlayer(playerId), [playerId, getPlayer]);
	const sortedPlayers = useMemo(() => players.sort((a, b) => a.score - b.score), [players]);

	const title = useMemo(() => {
		if (state === State.WaitingForPlayers) {
			return "Waiting for players";
		} else if (state === State.StartCountdown) {
			return "Round starting...";
		} else if (state === State.WaitingForSubmission) {
			return self?.isCzar ? "You are a Czar! Wait for card submission" : "Select your card!";
		} else if (state === State.WaitingForSelection) {
			return self?.isCzar ? "Select a card" : "Wait for Czar to select a card";
		} else if (state === State.WaitingForNextRound) {
			return "Winner!";
		} else if (state === State.PostRound) {
			return "Starting next round...";
		} else if (state === State.PostGame) {
			return "Game ended...";
		}
		return "Please wait...";
	}, [state]);

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
			players = players.map((p) => ({
				...p,
				self: p.id === playerId,
			}));
			setPlayers(players);
			setState(state);
		},
		gameStarting() {
			setState(State.StartCountdown);
			pushChat("Game starting...");
		},
		gameEnded() {
			setState(State.PostGame);
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
			setState(State.PostRound);
			pushChat(`${player.name} win the round!`);
		},
		playerJoin(player: IPlayer) {
			pushChat(`${player.name} joined`);
		},
		playerLeave(player: IPlayer) {
			pushChat(`${player.name} left`);
		},
		whiteCards(cards: ICard[]) {
			setCards(cards);
		},
		playerNameChange({ id, name }: { id: string; name: string }) {
			const currentName = players.find((p) => p.id === id)?.name;
			updatePlayer(id, { name });
			pushChat(`${currentName} changed their name to ${name}`);
		},
	};

	return (
		<div className="h-screen flex">
			<div className="absolute w-64 px-4 py-2 ">
				<div className="font-medium text-2xl">{self?.name}</div>

				<hr className="my-2" />

				<div>
					{sortedPlayers.map((p, i) => (
						<div
							key={p.id}
							className={i === 0 ? "text-2xl" : i === 1 ? "text-xl" : i === 2 ? "text-lg" : ""}
						>
							{i + 1}. {p.name} - {p.score}
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-grow h-full justify-center">
				<div className="text-center space-y-32 my-12">
					<div className="text-5xl font-medium">{title}</div>

					<Card size="lg" variant="black">
						<span className="text-2xl">{blackCard}</span>
					</Card>

					<Deck cards={cards} showActions onCardSelect={onCardSelect} />
				</div>
			</div>
			<div className="w-96 max-h-full overflow-visible bg-gray-50">
				<ChatDrawer chats={chats} onSendChat={(c) => sendMessage("chat", c)} />
			</div>
		</div>
	);
}

export default Room;
