import { AxiosError } from "axios";
import { expect } from "chai";
import Client, { StrainsError, StrainsAPIError } from "../../src";

const exampleBaseError: StrainsAPIError = Object.freeze({
	code: "example_base_error",
	message: "Base example error with no extra errors",
	status: 123,
});

const exampleFullError: StrainsAPIError = Object.freeze({
	code: "example_full_error",
	message: "Full example error with 2 extra errors",
	status: 456,
	errors: ["An error should occur", "An error should not occur"],
});

const examplePartialError: StrainsAPIError = Object.freeze({
	code: "example_partial_error",
	message: "Example error with empty array for errors",
	status: 789,
	errors: [],
});

const expectedRealError: StrainsAPIError = Object.freeze({
	code: "invalid_token",
	message: "The provided API token is invalid.",
	status: 401,
});

const baseError = new StrainsError({
	response: { data: exampleBaseError },
} as unknown as AxiosError<StrainsAPIError>);

const fullError = new StrainsError({
	response: { data: exampleFullError },
} as unknown as AxiosError<StrainsAPIError>);

const partialError = new StrainsError({
	response: { data: examplePartialError },
} as unknown as AxiosError<StrainsAPIError>);

let realError: StrainsError;

const client = new Client("$2y$10$WeedWeedWeedWeedWeed4.WeedWeed2.WeedWeedWeedWeedWeed0");

before(async () => {
	try {
		await client.strains.all();
	} catch (error) {
		if (!StrainsError.isStrainsError(error)) throw error;
		realError = error;
	}
});

describe("errors/StrainsError", () => {
	describe("axios", () => {
		it("throws StrainsError", () => {
			expect(realError.raw).to.deep.equal(expectedRealError);
		});
	});

	describe("properties", () => {
		context("raw", () => {
			it("is JSON like data", () => {
				expect(baseError.raw).to.deep.equal(exampleBaseError);
				expect(fullError.raw).to.deep.equal(exampleFullError);
				expect(partialError.raw).to.deep.equal(examplePartialError);
			});
		});

		context("code", () => {
			it("is a string", () => {
				expect(baseError.code).to.be.a("string");
				expect(fullError.code).to.be.a("string");
				expect(partialError.code).to.be.a("string");
			});

			it("is axios.response.data.code", () => {
				expect(baseError.code).to.be.equal(exampleBaseError.code);
				expect(fullError.code).to.be.equal(exampleFullError.code);
				expect(partialError.code).to.be.equal(examplePartialError.code);
			});
		});

		context("message", () => {
			it("is a string", () => {
				expect(baseError.message).to.be.a("string");
			});

			it("is axios.response.data.message with no errors", () => {
				expect(baseError.message).to.be.equal(exampleBaseError.message);
			});

			it("is data.message: data.errors.join(' - ')", () => {
				expect(fullError.message).to.be.equal(
					`${exampleFullError.message}: ${exampleFullError.errors!.join(" - ")}`
				);
				expect(partialError.message).to.be.equal(
					`${examplePartialError.message}: ${examplePartialError.errors!.join(
						" - "
					)}`
				);
			});
		});

		context("status", () => {
			it("is a number", () => {
				expect(baseError.status).to.be.a("number");
			});

			it("is axios.response.data.status", () => {
				expect(baseError.status).to.be.equal(exampleBaseError.status);
				expect(fullError.status).to.be.equal(exampleFullError.status);
				expect(partialError.status).to.be.equal(examplePartialError.status);
			});
		});

		context("name", () => {
			it("is a string", () => {
				expect(baseError.name).to.be.a("string");
			});

			it("is StrainsError - error.code [error.status]", () => {
				expect(baseError.name).to.be.equal(
					`${baseError.constructor.name} - ${exampleBaseError.code} [${exampleBaseError.status}]`
				);
				expect(fullError.name).to.be.equal(
					`${fullError.constructor.name} - ${exampleFullError.code} [${exampleFullError.status}]`
				);
				expect(partialError.name).to.be.equal(
					`${partialError.constructor.name} - ${examplePartialError.code} [${examplePartialError.status}]`
				);
			});
		});

		context("errors", () => {
			it("is null if !raw.errors", () => {
				expect(baseError.errors).to.be.null;
			});

			it("is an array of strings if raw.errors", () => {
				expect(fullError.errors).to.be.an("array");
				expect(partialError.errors).to.be.an("array");
				for (const error of fullError.errors!) {
					expect(error).to.be.a("string");
				}
			});
		});
	});

	describe("methods", () => {
		context("isStrainsError", () => {
			it("StrainsError instance is true", () => {
				expect(StrainsError.isStrainsError(baseError)).to.be.true;
				expect(StrainsError.isStrainsError(fullError)).to.be.true;
				expect(StrainsError.isStrainsError(partialError)).to.be.true;
			});

			it("Non StrainsError is false", () => {
				expect(StrainsError.isStrainsError("error")).to.be.false;
				expect(StrainsError.isStrainsError(new Error())).to.be.false;
				expect(StrainsError.isStrainsError(StrainsError)).to.be.false;
				expect(StrainsError.isStrainsError(69)).to.be.false;
			});
		});
	});
});
