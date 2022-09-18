/**
 * Base Class that each object will extend
 * @template Data Interface for the Raw Data returned from the API
 */
export class Base<Data extends any> {
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
}

export default Base;
