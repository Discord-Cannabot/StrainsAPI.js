import Base from "./Base";

export enum STRAIN_RACE {
	INDICA = "indica",
	SATIVA = "sativa",
	HYBRID = "hybrid",
	TYPE = "Type",
}

export type StrainRace = `${STRAIN_RACE}`;

/**
 * The Raw Strain structure returned by the API
 */
export interface RawStrain {
	id: number;
	name: string;
	race: StrainRace;
	effects: string;
	flavours: string;
	description: string;
	rating: string;
	created_at: string;
	updated_at: string;
}

/**
 * Represents a cannabis Strain
 * @extends Base<RawStrain>
 */
export class Strain extends Base<RawStrain> {
	/**
	 * @param data Raw Strain data from the API
	 */
	constructor(data: RawStrain) {
		super(data);
	}

	/**
	 * The ID of the Strain
	 */
	get id(): number {
		return this.raw.id;
	}

	/**
	 * The name of the Strain
	 */
	get name(): string {
		return this.raw.name;
	}

	/**
	 * The race of the strain
	 */
	get race(): StrainRace {
		return this.raw.race;
	}

	/**
	 * Reported effects of the strain
	 */
	get effects(): string[] {
		return this.raw.effects.split(",");
	}

	/**
	 * Reported flavours of the strain
	 * @alias flavors
	 */
	get flavours(): string[] {
		return this.raw.flavours.split(",");
	}

	/**
	 * Reported flavors of the strain
	 * @alias flavours
	 */
	get flavors(): string[] {
		return this.flavours;
	}

	/**
	 * Description of the strain
	 */
	get description(): string {
		return this.raw.description;
	}

	/**
	 * The Rating of the strain
	 * @example
	 * Strain.rating: "4.4"
	 */
	get rating(): number {
		return Number.parseFloat(this.raw.rating);
	}
}

export default Strain;
