import { Model } from "objection";

export default class WhiteCard extends Model {
	id!: number;
	content!: string;

	static get tableName(): string {
		return "white_Cards";
	}
}
