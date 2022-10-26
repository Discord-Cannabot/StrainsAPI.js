import StrainsError, { StrainsAPIError } from "../errors/StrainsError";
import axios, { AxiosError, AxiosInstance } from "axios";

import { Agent } from "https";
import { ICachingOptions } from "node-ts-cache";
import { RecipeHandler } from "../handlers/RecipeHandler";
import StrainHandler from "../handlers/StrainHandler";

export interface BaseClientConfig {
	token: string;
}

export const StrainsTokenRegex = /^\$2[ayb]\$.{56}$/g;

/**
 * Base Client Strains API
 */
export class BaseClient {
	// Private to prevent overwriting
	readonly #instance: AxiosInstance;
	readonly #strains: StrainHandler;
	readonly #recipes: RecipeHandler;
	readonly #cacheConfig: ICachingOptions;
	public config: BaseClientConfig;

	/**
	 * @param token The bearer token used to interact with the cannabot api
	 * @param options Options to configure the Client with
	 */
	constructor(token: string, options?: Partial<ICachingOptions>) {
		if (typeof token !== "string") {
			throw new TypeError(
				`Invalid token type - Expected: string | Actual: ${typeof token}`
			);
		}

		if (!StrainsTokenRegex.test(token)) {
			throw new Error(`Invalid token: ${typeof token}`);
		}

		this.config = {
			token,
		};

		this.#cacheConfig = Object.assign(BaseClient.DefaultCacheConfig, options);
		this.#instance = axios.create({
			baseURL: "https://cannabot.net/api",
			headers: {
				authorization: `Bearer ${token}`,
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

		this.#strains = new StrainHandler(this, this.cacheConfig);
		this.#recipes = new RecipeHandler(this, this.cacheConfig);
	}

	/**
	 * Checks if an error is a strains API error
	 * @param error Error to check
	 * @internal
	 */
	protected static isStrainsError(error: any): error is AxiosError<StrainsAPIError> {
		if (!axios.isAxiosError(error)) return false;
		return !!error.response?.data;
	}

	/**
	 * Default Cache Config for Handlers
	 */
	public static DefaultCacheConfig: ICachingOptions = {
		ttl: 600,
		isLazy: true,
		isCachedForever: false,
		calculateKey: JSON.stringify,
	};

	/**
	 * The config used for caching api data
	 */
	get cacheConfig(): ICachingOptions {
		return this.#cacheConfig;
	}

	/**
	 * Sets the config caches
	 */
	set cacheConfig(options: Partial<ICachingOptions>) {
		Object.assign(this.#cacheConfig, options);
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
	 * @internal
	 */
	public get instance() {
		return this.#instance;
	}
}

export default BaseClient;
