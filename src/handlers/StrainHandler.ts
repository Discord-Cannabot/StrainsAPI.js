import { RawStrain, Strain, StrainRace } from "../models/Strain";

import BaseHandler from "./BaseHandler";
import Client from "../client/BaseClient";
import { ICachingOptions } from "node-ts-cache";

export enum STRAIN_SEARCH_BY {
	Name = "name",
	Id = "id",
	Race = "race",
	Rating = "rating",
}

export type StrainSearchBy = `${STRAIN_SEARCH_BY}`;

/**
 * Handles Strains for the Client with a cache
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

		for (const rawStrain of data) {
			strains.push(new Strain(rawStrain));
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
	async search(by: StrainSearchBy, query: string, force: boolean = false) {
		let strains = await this.cache.getItem<Strain[]>(query);
		if (strains && !force) return strains;
		strains = [];

		const { data } = await this.client.instance.get<RawStrain[]>(
			`strains/search/${by}/${query}`
		);

		for (let rawStrain of data) {
			const strain = new Strain(rawStrain);
			strains.push(strain);
		}

		this.set(query, strains);
		return strains;
	}

	/**
	 * Search for strain by name
	 * @param name Name of the strain
	 * @param force Force an API request and update the cache
	 */
	async byName(name: string, force: boolean = false): Promise<Strain[]> {
		return await this.search(STRAIN_SEARCH_BY.Name, name, force);
	}

	/**
	 * Search for a strain by ID
	 * @param id Id of the strain
	 * @param force Force an API request and update the cache
	 */
	async byId(id: number, force: boolean = false): Promise<Strain[]> {
		return await this.search(STRAIN_SEARCH_BY.Id, `${id}`, force);
	}

	/**
	 * Search for a strain by rating
	 * @param rating Rating of the Strain
	 * @param force Force an API request and update the cache
	 */
	async byRating(rating: number, force: boolean = false): Promise<Strain[]> {
		return await this.search(STRAIN_SEARCH_BY.Rating, `${rating}`, force);
	}

	/**
	 * Search for a strain by race
	 * @param race Race to search for (`indica` | `sativa` | `hybrid`)
	 * @param force Force an API request and update the cache
	 */
	async byRace(race: StrainRace, force: boolean = false): Promise<Strain[]> {
		return await this.search(STRAIN_SEARCH_BY.Race, race, force);
	}
}

export default StrainHandler;
