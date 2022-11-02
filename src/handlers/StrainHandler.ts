import { RawStrain, Strain, StrainRaceType } from "../models/Strain";

import BaseHandler from "./BaseHandler";
import Client from "../client/BaseClient";
import { ICachingOptions } from "node-ts-cache";
import { assert } from "console";

export interface StrainSearchParams {
	name?: string;
	description?: string;
	race?: StrainRaceType;
	rating?: number;
	minRating?: number;
	maxRating?: number;
	effects?: string[];
	flavours?: string[];
	flavors?: string[];
}

/**
 * Validates that a parent string array includes every string from the child array
 * @param array Parent array
 * @param values Child array
 * @param caseSensitive Should the array (Default: false)
 * @returns boolean
 */
export function includesAll(
	array: string[],
	values: string[],
	caseSensitive: boolean = false
): boolean {
	for (const value of values) {
		if (
			array.findIndex((item) =>
				caseSensitive ? item === value : new RegExp(`^${value}$`, "i").test(item)
			) === -1
		)
			return false;
	}
	return true;
}

/**
 * Handles Strains for the Client with a cache
 * @extends BaseHandler<Strain>
 */
export class StrainHandler extends BaseHandler<typeof Strain> {
	/**
	 * @param client Client attached to the handler
	 * @param options Options for the cache
	 */
	constructor(client: Client, options?: Partial<ICachingOptions>) {
		super(client, Strain, options);
	}

	/**
	 * Returns all strains in the Database
	 * @param force Force an API request and update the cache
	 */
	async all(force: boolean = false): Promise<Strain[]> {
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
	 * Filter strains using the API
	 * @param params Params to filter strains for
	 * @param params.name Name of the strain
	 * @param params.race "indica" | "sativa" | "hybrid"
	 * @param params.description A string value in the description to filter by
	 * @param params.rating The exact rating of the strain (0-5). No higher, no lower
	 * @param params.minRating The minimum rating for the strains (0-5)
	 * @param params.maxRating The maximum rating for the strains (0-5)
	 * @param params.effects Effects of the strain
	 * @param params.flavours Flavours of the strain
	 * @param params.flavors Flavors of the strain (Alias)
	 * @param force Force an API request and update the cache
	 */
	async filter(params: StrainSearchParams, force: boolean = false): Promise<Strain[]> {
		let strains = await this.all(force);
		if (!params) return strains;
		const {
			name,
			description,
			race,
			rating,
			minRating,
			maxRating,
			effects,
			flavors,
			flavours,
		} = params;

		if (name && typeof name === "string") {
			const regex = new RegExp(name, "gi");
			strains = strains.filter((strain) => regex.test(strain.name));
		}

		if (typeof rating === "number") {
			if (rating < 0 || rating > 5) return [];
			strains = strains.filter((strain) => strain.rating === rating);
		}

		if (race && typeof race === "string") {
			const regex = new RegExp(race, "gi");
			strains = strains.filter((strain) => regex.test(strain.race));
		}

		if (description && typeof description === "string") {
			const regex = new RegExp(description);
			strains = strains.filter((strain) => regex.test(strain.description));
		}

		if (typeof maxRating === "number" && maxRating < 5) {
			const max = maxRating; // to appease typesaftey in callback
			strains = strains.filter((strain) => strain.rating <= max);
		}

		if (typeof minRating === "number" && minRating > 0) {
			const min = minRating; // to appease typesaftey in callback
			strains = strains.filter((strain) => strain.rating >= min);
		}

		if (effects) {
			strains = strains.filter((strain) => includesAll(strain.effects, effects));
		}

		if (flavours || flavors) {
			let both: string[] = [];
			if (flavours) both = both.concat(flavours);
			if (flavors) both = both.concat(flavors);
			both = [...new Set(both)];

			strains = strains.filter((strain) => includesAll(strain.effects, both));
		}

		return strains;
	}

	/**
	 * Search for strain by name
	 * @param name Name of the strain
	 * @param force Force an API request and update the cache
	 */
	async byName(name: string, force: boolean = false): Promise<Strain[]> {
		return await this.filter({ name }, force);
	}

	/**
	 * Search for a strain by rating
	 * @param rating Rating to filter (0-5)
	 * @param force Force an API request and update the cache
	 */
	async byRating(rating: number, force: boolean = false): Promise<Strain[]> {
		return await this.filter({ rating }, force);
	}

	/**
	 * Filter strains by race
	 * @param race Race to filter (`indica` | `sativa` | `hybrid`)
	 * @param force Force an API request and update the cache
	 */
	async byRace(race: StrainRaceType, force: boolean = false): Promise<Strain[]> {
		return await this.filter({ race }, force);
	}

	/**
	 * Filter strains by description keywords
	 * @param description Description keywords to filter by
	 * @param force Force an API request and update the cache
	 */
	async byDescription(description: string, force: boolean = false): Promise<Strain[]> {
		return await this.filter({ description }, force);
	}

	/**
	 * Filters for strains by effects
	 * @param effects Effects to filter
	 * @param force Force an API request and update the cache
	 */
	async byEffects(
		effects: string | string[],
		force: boolean = false
	): Promise<Strain[]> {
		assert(
			typeof effects === "string" || Array.isArray(effects),
			"effects must be a string or array of strings"
		);
		return await this.filter(
			{
				effects: Array.isArray(effects) ? effects : [effects],
			},
			force
		);
	}

	/**
	 * Filter by strain flavours
	 * @param flavours Flavours to filter
	 * @param force Force an API request and update the cache
	 * @alias byFlavors
	 */
	async byFlavours(
		flavours: string | string[],
		force: boolean = false
	): Promise<Strain[]> {
		assert(
			typeof flavours === "string" || Array.isArray(flavours),
			"effects must be a string or array of strings"
		);
		return await this.filter(
			{
				flavours: Array.isArray(flavours) ? flavours : [flavours],
			},
			force
		);
	}

	/**
	 * Filter by strain flavors
	 * @param flavors Flavors to filter
	 * @param force Force an API request and update the cache
	 * @alias byFlavours
	 */
	async byFlavors(
		flavors: string | string[],
		force: boolean = false
	): Promise<Strain[]> {
		return await this.byFlavours(flavors, force);
	}
}

export default StrainHandler;
