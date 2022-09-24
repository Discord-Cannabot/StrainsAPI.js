import { AxiosError } from "axios";

/**
 * Raw strain data returned from StrainsAPI
 */
export interface StrainsAPIError {
	code: string;
	message: string;
	status: number;
}

/**
 * Represents an Error thrown by StrainsAPI
 * @extends Error
 */
export class StrainsError extends Error {
	readonly #code: string;

	readonly #status: number;

	/**
	 * @param error Axios Error thrown when the API returns an Error
	 */
	constructor(error: AxiosError<StrainsAPIError>) {
		let data = error.response!.data;
		super(data.message);

		this.#code = data.code;

		this.#status = data.status;

		Error.captureStackTrace(this, StrainsError);
	}

	/**
	 * The name of the error
	 */
	override get name() {
		return `${this.constructor.name} - ${this.code} [${this.status}]`;
	}

	/**
	 * The error code returned by the API
	 */
	get code() {
		return this.#code;
	}

	/**
	 * Response status code
	 */
	get status() {
		return this.#status;
	}
}

export default StrainsError;
