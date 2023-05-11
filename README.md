# Cloudflare + Shopify demo

## Usage

There are files workers in the `src` directory. Each file is a separate worker with the same structure.

At the top of the file we import the OneSDK as well as the asset files (profile, map, provider) which are baked into the worker. The Client instance is also initialized in the global scope as it has internal state and document cache.

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

The client configuration consists of setting up the environment variables (which are passed into the WASI context and are read by the shared core) and preopens which describe a virtual filesystem where the assets are stored.

Next, the worker fetch handler as defined by the Cloudflare protocol is exported. Inside the call we have async context so we can call `client.getProfile('prefix/name')` (which doesn't have to be called on every request) and `profile.getUseCase('UsecaseName')` to tell the client which profile and usecase we are going to be using.

Finally, still inside the worker we call `usecase.perform(input, { provider: 'provider', parameters: { /* ... */ }, security: { /* ... */ } })`. Input is the usecase input while parameters and security are values to satisfy the respective declarations in the provider definition, as selected by the provider field. The perform function either:
* returns the result (as defined in the profile usecase), or
* throws `PerformError` (as defined in the profile usecase), or
* throws an `UnexpectedError`

## Local setup

1. Run `npm install`.
2. Create `.dev.vars` file:
	```
	SHOPIFY_ADMIN_API_KEY=shpat_xxx
	```
3. Run `npm run dev` and open the local endpoint in your browser (press b).
  - By default this runs the `src/GetCustomer.js` usecase (see wrangler.toml main field)
	- To test another usecase use `npm run dev src/UpdateProduct.js` or `npm run dev src/CreateCustomer.js`

## Limitations

- Profile input and result validation is disabled.
  - In later releases the core will be able to validate inputs and output of the map to make sure they adhere to the profile.
- Local integrations only. Cloudflare Client isn't talking to Registry to fetch integration code.
  - This is not a technical limitation, there simply isn't a registry for our new integrations yet.
- Network errors (connection refused/aborted, dns errors, etc.) are passed to map as one error type.
  - It is unclear at what level of granularity these errors will be handled, but they can be refined over time.\
- The compiled WASM core shipped with our SDK is hitting the limit of the Cloudflare workers free tier
  - Local testing is unaffected, but when bundling with user code it might be required to use at least the default paid tier to get an increased limit.

## Reporting bugs

When reporting bugs it is ideal to attach logs from the SDK. Logging level can be configured by using the `SF_LOG` env variable passed to the client options and set to "trace" value. Note that this will share low level buffers and communication and as such will include sensitive data, such as inputs and access keys - avoid sharing them publicly.

Such reports can be shared with us at our Discord <discord link here pls>.
