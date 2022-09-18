import Base from "./Base";

export interface RawRecipe {
	id: number;
	name: string;
	ingredients: string;
	description: string;
	image: string;
	created_at: string;
	updated_at: string;
}

/**
 * Represents a Recipe from Cannabot.net
 */
export class Recipe extends Base<RawRecipe> {
	constructor(data: RawRecipe) {
		super(data);
	}

	get id() {
		return this.raw.id;
	}

	get name() {
		return this.raw.name;
	}

	get ingredients() {
		return this.raw.ingredients.replace(/,(?=[^\d\s])/g, ", ").split(/,(?=\d)/g);
	}

	get description() {
		return this.raw.description;
	}

	get image() {
		return this.raw.image;
	}
}

export default Recipe;
