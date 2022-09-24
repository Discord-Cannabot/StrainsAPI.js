import { RawStrain, Strain, StrainRaceType } from "../models/Strain";

import BaseHandler from "./BaseHandler";
import Client from "../client/BaseClient";
import { ICachingOptions } from "node-ts-cache";

/**
 * Terms you can search for strains by
 */
export enum SearchStrainBy {
	NAME = "name",
	ID = "id",
	RACE = "race",
	RATING = "rating",
}

export type StrainSearchTerm = `${SearchStrainBy}`;

export interface StrainSearchParams {
	race?: StrainRaceType;
	rating?: number;
	name?: string;
}

/**
 * Handles Strains for the Client with a cache
 * @extends BaseHandler<Strain>
 */
class StrainHandler extends BaseHandler<typeof Strain> {
	/**
	 * @param client Client attached to the handler
	 * @param options Options for the cache
	 */
	constructor(client: Client, options?: ICachingOptions) {
		super(client, Strain, options);
	}

	/**
	 * Returns all strains in the Database
	 * @param force Force an API request and update the cache
	 * @returns Array of Strains
	 */
	async all(force: boolean = false) {
		const strains = (await this.get<Strain[]>("all")) ?? [];
		if (strains.length > 0 && !force) return strains;
		const { data } = await this.client.instance.get<RawStrain[]>("strains");

		for (const strain of data) {
			strains.push(new Strain(strain));
		}
		await this.set("all", strains);
		return strains;
	}

	/**
	 * Search for a strain by keys
	 * @param by What to search by
	 * @param query The query for the search
	 * @param force Force an API request and update the cache
	 * @returns Array of Strains
	 */
	async search(by: StrainSearchTerm, query: string, force: boolean = false) {
		let strains = await this.cache.getItem<Strain[]>(query);
		if (strains && !force) return strains;
		strains = [];

		const { data } = await this.client.instance.get<RawStrain[]>(
			`strains/search/${by}/${query}`
		);

		for (const strain of data) {
			strains.push(new Strain(strain));
		}

		this.set(query, strains);
		return strains;
	}

	/**
	 * Filter strains using the API
	 * @param params Params to filter strains for
	 * @param force Force an API request and update the cache
	 */
	async filter(params: StrainSearchParams, force: boolean = false) {
		let strains = await this.cache.getItem<Strain[]>(JSON.stringify(params, null, 0));
		if (strains && !force) return strains;
		strains = [];

		const { data } = await this.client.instance.get<RawStrain[]>("strains/search", {
			params,
		});

		for (const strain of data) {
			strains.push(new Strain(strain));
		}

		this.set(JSON.stringify(params, null, 0), strains, this.config);
		return strains;
	}

	/**
	 * Search for strain by name
	 * @param name Name of the strain
	 * @param force Force an API request and update the cache
	 */
	async byName(name: string, force: boolean = false): Promise<Strain[]> {
		return await this.search(SearchStrainBy.NAME, name, force);
	}

	/**
	 * Search for a strain by ID
	 * @param id Id of the strain
	 * @param force Force an API request and update the cache
	 */
	async byId(id: number, force: boolean = false): Promise<Strain[]> {
		return await this.search(SearchStrainBy.ID, `${id}`, force);
	}

	/**
	 * Search for a strain by rating
	 * @param rating Rating of the Strain
	 * @param force Force an API request and update the cache
	 */
	async byRating(rating: number, force: boolean = false): Promise<Strain[]> {
		return await this.search(SearchStrainBy.RATING, `${rating}`, force);
	}

	/**
	 * Search for a strain by race
	 * @param race Race to search for (`indica` | `sativa` | `hybrid`)
	 * @param force Force an API request and update the cache
	 */
	async byRace(race: StrainRaceType, force: boolean = false): Promise<Strain[]> {
		return await this.search(SearchStrainBy.RACE, race, force);
	}
}

export default StrainHandler;
