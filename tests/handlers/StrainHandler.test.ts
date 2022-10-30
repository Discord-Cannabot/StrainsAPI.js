import { expect } from "chai";
import Client, { Strain, StrainHandler } from "../../src";

const client = new Client(process.env.API_TOKEN!);
let handler = new StrainHandler(client);

beforeEach(() => {
	handler = new StrainHandler(client);
});

const SAMPLE_SIZE = 10;

const STRAIN_NAMES = ["gg", "wed", "lemon"] as const;

const DESCRIPTIONS = ["gorilla", "earthy", "yellow"] as const;

/**
 * Generate a random float between 2 numbers
 * @param min Min value of float (Default: 0)
 * @param max Max value of float (Default: 5)
 * @param decimals Number of digits after the decimal (Default: 1)
 */
function getRandomFloat(min: number = 0, max: number = 5, decimals: number = 1) {
	const str = (Math.random() * (max - min) + min).toFixed(decimals);

	return parseFloat(str);
}

describe("handlers/StrainHandler", () => {
	describe(`methods - sample size: ${SAMPLE_SIZE}`, () => {
		context("all", () => {
			it("returns a promise", () => {
				expect(handler.all()).to.be.an.instanceOf(Promise);
			});

			it("returns array of Strains", async () => {
				const strains = await handler.all();
				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("caches responses", async () => {
				await handler.all(true);

				const start = new Date();
				await handler.all(false);
				const end = new Date();

				const time = end.getTime() - start.getTime();
				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.all(true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.all(true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 2000);
			});
		});

		context("filter", () => {
			it("returns a promise", () => {
				expect(handler.filter({ name: "1" })).to.be.an.instanceOf(Promise);
			});

			it("returns an array of Strains", async () => {
				const strains = await handler.filter({ name: "1" });
				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("uses cache", async () => {
				await handler.filter({ name: "0" }, true);

				const start = new Date();
				await handler.filter({ name: "0" }, false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.filter({ name: "0" }, true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.filter({ name: "0" }, true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});

			// TODO: Test that filter ensures every param is taken into account
		});

		context("byRace", () => {
			it("returns a promise", () => {
				expect(handler.byRace("indica")).to.be.an.instanceOf(Promise);
			});

			it("returns an array of strains", async () => {
				const strains = await handler.byRace("indica");
				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("indica returns indicas", async () => {
				const strains = await handler.byRace("indica");
				for (let i: number = 0; i < SAMPLE_SIZE; i++) {
					expect(strains[i].race).to.equal("indica");
				}
			});

			it("sativa returns sativas", async () => {
				const strains = await handler.byRace("sativa");
				for (let i: number = 0; i < SAMPLE_SIZE; i++) {
					expect(strains[i].race).to.equal("sativa");
				}
			});

			it("hybrid returns hybrids", async () => {
				const strains = await handler.byRace("hybrid");
				for (let i: number = 0; i < SAMPLE_SIZE; i++) {
					expect(strains[i].race).to.equal("hybrid");
				}
			});

			it("uses cache", async () => {
				await handler.byRace("indica", true);

				const start = new Date();
				await handler.byRace("indica", false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byRace("indica", true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byRace("indica", true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});
		});

		context("byName", () => {
			it("returns a promise", () => {
				expect(handler.byName(STRAIN_NAMES[0])).to.be.an.instanceOf(Promise);
			});

			it("returns an array of strains", async () => {
				const strains = await handler.byName(STRAIN_NAMES[0]);

				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("uses cache", async () => {
				await handler.byName(STRAIN_NAMES[0], true);

				const start = new Date();
				await handler.byName(STRAIN_NAMES[0], false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byName(STRAIN_NAMES[0], true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byName(STRAIN_NAMES[0], true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});

			it("uses search query", async () => {
				for (const name of STRAIN_NAMES) {
					const strains = await handler.byName(name);

					for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
						expect(strains[i].name).to.match(new RegExp(name, "gi"));
					}
				}
			});
		});

		context("byRating", () => {
			it("returns a promise", () => {
				expect(handler.byRating(5)).to.be.an.instanceOf(Promise);
			});

			it("returns an array of strains", async () => {
				const strains = await handler.byRating(5);

				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("uses cache", async () => {
				await handler.byRating(0, true);

				const start = new Date();
				await handler.byRating(0, false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byRating(0, true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byRating(0, true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});

			it("has rating query", async () => {
				for (let i: number = 0; i < SAMPLE_SIZE; i++) {
					const rating = getRandomFloat();
					const strains = await handler.byRating(rating);
					for (let j: number = 0; j < SAMPLE_SIZE && j < strains.length; j++) {
						expect(strains[0].rating).to.be.equal(rating);
					}
				}
			});
		});

		context("byDescription", () => {
			it("returns a promise", () => {
				expect(handler.byDescription(DESCRIPTIONS[0])).to.be.an.instanceOf(
					Promise
				);
			});

			it("returns array of Strains", async () => {
				const strains = await handler.byDescription(DESCRIPTIONS[0]);
				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("caches responses", async () => {
				await handler.byDescription(DESCRIPTIONS[0], true);

				const start = new Date();
				await handler.byDescription(DESCRIPTIONS[0], false);
				const end = new Date();

				const time = end.getTime() - start.getTime();
				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byDescription(DESCRIPTIONS[0], true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byDescription(DESCRIPTIONS[0], true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 2000);
			});

			it("contains description keyword", async () => {
				for (const description of DESCRIPTIONS) {
					const strains = await handler.byDescription(description);

					for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
						expect(strains[i].description).to.match(
							new RegExp(description, "gi")
						);
					}
				}
			});
		});
	});
});
