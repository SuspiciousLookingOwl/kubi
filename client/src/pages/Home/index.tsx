import React, { useState } from "react";
import { Box, Button, Divider, Grid, TextField, Typography } from "@material-ui/core";
import { Card } from "components";

function Home(): JSX.Element {
	const [name, setName] = useState("");
	const [room, setRoom] = useState("");

	return (
		<Grid
			container
			spacing={0}
			direction="column"
			alignItems="center"
			justify="center"
			style={{ minHeight: "100vh" }}
		>
			<Grid item>
				<Card size="lg">
					<Typography variant="h4" align="center">
						KUBI
					</Typography>
					<Box my={2}>
						<Divider />
					</Box>
					<Box my={3}>
						<TextField
							fullWidth
							label="Nama"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</Box>
					<Box my={3}>
						<TextField
							fullWidth
							label="ID Ruang"
							value={room}
							onChange={(e) => setRoom(e.target.value)}
						/>
					</Box>
					<Box my={4}>
						<Button variant="outlined">Masuk</Button>
					</Box>
				</Card>
			</Grid>
		</Grid>
	);
}

export default Home;
