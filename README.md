# Cloudflare + Shopify demo

Pre-production demo of the next-generation [Superface OneSDK](https://github.com/superfaceai/one-sdk) showcasing the use at the edge with Cloudflare workers, Shopify, and Resend.

Currently, there are five workers each with their own Superface profile: 

1. [Retrieve customer](https://superface.ai/customer-management/get-customer)
1. [Create customer](https://superface.ai/customer-management/create-customer)
1. [Update product](https://superface.ai/product-management/product-update)
1. [Subscribe a webhook](https://superface.ai/webhook-management/subscribe-webhook)
1. Send an email (not yet published to superface.ai)

## Description

The workers are the `src` directory. Each file is a separate worker with the same structure. The default worker (set in wrangler.toml) is `GetCustomer.js` showcasing the retrieval of a customer from Shopify.

At the top of each worker we import OneSDK as well as the assets (profile, map, provider) which are currently all baked into the worker.

```ts
import { Client, PerformError, UnexpectedError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import profile from 'path/to/profile.supr';
// @ts-ignore
import map from 'path/to/map.suma.js';
// @ts-ignore
import provider from 'path/to/provider.provider.json';

const client = new Client({
  env: { /* ... */ },
  preopens: {
    'superface/prefix.name.supr': new Uint8Array(profile),
    'superface/prefix.name.provider.suma.js': new Uint8Array(map),
    'superface/provider.provider.json': new Uint8Array(provider)
  }
});
```

The `Client` configuration includes the environment variables and "preopens" which describe a virtual filesystem where the assets are stored.

As defined by Cloudflare, each worker has a fetch handler. Inside the handler, we instruct the `Client` which profile `client.getProfile('profile')` and use case `profile.getUseCase('usecase')` to use.

Finally, we call `usecase.perform(input, { provider: 'provider', parameters: { /* ... */ }, security: { /* ... */ } })`. Input is the use case input while parameters and security depends on the provider. The `perform()` function then either:

* returns the result (as defined in the profile use case), or
* throws `PerformError` (as defined in the profile use case), or
* throws an `UnexpectedError`

## Local setup

1. Run `npm install`.
2. Create `.dev.vars` file:
	```
	SHOPIFY_ADMIN_API_KEY=shpat_xxx
	```
3. Run `npm run dev` and open the local endpoint in your browser (press b).
  - By default this runs the `src/GetCustomer.js` use case (see wrangler.toml)
	- To test other usecases use `npm run dev src/UpdateProduct.js`, `npm run dev src/CreateCustomer.js`, `npm run dev src/WebhookSubscription.js`, or `npm run dev src/SendEmail.js`
4. Try it with `curl -X GET 'http://127.0.0.1:8787?customer_id=6973847339284'`

## Todos & limitations

The next-gen OneSDK is still in alpha stage and several features are not yet implemented. We welcome any and all feedback. The current limitations include:

- OneSDK Client can't be instantiated in the global scope
  - We discovered Cloudflare is not allowing synchronisation between requests. We need to make sure, that two different requests are not accessing OneSDK Core at the same time. [The problem](https://zuplo.com/blog/the-script-will-never-generate-a-response-on-cloudflare-workers).

- Profile input and result validation is disabled
  - In the upcoming releases OneSDK will validate inputs and outputs to make sure they adhere to the profile.
    
- Build-time integrations only
  - Currently the maps (integration glue) needs to be bundled with the worker at the build time
  - Future OneSDK will be fetching the maps at the runtime to enable dynamic healing and recovery

- Network errors are passed to map as one error type
  - Errors outside of HTTP protocol like connection refused/aborted, DNS errors, etc. are handled as one kind of an error
  - This will be refined over time.

- The compiled WASM OneSDK is hitting the 1MB limit of the Cloudflare workers free tier
  - Local testing is unaffected, but when bundling with user code a Cloudflare paid tier is needed to deploy on Cloudflare

## Reporting bugs

When reporting bugs it is ideal to attach logs from the OneSDK. Logging level can be configured by using the `SF_LOG` env variable passed to the client options and set to `trace` value. Note that this will share low level buffers and communication and as such will include sensitive data, such as inputs and access keys - avoid sharing them publicly.

You can submit bug reports on this repository, [OneSDK repository](https://github.com/superfaceai/one-sdk), via email or using [Discord](https://sfc.is/discord) for the fastest response.
