import { Model } from "objection";

export default class BlackCard extends Model {
	id!: number;
	content!: string;

	static get tableName(): string {
		return "black_cards";
	}
}
