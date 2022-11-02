import { expect } from "chai";
import {
	default as Client,
	StrainsClient,
	Strain,
	Recipe,
	RecipeHandler,
	StrainHandler,
} from "../src/index";

describe("imports", () => {
	it("default is StrainsClient", async () => {
		expect(Client).to.be.equal(StrainsClient);
	});

	it("StrainsClient is StrainsClient class", async () => {
		expect(StrainsClient).to.be.equal(
			(await import("../src/client/BaseClient")).BaseClient
		);
	});

	it("Strain is Strain class", async () => {
		expect(Strain).to.be.equal((await import("../src/models/Strain")).Strain);
	});

	it("Recipe is Recipe class", async () => {
		expect(Recipe).to.be.equal((await import("../src/models/Recipe")).Recipe);
	});

	it("StrainHandler is StrainHandler class", async () => {
		expect(StrainHandler).to.be.equal(
			(await import("../src/handlers/StrainHandler")).StrainHandler
		);
	});

	it("RecipeHandler is RecipeHandler class", async () => {
		expect(RecipeHandler).to.be.equal(
			(await import("../src/handlers/RecipeHandler")).RecipeHandler
		);
	});
});
