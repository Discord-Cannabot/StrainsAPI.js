import "mocha";

import BaseClient from "../../src/client/BaseClient";
import Strain from "../../src/models/Strain";
import { expect } from "chai";

const client = new BaseClient(process.env.API_TOKEN!);

let strain: Strain;

before(async () => {
	strain = (await client.strains.all())[0];
});

describe("models/Strain", () => {
	context("static Race", () => {
		it("has all 3 races", () => {
			expect(Strain.Race).to.not.be.undefined;
			expect(Strain.Race.INDICA).to.be.equal("indica");
			expect(Strain.Race.SATIVA).to.be.equal("sativa");
			expect(Strain.Race.HYBRID).to.be.equal("hybrid");
		});
	});

	context("id", () => {
		it("should be a number", () => {
			expect(strain.id).to.be.a("number");
		});

		it("should be greater than 0", () => {
			expect(strain.id).to.be.gte(0);
		});
	});

	context("name", () => {
		it("should be a string", () => {
			expect(strain.name).to.be.a("string");
		});
	});

	context("race", () => {
		it("should be a string", () => {
			expect(strain.race).to.be.a("string");
		});

		it("is sativa, indica, or hybrid", () => {
			expect(strain.race).to.match(/sativa|indica|hybrid/gi);
		});
	});

	context("effects", () => {
		it("should be an array of strings", () => {
			expect(strain.effects).to.be.an("array");
			expect(strain.effects[0]).to.be.a(
				"string",
				`expected string[] | actual ${typeof strain.flavours[0]}[]`
			);
		});
	});

	context("flavours", () => {
		it("should be an array of strings", () => {
			expect(strain.flavours).to.be.an.instanceOf(Array);
			expect(strain.flavours[0]).to.be.a(
				"string",
				`strain.flavours expected string[], got ${typeof strain.flavours[0]}[]`
			);
		});

		it("should be the same as flavors", () => {
			expect(strain.flavors).deep.equal(strain.flavours);
		});
	});

	context("description", () => {
		it("should be a string", () => {
			expect(strain.description).to.be.a("string");
		});
	});

	context("rating", () => {
		it("should be a number", () => {
			expect(strain.rating).to.be.a("number");
		});

		it("should be between 0-5", () => {
			expect(strain.rating).to.be.gte(0).and.lte(5);
		});

		it("should match strain.raw.rating", () => {
			expect(strain.rating).to.be.equal(Number.parseFloat(strain.raw.rating));
		});
	});
});
