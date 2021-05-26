import Knex from "knex";
import { Model } from "objection";

// Initialize knex.
const knex = Knex({
	client: "sqlite3",
	useNullAsDefault: true,
	connection: {
		filename: "kubi.db",
	},
});

Model.knex(knex);

export default knex;
