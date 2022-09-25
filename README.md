<p align="center">
  <img src="https://cdn.discordapp.com/avatars/570690767757115396/6d877ddcdbfb2826f54bc7a88a32a0cf.png"/></a>
  <h1 align="center"> StrainsAPI.js </h1>
  <a href="https://discord.gg/48smXkY"><img alt="Discord" src="https://img.shields.io/discord/695670770042535937"></a>
</p>

An API Wrapper for [StrainsAPI](https://cannabot.net/api) written in TypeScript

## Features

-   Strain lookup and filtering
-   Recipe lookup and filtering
-   Configurable cacheing
-   Fluent and beautiful error messages

## Installation

Install with npm

```bash
npm install strainsapi.js
```

## Usage/Examples

```typescript
import StrainsClient from "strainsapi.js";
// or
const StrainsClient = require("strainsapi.js");

// Config for the cache
const cacheConfig: Partial<ICachingOptions> = { ttl: 1000 * 60 * 60 * 3 }; // 3 hour cache

// initialize the client
const client = new StrainsClient("Your api token", cacheConfig);

// Search for strains
async function strainSearches() {
	// You can combine as many fields as you want
	const bestIndicas: Strain[] = await client.strains.filter({
		race: "indica",
		rating: 5.0,
	});
	const worstSativas: Strain[] = await client.strains.filter({
		race: "sativa",
		rating: 0.0,
	});
	const midHybrids: Strain[] = await client.strains.filter({
		race: "hybrid",
		rating: 2.5,
	});
	const keywordStrain: Strain[] = await client.strains.filter({
		description: "gorilla glue",
	});
	const namedStrain: Strain[] = await client.strains.filter({ name: "Wedding Cake" });
}

// Search for recipes
async function recipeSearches() {
	const recipes: Recipe[] = await client.recipes.byName("recipe name");
}

async function main() {
	await strainSearches();

	await recipeSearches();
}

main();
```

## Support

For support, join the [Offical Discord Server](https://discord.gg/48smXkY) for Cannabot and StrainsAPI
