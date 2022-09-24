import StrainsError, { StrainsAPIError } from "../Errors/StrainsError";
import axios, { AxiosError, AxiosInstance } from "axios";

import { Agent } from "https";
import { ICachingOptions } from "node-ts-cache";
import { RecipeHandler } from "../handlers/RecipeHandler";
import StrainHandler from "../handlers/StrainHandler";

/**
 * Base Client Strains API
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

		// Handle API errors
		this.#instance.interceptors.response.use(
			(success) => success,
			(error) => {
				if (!BaseClient.isStrainsError(error)) throw error;
				//console.log(error.response?.data ?? error.response);
				throw new StrainsError(error);
			}
		);

		this.#strains = new StrainHandler(this, options);
		this.#recipes = new RecipeHandler(this, options);
	}

	/**
	 * Checks if an error is a strains API error
	 * @param error Error to check
	 */
	static isStrainsError(error: any): error is AxiosError<StrainsAPIError> {
		if (!axios.isAxiosError(error)) return false;
		return !!error.response?.data;
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
