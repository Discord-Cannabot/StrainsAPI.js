import BaseClient from "../../src/client/BaseClient";
import Recipe from "../../src/models/Recipe";
import { expect } from "chai";

const client = new BaseClient(process.env.API_TOKEN!);

let recipe: Recipe;

before(async () => {
	recipe = (await client.recipes.all())[0];
});

describe("models/Recipe", () => {
	context("id", () => {
		it("should be a number", () => {
			expect(recipe.id).to.be.a("number");
		});

		it("should be greater than 0", () => {
			expect(recipe.id).to.be.gte(0);
		});
	});

	context("name", () => {
		it("should be a string", () => {
			expect(recipe.name).to.be.a("string");
		});
	});

	context("ingredients", () => {
		it("should be an array of strings", () => {
			expect(recipe.ingredients).to.be.an.instanceOf(Array);
			expect(recipe.ingredients[0]).to.be.a(
				"string",
				`recipe.ingredients expected string[], got ${typeof recipe
					.ingredients[0]}[]`
			);
		});
	});

	context("steps", () => {
		it("should be an array of strings", () => {
			expect(recipe.steps).to.be.an.instanceOf(Array);
			expect(recipe.steps[0]).to.be.a(
				"string",
				`recipe.steps expected string[], got ${typeof recipe.steps[0]}[]`
			);
		});
	});

	context("image", () => {
		it("should be a string", () => {
			expect(recipe.image).to.be.a("string");
		});

		// TODO: Verify that it points to image data
	});
});
