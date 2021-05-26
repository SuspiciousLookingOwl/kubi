import { promises as fs } from "fs";
import { BlackCard, WhiteCard, knex } from ".";

export default async (destroyConnection = false): Promise<void> => {
	// Drop all tables
	await Promise.all([
		knex.schema.dropTableIfExists("black_cards"),
		knex.schema.dropTableIfExists("white_cards"),
	]);

	// Create tables
	await Promise.all([
		knex.schema.createTable("black_cards", (table) => {
			table.increments("id").primary();
			table.string("content");
		}),
		knex.schema.createTable("white_cards", (table) => {
			table.increments("id").primary();
			table.string("content");
		}),
	]);

	// Read white and black cards content
	const [whitesRaw, blacksRaw] = await Promise.all([
		fs.readFile("./data/white.txt", "utf-8"),
		fs.readFile("./data/black.txt", "utf-8"),
	]);

	const blacks = blacksRaw.split(/\r?\n/).map((r) => ({ content: r }));
	const whites = whitesRaw.split(/\r?\n/).map((r) => ({ content: r }));

	// Insert white and black cards data to database
	const transaction = await knex.transaction();
	console.time("Data Imported");
	await Promise.all([
		BlackCard.query(transaction).insertGraph(blacks),
		WhiteCard.query(transaction).insertGraph(whites),
	]);
	await transaction.commit();
	console.timeEnd("Data Imported");

	console.log(`${blacks.length} black cards loaded`);
	console.log(`${whites.length} white cards loaded`);

	if (destroyConnection) await knex.destroy();
};
