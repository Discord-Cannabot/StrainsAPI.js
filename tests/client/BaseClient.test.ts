import BaseClient from "../../src/client/BaseClient";
import { ICachingOptions } from "node-ts-cache";
import { RecipeHandler } from "../../src/handlers/RecipeHandler";
import StrainHandler from "../../src/handlers/StrainHandler";

import { expect } from "chai";

const TOKEN: string = process.env.API_TOKEN!;

function pretty(
	data: any,
	replacer: Parameters<JSON["stringify"]>[1] = null,
	space: number | string = 2
) {
	return JSON.stringify(data, replacer, space);
}
const CONFIG: ICachingOptions = {
	ttl: 420,
	isLazy: false,
	isCachedForever: true,
	calculateKey: pretty,
};

describe("BaseClient", () => {
	const client = new BaseClient(TOKEN, CONFIG);

	describe("constructor", () => {
		context("bearer", () => {
			it("sets authorization header", () => {
				const clientAuth: string =
					// @ts-ignore
					client.instance.defaults.headers["authorization"];

				expect(clientAuth).to.be.equal(
					`Bearer ${TOKEN}`,
					`Token not set properly: ${clientAuth}`
				);
			});
		});

		context("options", () => {
			it("sets cacheConfig", () => {
				expect(client.cacheConfig).to.deep.contain(CONFIG);
			});

			it("updates ttl", () => {
				expect(client.cacheConfig.ttl).to.be.equal(CONFIG.ttl);
			});

			it("updates isLazy", () => {
				expect(client.cacheConfig.isLazy).to.be.equal(CONFIG.isLazy);
			});

			it("updates isCachedForever", () => {
				expect(client.cacheConfig.isCachedForever).to.be.equal(
					CONFIG.isCachedForever
				);
			});

			it("updates calculateKey", () => {
				expect(client.cacheConfig.calculateKey).to.be.equal(pretty);
			});
		});
	});

	describe("static", () => {});

	describe("properties", () => {
		it("strains is StrainHandler", () => {
			expect(client.strains).to.be.an.instanceOf(
				StrainHandler,
				`BaseClient.strains: ${client.strains.constructor.name}`
			);
		});

		it("recipes is RecipeHandler", () => {
			expect(client.recipes).to.be.an.instanceOf(RecipeHandler);
		});
	});
});
