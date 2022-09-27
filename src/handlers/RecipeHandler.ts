import BaseHandler from "./BaseHandler";
import Client from "../client/BaseClient";
import { ICachingOptions } from "node-ts-cache";
import { RawRecipe } from "../models/Recipe";
import Recipe from "../models/Recipe";

/**
 * Values you can search recipes by
 */
export enum SearchRecipeBy {
	ID = "id",
}

/**
 * Term used to narrow search
 */
export type RecipeSearchTerm = `${SearchRecipeBy}`;

/**
 * Handles recipes for the Client with cache
 * @extends BaseHandler<Recipe>
 */
export class RecipeHandler extends BaseHandler<typeof Recipe> {
	/**
	 * @param client Client attached to the handler
	 * @param options Options for the handler
	 */
	constructor(client: Client, options?: Partial<ICachingOptions>) {
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

		for (const recipe of data) {
			recipes.push(new Recipe(recipe));
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
	async search(by: RecipeSearchTerm, query: string, force: boolean = false) {
		let recipes = await this.cache.getItem<Recipe[]>(query);
		if (recipes && !force) return recipes;
		recipes = [];

		const { data } = await this.client.instance.get<RawRecipe[]>(
			`recipes/search/${by}/${query}`
		);

		for (const recipe of data) {
			recipes.push(new Recipe(recipe));
		}

		await this.set(query, recipes);
		return recipes;
	}

	/**
	 * Search for a recipe by Id
	 * @param id Id of the recipe
	 * @param force Force an API request and update the cache
	 */
	async byId(id: number, force: boolean = false) {
		return await this.search(SearchRecipeBy.ID, `${id}`, force);
	}
}
