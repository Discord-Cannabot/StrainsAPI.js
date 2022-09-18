import BaseHandler from "./BaseHandler";
import Client from "../client/BaseClient";
import { ICachingOptions } from "node-ts-cache";
import { RawRecipe } from "../models/Recipe";
import Recipe from "../models/Recipe";

export enum RECIPE_SEARCH_BY {
	Id = "id",
}

export type RecipeSearchBy = `${RECIPE_SEARCH_BY}`;

/**
 * Handles recipes for the Client with cache
 * @extends BaseHandler<Recipe>
 */
export class RecipeHandler extends BaseHandler<typeof Recipe> {
	/**
	 * @param client Client attached to the handler
	 * @param options Options for the handler
	 */
	constructor(client: Client, options?: ICachingOptions) {
		super(client, Recipe, options);
	}

	/**
	 * Returns all recipes stored in the database
	 * @param force Force an API request and update the cache
	 */
	async all(force: boolean = false) {
		const recipes = (await this.get<Recipe[]>("all")) ?? [];
		if (recipes.length > 0 && !force) return recipes;
		const { data } = await this.client.instance.get<RawRecipe[]>("recipes");

		for (const rawRecipe of data) {
			recipes.push(new Recipe(rawRecipe));
		}
		await this.set("all", recipes);
		return recipes;
	}

	/**
	 * Search for a recipe
	 * @param by What to search by
	 * @param query Search query
	 * @param force Force an API request and update the cache
	 */
	async search(by: RecipeSearchBy, query: string, force: boolean = false) {
		let recipes = await this.cache.getItem<Recipe[]>(query);
		if (recipes && !force) return recipes;
		recipes = [];

		const { data } = await this.client.instance.get<RawRecipe[]>(
			`recipes/search/${by}/${query}`
		);

		for (let rawRecipe of data) {
			const recipe = new Recipe(rawRecipe);
			recipes.push(recipe);
		}

		this.set(query, recipes);
		return recipes;
	}

	/**
	 * Search for a recipe by Id
	 * @param id Id of the recipe
	 * @param force Force an API request and update the cache
	 */
	async byId(id: number, force: boolean = false) {
		return await this.search(RECIPE_SEARCH_BY.Id, `${id}`, force);
	}
}
