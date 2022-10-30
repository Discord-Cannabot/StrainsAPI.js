import { AxiosError } from "axios";
import { expect } from "chai";
import { ICachingOptions } from "node-ts-cache";
import BaseClient, { RecipeHandler, StrainHandler } from "../../src";

const TOKEN: string = process.env.API_TOKEN!;
const BAD_TOKEN: string = "$foobar$token.would.usually.go.here.but.this.is.fake";
const NUM_TOKEN: number = 420;

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

describe("client/BaseClient", () => {
	const client = new BaseClient(TOKEN, CONFIG);

	beforeEach(() => {
		client.cacheConfig = CONFIG;
	});

	describe("constructor", () => {
		context("bearer", () => {
			it("won't accept bad tokens", () => {
				expect(() => new BaseClient(BAD_TOKEN)).to.throw(Error);
				// @ts-expect-error
				expect(() => new BaseClient(NUM_TOKEN)).to.throw(TypeError);
			});

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

	describe("static", () => {
		context("DefaultCacheConfig", () => {
			it("is correct schema", () => {
				expect(Object.entries(BaseClient.DefaultCacheConfig)).to.be.deep.equal(
					Object.entries(CONFIG)
				);
			});
		});

		context("isAxiosError", () => {
			it("returns true on axios errors", () => {
				const axiosError = new AxiosError("example error", "404", {}, null, {
					data: { error: "foobar" },
					status: 404,
					statusText: "404",
					headers: {},
					config: {},
				});
				expect(BaseClient.isAxiosError(axiosError)).to.be.true;
			});
		});
	});

	describe("properties", () => {
		context("strains", () => {
			it("is StrainHandler", () => {
				expect(client.strains).to.be.an.instanceOf(StrainHandler);
			});
		});

		context("recipes", () => {
			it("is RecipeHandler", () => {
				expect(client.recipes).to.be.an.instanceOf(RecipeHandler);
			});
		});

		context("cacheConfig", () => {
			it("getter returns full config", () => {
				expect(client.cacheConfig).to.deep.equal(CONFIG);
			});

			it("ttl is a number", () => {
				expect(client.cacheConfig.ttl).to.be.a("number");
			});

			it("isLazy is a boolean", () => {
				expect(client.cacheConfig.isLazy).to.be.a("boolean");
			});

			it("isCachedForever is a boolean", () => {
				expect(client.cacheConfig.isCachedForever).to.be.a("boolean");
			});

			it("calculateKey is a function", () => {
				expect(client.cacheConfig.calculateKey).to.be.a("function");
			});

			it("setter updates cacheConfig", () => {
				function foobarKey() {
					return "foobar";
				}

				client.cacheConfig = {
					ttl: CONFIG.ttl * 420,
					isCachedForever: !CONFIG.isCachedForever,
					isLazy: !CONFIG.isLazy,
					calculateKey: foobarKey,
				};
				expect(client.cacheConfig.ttl).to.equal(CONFIG.ttl * 420);
				expect(client.cacheConfig.isLazy).to.equal(!CONFIG.isLazy);
				expect(client.cacheConfig.isCachedForever).to.equal(
					!CONFIG.isCachedForever
				);
				expect(client.cacheConfig.calculateKey).to.equal(foobarKey);
			});
		});

		context("instance", () => {
			it("is a funciton", () => {
				expect(client.instance).to.be.an.instanceOf(Function);
			});
		});
	});
});
