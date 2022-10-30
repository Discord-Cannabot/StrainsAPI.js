import BaseHandler from "./BaseHandler";
import Client from "../client/BaseClient";
import { ICachingOptions } from "node-ts-cache";
import { RawRecipe } from "../models/Recipe";
import Recipe from "../models/Recipe";

export interface RecipeSearchParams {
	id: number;
}

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
	 * Filter strains using the API
	 * @param params Params to filter strains for
	 * @param force Force an API request and update the cache
	 */
	async filter(params: RecipeSearchParams, force: boolean = false) {
		let recipes = await this.cache.getItem<Recipe[]>(JSON.stringify(params, null, 0));
		if (recipes && !force) return recipes;
		recipes = [];

		const { data } = await this.client.instance.get<RawRecipe[]>("recipes", {
			params,
		});

		for (const recipe of data) {
			recipes.push(new Recipe(recipe));
		}

		this.set(JSON.stringify(params, null, 0), recipes, this.config);
		return recipes;
	}

	/**
	 * Search for a recipe by Id
	 * @param id Id of the recipe
	 * @param force Force an API request and update the cache
	 */
	async byId(id: number, force: boolean = false) {
		return await this.filter({ id }, force);
	}
}
