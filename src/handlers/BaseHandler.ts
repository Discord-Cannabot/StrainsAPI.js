import { CacheContainer, ICachingOptions } from "node-ts-cache";

import Client from "../client/BaseClient";
import { MemoryStorage } from "node-ts-cache-storage-memory";

type ClassConstructor = new (...args: any[]) => any;

/**
 * Base Handler that other handlers will extend
 * @template Holds The structure this handler holds for type hinting
 */
export class BaseHandler<Holds extends ClassConstructor> {
	readonly #client: Client;
	readonly #cache: CacheContainer;
	readonly #holds: Holds;

	/**
	 * Config used for the handler
	 */
	public config: ICachingOptions;

	/**
	 * @param client Client attached to the handler
	 * @param holds The Class this object handles
	 * @param options Options for the cache
	 */
	constructor(client: Client, holds: Holds, options?: Partial<ICachingOptions>) {
		this.config = Object.assign(client.cacheConfig, options);
		this.#client = client;
		this.#holds = holds;
		this.#cache = new CacheContainer(new MemoryStorage());
	}

	/**
	 * The Client the Handler is attached to
	 */
	get client() {
		return this.#client;
	}

	/**
	 * The Handler's Cache
	 */
	get cache() {
		return this.#cache;
	}

	/**
	 * The Model this Handler holds
	 */
	get holds() {
		return this.#holds;
	}

	async get<T extends unknown = InstanceType<Holds>>(query: string): Promise<T | null> {
		return (await this.cache.getItem<T>(query)) ?? null;
	}

	async set<T extends unknown = InstanceType<Holds>>(
		key: string,
		content: T,
		config?: ICachingOptions
	): Promise<void> {
		return await this.cache.setItem(key, content, config ?? this.config);
	}
}

export default BaseHandler;
