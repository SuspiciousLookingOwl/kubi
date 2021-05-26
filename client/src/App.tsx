import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";

function App(): JSX.Element {
	return (
		<Router>
			<Switch>
				<Route exact path="/">
					<Home />
				</Route>
				<Route path="/:id">
					<Room />
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
