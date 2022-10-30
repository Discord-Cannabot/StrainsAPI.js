import { expect } from "chai";
import Client, { Recipe } from "../../src";

const client = new Client(process.env.API_TOKEN!);

let recipe: Recipe;

before(async () => {
	recipe = (await client.recipes.all())[0];
});

describe("models/Recipe", () => {
	context("id", () => {
		it("is a number", () => {
			expect(recipe.id).to.be.a("number");
		});

		it("is greater than 0", () => {
			expect(recipe.id).to.be.gte(0);
		});
	});

	context("name", () => {
		it("is a string", () => {
			expect(recipe.name).to.be.a("string");
		});
	});

	context("ingredients", () => {
		it("is an array of strings", () => {
			expect(recipe.ingredients).to.be.an.instanceOf(Array);
			expect(recipe.ingredients[0]).to.be.a(
				"string",
				`recipe.ingredients expected string[], got ${typeof recipe
					.ingredients[0]}[]`
			);
		});
	});

	context("steps", () => {
		it("is an array of strings", () => {
			expect(recipe.steps).to.be.an.instanceOf(Array);
			expect(recipe.steps[0]).to.be.a(
				"string",
				`recipe.steps expected string[], got ${typeof recipe.steps[0]}[]`
			);
		});
	});

	context("image", () => {
		it("is a string", () => {
			expect(recipe.image).to.be.a("string");
		});

		// TODO: Verify that it points to image data
	});
});
