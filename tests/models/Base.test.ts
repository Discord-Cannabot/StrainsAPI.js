import { expect } from "chai";
import Base from "../../src/models/Base";
import Client, { RawStrain } from "../../src";

// client used for requests
const client = new Client(process.env.API_TOKEN!);

/**
 * Base object for testing
 */
let base: Base;

/**
 * Raw data returned from the api
 */
let data: RawStrain;

// Update values before tests run
before(async () => {
	data = (await client.strains.all())[0].raw;
	base = new Base(data);
});

describe("models/Base", () => {
	describe("properties", () => {
		context("raw", () => {
			it("is JSON like data", () => {
				expect(base.raw).to.deep.equal(data);
			});
		});

		context("createdAt", () => {
			it("createdAt is a Date", () => {
				expect(base.createdAt).to.be.an.instanceOf(Date);
			});

			it("createdAt.getTime() == createdAtTimestamp", () => {
				expect(base.createdAt.getTime()).to.be.equal(base.createdAtTimestamp);
			});
		});

		context("createdAtTimestamp", () => {
			it("uses base.raw.created_at & in ms", () => {
				expect(base.createdAtTimestamp).to.be.equal(
					Date.parse(base.raw.created_at)
				);
			});
		});

		context("updatedAt", () => {
			it("updatedAt is a Date", () => {
				expect(base.createdAt).to.be.an.instanceOf(Date);
			});

			it("updatedAt.getTime() == updatedAtTimestamp", () => {
				expect(base.updatedAt.getTime()).to.be.equal(base.updatedAtTimestamp);
			});
		});

		context("updatedAtTimestamp", () => {
			it("uses base.raw.created_at & in ms", () => {
				expect(base.updatedAtTimestamp).to.be.equal(
					Date.parse(base.raw.created_at)
				);
			});
		});
	});
});
