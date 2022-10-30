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
	errors?: string[];
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
		let message: string = data.message;
		if (data.errors) {
			message = `${message}: ${data.errors.join(" - ")}`;
		}
		super(message);

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
	get errors(): NonNullable<StrainsAPIError["errors"]> | null {
		return this.raw.errors ?? null;
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

	/**
	 * Checks if an argument is an instance of StrainsError
	 * @param error Error to check
	 * @returns error instanceof StrainsError
	 */
	public static isStrainsError(error: any): error is StrainsError {
		return error instanceof StrainsError;
	}
}

export default StrainsError;
