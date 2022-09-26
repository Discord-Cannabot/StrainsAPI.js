export interface DefaultStrainsAPIData {
	created_at: string;
	updated_at: string;
}

/**
 * Base Class that each object will extend
 * @template Data Interface for the Raw Data returned from the API
 */
export class Base<Data extends DefaultStrainsAPIData = DefaultStrainsAPIData> {
	/**
	 * The Data passed to the constructor
	 */
	#data: Data;

	/**
	 * @param data The data to create the instance with
	 */
	constructor(data: Data) {
		this.#data = data;
	}

	/**
	 * The raw data for the object in JSON like structure
	 */
	get raw(): Data {
		return this.#data;
	}

	/**
	 * Timestamp of when the strain was created in the Database
	 */
	get createdAtTimestamp(): number {
		return Date.parse(this.raw.created_at);
	}

	/**
	 * Timestamp of when the strain was last updated in the Database
	 */
	get updatedAtTimestamp(): number {
		return Date.parse(this.raw.updated_at);
	}

	/**
	 * When the strain was created in the Database
	 */
	get createdAt(): Date {
		return new Date(this.createdAtTimestamp);
	}

	/**
	 * When the strain was updated in the Database
	 */
	get updatedAt(): Date {
		return new Date(this.updatedAtTimestamp);
	}
}

export default Base;
