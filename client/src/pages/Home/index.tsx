import Card from "components/Card";
import React, { useState } from "react";

function Home(): JSX.Element {
	const [name, setName] = useState("");
	const [room, setRoom] = useState("");

	return (
		<div className="h-screen w-screen">
			<div className="flex h-full justify-center items-center">
				<Card size="lg">
					<div className="text-center font-semibold text-3xl my-2">Kubi</div>
					<hr className="my-4" />
					<div className="space-y-8">
						<div>
							<div className="font-medium text-lg">Name</div>
							<input
								type="text"
								className="border-b border-black w-full h-10 focus:outline-none"
								placeholder="Biadab"
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div>
							<div className="font-medium text-lg">Room ID</div>
							<input
								type="text"
								className="border-b border-black w-full h-10 focus:outline-none"
								placeholder="ABCD123"
								onChange={(e) => setRoom(e.target.value)}
							/>
						</div>
						<button className="px-6 py-1 border font-medium text-lg border-black">Join</button>
					</div>
				</Card>
			</div>
		</div>
	);
}

export default Home;
