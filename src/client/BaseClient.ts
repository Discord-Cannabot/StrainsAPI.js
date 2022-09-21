import axios, { AxiosInstance } from "axios";

import { Agent } from "https";
import { ICachingOptions } from "node-ts-cache";
import { RecipeHandler } from "../handlers/RecipeHandler";
import StrainHandler from "../handlers/StrainHandler";

/**
 * Base Client for the Discord Bot
 */
export class BaseClient {
	// Private to prevent overwriting
	readonly #instance: AxiosInstance;
	readonly #strains: StrainHandler;
	readonly #recipes: RecipeHandler;

	/**
	 * @param bearer The bearer token used to interact with the cannabot api
	 */
	constructor(bearer: string, options?: ICachingOptions) {
		this.#instance = axios.create({
			baseURL: "https://cannabot.net/api",
			headers: {
				authorization: `Bearer ${bearer}`,
			},
			httpsAgent: new Agent({ keepAlive: true }),
		});

		this.#strains = new StrainHandler(this, options);
		this.#recipes = new RecipeHandler(this, options);
	}

	/**
	 * Strain handler for the Client
	 */
	public get strains() {
		return this.#strains;
	}

	/**
	 * Recipe handler for the Client
	 */
	public get recipes() {
		return this.#recipes;
	}

	/**
	 * The Axios Instance used to make requests
	 */
	public get instance() {
		return this.#instance;
	}
}

export default BaseClient;
