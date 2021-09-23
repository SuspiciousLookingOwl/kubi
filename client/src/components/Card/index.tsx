import React, { useState } from "react";
import "./Card.scss";

interface Props {
	variant?: "black" | "white";
	size?: "sm" | "lg";
	bottomHover?: JSX.Element;
}

function Card({
	variant = "white",
	size = "sm",
	bottomHover,
	children,
}: React.PropsWithChildren<Props>): JSX.Element {
	const [showBottom, setShowBottom] = useState(false);

	return (
		<div
			className={`card card-${size} card-${variant}`}
			onMouseEnter={() => setShowBottom(true)}
			onMouseLeave={() => setShowBottom(false)}
		>
			<div className="card-content">{children}</div>
			{bottomHover && showBottom ? (
				<div className="absolute bottom-0 w-full">{bottomHover}</div>
			) : undefined}
		</div>
	);
}

export default Card;
