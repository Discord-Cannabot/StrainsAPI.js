import { CacheContainer, ICachingOptions } from "node-ts-cache";
import { expect } from "chai";
import BaseHandler from "../../src/handlers/BaseHandler";
import Client from "../../src";

function foobar() {
	return "foobar";
}

const CONFIG: ICachingOptions = {
	ttl: Client.DefaultCacheConfig.ttl * 420,
	isLazy: !Client.DefaultCacheConfig.isLazy,
	isCachedForever: !Client.DefaultCacheConfig.isCachedForever,
	calculateKey: foobar,
};

// 2 example classes
class Foo {}
class Bar {}

const fooHandler = new BaseHandler<typeof Foo>(
	new Client(process.env.API_TOKEN!),
	Foo,
	CONFIG // Only Foo uses custom config
);
const barHandler = new BaseHandler<typeof Bar>(new Client(process.env.API_TOKEN!), Bar);

beforeEach(() => {
	fooHandler.config = CONFIG;
	fooHandler.cache.clear();
	barHandler.cache.clear();
});

describe("handlers/BaseHandler", () => {
	describe("properties", () => {
		context("client", () => {
			it("is instance of StrainsClient", () => {
				expect(fooHandler.client).to.be.an.instanceOf(Client);
				expect(barHandler.client).to.be.an.instanceOf(Client);
			});
		});

		context("cache", () => {
			it("is instance of CacheContainer", () => {
				expect(fooHandler.cache).to.be.an.instanceOf(CacheContainer);
				expect(barHandler.cache).to.be.an.instanceOf(CacheContainer);
			});
		});

		context("holds", () => {
			it("should return class constructor", () => {
				expect(fooHandler.holds).to.be.equal(Foo);
				expect(barHandler.holds).to.be.equal(Bar);
			});
		});

		context("config", () => {
			it("should deep equal cache config", () => {
				expect(fooHandler.config).to.deep.equal(CONFIG);
				expect(barHandler.config).to.deep.equal(Client.DefaultCacheConfig);
			});
		});
	});

	describe("methods", () => {
		context("get", () => {
			it("returns a promise", async () => {
				expect(fooHandler.get("foo")).to.be.an.instanceOf(Promise);
				expect(await barHandler.get("bar")).to.be.null;
			});

			it("returns null when not cached", async () => {
				expect(await fooHandler.get("not_found")).to.be.null;
				expect(await barHandler.get("some_not_found")).to.be.null;
			});

			it("returns holds item when cached", async () => {
				await fooHandler.set("found", new Foo());
				expect(await fooHandler.get("found")).to.be.an.instanceOf(
					fooHandler.holds
				);
			});
		});

		context("set", () => {
			it("returns a promise", () => {
				expect(fooHandler.set("foo", "bar")).to.be.an.instanceOf(Promise);
			});

			it("updates value already set", async () => {
				const first = new Foo();
				const second = new Foo();
				await fooHandler.set("found", first);
				expect(await fooHandler.get("found")).to.be.equal(first);
				await fooHandler.set("found", second, CONFIG);
				expect(await fooHandler.get("found")).to.be.equal(second);
			});
		});
	});
});
