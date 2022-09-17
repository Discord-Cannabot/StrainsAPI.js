import axios, { AxiosInstance } from "axios";

import { Agent } from "https";
import StrainHandler from "../handlers/StrainHandler";

export class Client {
	// Private to prevent overwriting
	readonly #instance: AxiosInstance;
	readonly #strains: StrainHandler;

	constructor(bearer: string) {
		this.#instance = axios.create({
			baseURL: "https://cannabot.net/api",
			headers: {
				authorization: `Bearer ${bearer}`,
			},
			httpsAgent: new Agent({ keepAlive: true }),
		});

		this.#strains = new StrainHandler(this);
	}

	/**
	 * Strain handler for the Client
	 */
	public get strains() {
		return this.#strains;
	}

	/**
	 * The Axios Instance used to make requests
	 */
	public get instance() {
		return this.#instance;
	}
}

export default Client;
