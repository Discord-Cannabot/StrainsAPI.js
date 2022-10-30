import { expect } from "chai";
import Client, { Recipe, RecipeHandler } from "../../src";

const client = new Client(process.env.API_TOKEN!);
let handler = new RecipeHandler(client);

beforeEach(() => {
	handler = new RecipeHandler(client);
});

describe("handlers/RecipeHandler", () => {
	describe("methods", () => {
		context("all", () => {
			it("returns a promise", () => {
				expect(handler.all()).to.be.an.instanceOf(Promise);
			});

			it("returns array of Recipes", async () => {
				const recipes = await handler.all();
				expect(recipes).to.be.an("array");
				for (const recipe of recipes) {
					expect(recipe).to.be.an.instanceOf(Recipe);
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
				expect(handler.filter({ id: 1 })).to.be.an.instanceOf(Promise);
			});

			it("returns an array of Recipes", async () => {
				const recipes = await handler.filter({ id: 1 });
				expect(recipes).to.be.an("array");
				for (const recipe of recipes) {
					expect(recipe).to.be.an.instanceOf(Recipe);
				}
			});

			it("uses cache", async () => {
				await handler.filter({ id: 1 }, true);

				const start = new Date();
				await handler.filter({ id: 1 }, false);
				const end = new Date();

				const time = end.getTime() - start.getTime();
				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.filter({ id: 1 }, true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.filter({ id: 1 }, true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});
		});

		context("byId", () => {
			it("returns a promise", () => {
				expect(handler.byId(0)).to.be.an.instanceOf(Promise);
			});

			it("returns an array of recipes", async () => {
				const recipes = await handler.byId(0);
				expect(recipes).to.be.an("array");
			});

			it("uses cache", async () => {
				await handler.byId(0, true);

				const start = new Date();
				await handler.byId(0, false);
				const end = new Date();

				const time = end.getTime() - start.getTime();
				expect(time).to.be.within(-100, 100);
			});

			it("ignores cache when force is true", async () => {
				let start = new Date();
				await handler.byId(0, true);
				let end = new Date();
				const first = end.getTime() - start.getTime();

				start = new Date();
				await handler.byId(0, true);
				end = new Date();
				const second = end.getTime() - start.getTime();

				expect(first).to.be.within(second - 1000, second + 1000);
			});
		});
	});
});
