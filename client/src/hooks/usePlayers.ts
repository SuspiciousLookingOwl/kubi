import { useState } from "react";
import { IPlayer } from "interfaces";

interface UsePlayer {
	players: IPlayer[];
	updatePlayer: (id: string, player: Partial<IPlayer>) => void;
	getPlayer: (id: string) => IPlayer | undefined;
	setPlayers: (players: IPlayer[]) => void;
	resetPlayers: (resetScore?: boolean) => void;
}

export default (): UsePlayer => {
	const [players, setPlayers] = useState<IPlayer[]>([]);

	const updatePlayer: UsePlayer["updatePlayer"] = (id, player) => {
		const updatedPlayers = [...players];
		const index = updatedPlayers.findIndex((p) => p.id === id);
		if (index < 0) return;
		updatedPlayers[index] = { ...updatedPlayers[index], ...player };
		setPlayers(updatedPlayers);
	};

	const getPlayer: UsePlayer["getPlayer"] = (id) => {
		return players.find((p) => p.id === id);
	};

	const resetPlayers: UsePlayer["resetPlayers"] = (resetScore = false) => {
		const updatedPlayers = [...players];
		updatedPlayers.forEach((p) => {
			p.isCzar = false;
			if (resetScore) p.score = 0;
		});
		setPlayers(updatedPlayers);
	};

	return {
		players,
		setPlayers,
		updatePlayer,
		getPlayer,
		resetPlayers,
	};
};
