import Player from "./Player";

interface Chat {
	player?: Player;
	content: string;
	time: Date;
}

export default Chat;
