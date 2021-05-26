import React from "react";
import { Button, Grid, Icon } from "@material-ui/core";
import { Done } from "@material-ui/icons";
import "./Deck.scss";

import { ICard } from "interfaces";
import Card from "../Card";

interface Props {
	cards: ICard[];
	showActions: boolean;
	onCardSelect?: (card: ICard) => void;
}

function Deck({ cards, onCardSelect, showActions = false }: Props): JSX.Element {
	return (
		<div className="deck">
			<Grid container justify="center">
				{cards.map((c, i) => (
					<Grid item key={i}>
						<Card
							size="sm"
							bottomHover={
								showActions ? (
									<Button
										fullWidth
										variant="text"
										style={{ textAlign: "center" }}
										onClick={() => {
											if (onCardSelect) onCardSelect(c);
										}}
									>
										<Icon className="card-icon">
											<Done />
										</Icon>
									</Button>
								) : undefined
							}
						>
							{c.content}
						</Card>
					</Grid>
				))}
			</Grid>
		</div>
	);
}

export default Deck;
