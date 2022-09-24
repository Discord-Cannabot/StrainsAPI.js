import Base from "./Base";
import { DefaultStrainsAPIData } from "./Base";

/**
 * Raw Recipe data returned from StrainsAPI
 */
export interface RawRecipe extends DefaultStrainsAPIData {
	id: number;
	name: string;
	ingredients: string[];
	steps: string[];
	image: string;
}

/**
 * Represents a Recipe from StrainsAPI
 * @extends Base<RawRecipe>
 */
export class Recipe extends Base<RawRecipe> {
	/**
	 * @param data The data returned by the API
	 */
	constructor(data: RawRecipe) {
		super(data);
	}

	get id() {
		return this.raw.id;
	}

	get name() {
		return this.raw.name;
	}

	/**
	 * List of ingredients
	 */
	get ingredients() {
		return this.raw.ingredients;
	}

	/**
	 * List of steps in order
	 */
	get steps() {
		return this.raw.steps;
	}

	/**
	 * Image url for the recipe
	 */
	get image() {
		return this.raw.image;
	}
}

export default Recipe;
