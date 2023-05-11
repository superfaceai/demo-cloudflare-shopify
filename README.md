# Cloudflare + Shopify demo

## Local setup

1. Run `npm install`.
2. Create `.dev.vars` file:
	```
	SHOPIFY_ADMIN_API_KEY=shpat_xxx
	```
3. Run `npm run dev` and open the local endpoint in your browser (press b).
	- To test another usecase use `npm run dev src/UpdateProduct.js`

## Limitations

- Profile input and result validation is disabled
- Local integrations only. Cloudflare Client isn't talking to Registry to fetch integration code.
- Network errors are passed to map as one error type. 
