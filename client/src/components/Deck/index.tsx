import React from "react";
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
			{cards.map((c, i) => (
				<Card
					key={i}
					size="sm"
					bottomHover={
						<React.Fragment>
							{showActions && (
								<button
									className="hover:bg-gray-100 py-2 font-medium text-center w-full rounded-b-xl"
									onClick={() => onCardSelect?.(c)}
								>
									Select
								</button>
							)}
						</React.Fragment>
					}
				>
					{c.content}
				</Card>
			))}
		</div>
	);
}

export default Deck;
