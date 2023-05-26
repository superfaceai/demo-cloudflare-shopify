import { Client, PerformError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import comlinkProfile from '../superface/email-communication.email-sending.supr';
// @ts-ignore
import comlinkMap from '../superface/email-communication.email-sending.resend.suma.js';
// @ts-ignore
import comlinkProvider from '../superface/resend.provider.json';

export default {
  async fetch(request, env, ctx) {
    // See GetCustomer.js usecase for more comments
    const client = new Client({
      preopens: {
        'superface/email-communication.email-sending.supr': new Uint8Array(comlinkProfile),
        'superface/email-communication.email-sending.resend.suma.js': new Uint8Array(comlinkMap),
        'superface/resend.provider.json': new Uint8Array(comlinkProvider)
      }
    });

    const profile = await client.getProfile('email-communication/email-sending');
    const result = await profile
      .getUseCase('SendEmail')
      .perform(
        {
          from: "onboarding@resend.dev",
          to: "hello@superface.ai",
          subject: "Hello World",
          html: "<p>Hello from EDGAR on the edge!</p>",
        },
        {
          provider: 'resend',
          parameters: {},
          security: { bearer_token: { token: env.RESEND_TOKEN } }
        }
      );

    try {
      const ok = await result;
      return new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        let response = 'Error:';
        for (const [key, value] of Object.entries(error.errorResult)) {
          response += `\n${key}: ${value}`;
        }
        return new Response(response, { status: 400 });
      } else {
        return new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }
  }
}
