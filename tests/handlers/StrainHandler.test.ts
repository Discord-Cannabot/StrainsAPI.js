import { expect } from "chai";
import Client, { Strain, StrainHandler } from "../../src";
import { includesAll } from "../../src/handlers/StrainHandler";

const client = new Client(process.env.API_TOKEN!);
let handler = new StrainHandler(client);

beforeEach(() => {
	handler = new StrainHandler(client);
});

const SAMPLE_SIZE = 10;

const STRAIN_NAMES = ["gg", "WEDDING", "LeMoN"];

const DESCRIPTIONS = ["gorilla", "EARTHY", "YeLlOw"];

const EFFECTS = ["happy", "RELAXED", "EuPhOrIc"];

const FLAVOURS = ["sweet", "VANILLA", "SoUr"];

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
	describe("functions", () => {
		context("includesAll", () => {
			let parent: string[] = [];
			let child: string[] = [];

			beforeEach(() => {
				parent = ["Weed", "420", "Ganja", "Bob Marley"];
				child = [parent[0], parent[2]];
			});

			it("returns true when child array exists in parent array", () => {
				expect(includesAll(parent, child)).to.be.true;
				expect(includesAll(parent, parent)).to.be.true;
				expect(includesAll(child, child)).to.be.true;
			});

			it("returns false when child array does not exist in parent array", () => {
				expect(includesAll(child, parent)).to.be.false;
			});

			it("Case insensitive by default", () => {
				expect(
					includesAll(
						parent,
						child.map((kid) => kid.toUpperCase())
					)
				).to.be.true;

				expect(
					includesAll(
						parent,
						child.map((kid) => kid.toLowerCase())
					)
				);
			});

			it("Case sensitive filter works", () => {
				expect(
					includesAll(
						parent,
						child.map((kid) => kid.toUpperCase()),
						true
					)
				).to.be.false;

				expect(
					includesAll(
						parent,
						child.map((kid) => kid.toLowerCase()),
						true
					)
				).to.be.false;

				expect(
					includesAll(
						parent,
						child.map((kid) => kid.toUpperCase()),
						false
					)
				).to.be.true;

				expect(
					includesAll(
						parent,
						child.map((kid) => kid.toLowerCase()),
						false
					)
				).to.be.true;
			});
		});
	});
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
				const strains = await handler.filter({});
				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("uses cache", async () => {
				await handler.filter({}, true);

				const start = new Date();
				await handler.filter({}, false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.filter({}, true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.filter({}, true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});

			it("accepts no params", async () => {
				// @ts-ignore
				expect(await handler.filter()).to.be.an("array");
			});

			it("filters names", async () => {
				for (const name of STRAIN_NAMES) {
					const strains = await handler.filter({
						name,
					});
					for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
						expect(strains[i].name).to.match(new RegExp(name, "gi"));
					}
				}
			});

			it("filters race", async () => {
				for (const race in Strain.Race) {
					const strains = await handler.filter({
						race: Strain.Race[race as keyof typeof Strain.Race],
					});

					for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
						expect(strains[i].race).to.be.equal(
							Strain.Race[race as keyof typeof Strain.Race]
						);
					}
				}
			});

			it("filters descriptions", async () => {
				for (const description of DESCRIPTIONS) {
					const strains = await handler.filter({
						description,
					});
					for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
						expect(strains[i].description).to.match(
							new RegExp(description, "gi"),
							"Description did not match"
						);
					}
				}
			});

			it("filters rating", async () => {
				for (let i = 0; i < SAMPLE_SIZE; i++) {
					const rating = getRandomFloat(0, 5, 1);

					const strains = await handler.filter({
						rating,
					});

					for (const strain of strains) {
						expect(strain.rating).to.be.equal(rating, "Rating did not match");
					}
				}

				expect(
					await handler.filter({
						rating: -1,
					})
				).to.have.lengthOf(0, "Rating of -1 did not return empty array");

				expect(
					await handler.filter({
						rating: 6,
					})
				).to.have.lengthOf(0, "Rating of 6 did not return empty array");
			});

			it("filters maxRating", async () => {
				for (let i = 0; i < SAMPLE_SIZE; i++) {
					const rating = getRandomFloat(0, 5, 1);

					const strains = await handler.filter({
						maxRating: rating,
					});

					for (const strain of strains) {
						expect(strain.rating).to.be.lessThanOrEqual(rating);
					}
				}
			});

			it("filters minRating", async () => {
				for (let i = 0; i < SAMPLE_SIZE; i++) {
					const rating = getRandomFloat(0, 5, 1);

					const strains = await handler.filter({
						minRating: rating,
					});

					for (let j = 0; j < SAMPLE_SIZE && j < strains.length; j++) {
						expect(strains[j].rating).to.be.greaterThanOrEqual(rating);
					}
				}
			});

			it("filters effects", async () => {
				const strains = await handler.filter({ effects: EFFECTS });
				for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(includesAll(strains[i].effects, EFFECTS)).to.be.true;
				}
			});

			it("filters flavours", async () => {
				const strains = await handler.filter({
					flavours: FLAVOURS,
				});
				for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(includesAll(strains[i].flavours, FLAVOURS)).to.be.true;
				}
			});

			it("filters flavors", async () => {
				const strains = await handler.filter({
					flavors: FLAVOURS,
				});
				for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(includesAll(strains[i].flavors, FLAVOURS)).to.be.true;
				}
			});

			it("combines flavours and flavors", async () => {
				const strains = await handler.filter({
					flavors: [FLAVOURS[0]],
					flavours: [FLAVOURS[1]],
				});

				for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(includesAll(strains[i].flavors, [FLAVOURS[0], FLAVOURS[1]])).to
						.be.true;
				}
			});

			it("skips when list is empty", async () => {
				const strains = await handler.filter({
					name: STRAIN_NAMES[0],
					race: Strain.Race.SATIVA,
					rating: 4.5,
					effects: ["Not a real effect"],
					description: "NO DESCRIPTION",
				});

				expect(strains).to.have.lengthOf(0);
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
						expect(strains[j].rating).to.be.equal(rating);
					}
				}
			});
		});

		context("byEffects", () => {
			it("returns a promise", () => {
				expect(handler.byEffects(EFFECTS[0])).to.be.an.instanceOf(Promise);
			});

			it("returns an array of strains", async () => {
				const strains = await handler.byEffects(EFFECTS[0]);

				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("uses cache", async () => {
				await handler.byEffects(EFFECTS[0], true);

				const start = new Date();
				await handler.byEffects(EFFECTS[0], false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byEffects(EFFECTS[0], true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byEffects(EFFECTS[0], true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});

			it("filters effects", async () => {
				let strains = await handler.byEffects(EFFECTS);
				for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(includesAll(strains[i].effects, EFFECTS)).to.be.true;
				}
			});

			it("accepts single string", async () => {
				expect(async () => await handler.byEffects(EFFECTS[0])).to.not.throw(
					Error
				);
			});

			it("accepts an array of strings", async () => {
				expect(async () => await handler.byEffects(EFFECTS)).to.not.throw(Error);
			});
		});

		context("byFlavors", () => {
			it("returns a promise", () => {
				expect(handler.byFlavors(FLAVOURS[0])).to.be.an.instanceOf(Promise);
			});

			it("returns an array of strains", async () => {
				const strains = await handler.byFlavors(FLAVOURS[0]);

				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("uses cache", async () => {
				await handler.byFlavors(FLAVOURS[0], true);

				const start = new Date();
				await handler.byFlavors(FLAVOURS[0], false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byFlavors(FLAVOURS[0], true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byFlavors(FLAVOURS[0], true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});

			it("filters effects", async () => {
				let strains = await handler.byFlavors(FLAVOURS);
				for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					for (const flavour of FLAVOURS) {
						expect(strains[i].flavours).to.include(flavour);
					}
				}
			});

			it("accepts single string", async () => {
				expect(async () => await handler.byFlavors(FLAVOURS[0])).to.not.throw(
					Error
				);
			});

			it("accepts an array of strings", async () => {
				expect(async () => await handler.byFlavors(FLAVOURS)).to.not.throw(Error);
			});
		});

		context("byFlavours", () => {
			it("returns a promise", () => {
				expect(handler.byFlavours(FLAVOURS[0])).to.be.an.instanceOf(Promise);
			});

			it("returns an array of strains", async () => {
				const strains = await handler.byFlavours(FLAVOURS[0]);

				expect(strains).to.be.an("array");

				for (let i: number = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					expect(strains[i]).to.be.an.instanceOf(Strain);
				}
			});

			it("uses cache", async () => {
				await handler.byFlavours(FLAVOURS[0], true);

				const start = new Date();
				await handler.byFlavours(FLAVOURS[0], false);
				const end = new Date();

				const time = end.getTime() - start.getTime();

				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byFlavours(FLAVOURS[0], true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byFlavours(FLAVOURS[0], true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});

			it("filters effects", async () => {
				let strains = await handler.byFlavours(FLAVOURS);
				for (let i = 0; i < SAMPLE_SIZE && i < strains.length; i++) {
					for (const flavour of FLAVOURS) {
						expect(strains[i].flavours).to.include(flavour);
					}
				}
			});

			it("accepts single string", async () => {
				expect(async () => await handler.byFlavours(FLAVOURS[0])).to.not.throw(
					Error
				);
			});

			it("accepts an array of strings", async () => {
				expect(async () => await handler.byFlavours(FLAVOURS)).to.not.throw(
					Error
				);
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
