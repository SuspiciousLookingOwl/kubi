import React from "react";
import {
	Grid,
	Icon,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	Typography,
} from "@material-ui/core";
import { EmojiEvents } from "@material-ui/icons";
import { IPlayer } from "interfaces";

interface Props {
	player: IPlayer;
}

function ListPlayer({ player }: Props): JSX.Element {
	return (
		<ListItem button>
			<ListItemText primary={player.name} />
			<ListItemSecondaryAction>
				<Grid container direction="row" alignItems="center" spacing={1}>
					{player.score ? (
						<React.Fragment>
							<Grid item>
								<Icon>
									<EmojiEvents />
								</Icon>
							</Grid>
							<Grid item>
								<Typography variant="body2">{player.score}</Typography>
							</Grid>
						</React.Fragment>
					) : undefined}
				</Grid>
			</ListItemSecondaryAction>
		</ListItem>
	);
}

export default ListPlayer;
