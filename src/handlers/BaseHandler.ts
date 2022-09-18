import { CacheContainer, ICachingOptions } from "node-ts-cache";

import Client from "../models/Client";
import { MemoryStorage } from "node-ts-cache-storage-memory";

type ClassConstructor = new (...args: any[]) => any;

export class BaseHandler<Holds extends ClassConstructor> {
	readonly #client: Client;
	readonly #cache: CacheContainer;
	readonly #holds: Holds;

	/**
	 * Config used for the handler
	 */
	public config: ICachingOptions;

	constructor(client: Client, holds: Holds, options?: Partial<ICachingOptions>) {
		this.config = {
			ttl: options?.ttl ?? 600,
			isLazy: options?.isLazy ?? true,
			isCachedForever: options?.isCachedForever ?? false,
			calculateKey: options?.calculateKey ?? JSON.stringify,
		};
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

	get<T extends unknown = unknown>(query: string): Promise<T | undefined> {
		return this.cache.getItem<T>(query);
	}

	set(key: string, content: unknown, config?: ICachingOptions): Promise<void> {
		return this.cache.setItem(key, content, config ?? this.config);
	}
}

export default BaseHandler;
