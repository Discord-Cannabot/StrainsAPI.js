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

	/**
	 * Recipe ID
	 */
	get id(): number {
		return this.raw.id;
	}

	/**
	 * Name of the Recipe
	 */
	get name(): string {
		return this.raw.name;
	}

	/**
	 * List of ingredients
	 */
	get ingredients(): string[] {
		return this.raw.ingredients;
	}

	/**
	 * List of steps in order
	 */
	get steps(): string[] {
		return this.raw.steps;
	}

	/**
	 * Image url for the recipe
	 */
	get image(): string {
		return this.raw.image;
	}
}

export default Recipe;
