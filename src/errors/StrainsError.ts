import { AxiosError } from "axios";

/**
 * Raw strain data returned from StrainsAPI
 */
export interface StrainsAPIError {
	code: string;
	message: string;
	status: number;
	/**
	 * Additional error information if applicable
	 */
	errors?: Record<string, string | undefined>;
}

/**
 * Represents an Error thrown by StrainsAPI
 * @extends Error
 */
export class StrainsError extends Error {
	readonly #code: string;

	readonly #status: number;

	readonly #raw: StrainsAPIError;

	/**
	 * @param error Axios Error thrown when the API returns an Error
	 */
	constructor(error: AxiosError<StrainsAPIError>) {
		let data = error.response!.data;
		super(data.message);

		this.#code = data.code;

		this.#status = data.status;

		this.#raw = data;

		Error.captureStackTrace(this, StrainsError);
	}

	/**
	 * The Raw error returned by the API
	 */
	get raw(): StrainsAPIError {
		return this.#raw;
	}

	/**
	 * List of errors that provide context to the error if applicable
	 */
	get errors(): StrainsAPIError["errors"] {
		return this.raw.errors;
	}

	/**
	 * The name of the error
	 */
	override get name(): string {
		return `${this.constructor.name} - ${this.code} [${this.status}]`;
	}

	/**
	 * The error code returned by the API
	 */
	get code(): string {
		return this.#code;
	}

	/**
	 * Response status code
	 */
	get status(): number {
		return this.#status;
	}
}

export default StrainsError;
