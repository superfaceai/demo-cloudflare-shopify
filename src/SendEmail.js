import { OneClient, PerformError } from '@superfaceai/one-sdk/cloudflare';

// @ts-ignore
import comlinkProfile from '../superface/communication.send-email.profile';
// @ts-ignore
import comlinkMapResend from '../superface/communication.send-email.resend.map.js';
// @ts-ignore
import comlinkMapMailgun from '../superface/communication.send-email.mailgun.map.js';
// @ts-ignore
import comlinkProviderResend from '../superface/resend.provider.json';
// @ts-ignore
import comlinkProviderMailgun from '../superface/mailgun.provider.json';



export default {
  async fetch(request, env, ctx) {
    // See GetCustomer.js usecase for more comments
    const client = new OneClient({
      preopens: {
        'superface/communication.send-email.profile': new Uint8Array(comlinkProfile),
        'superface/communication.send-email.resend.map.js': new Uint8Array(comlinkMapResend),
        'superface/communication.send-email.mailgun.map.js': new Uint8Array(comlinkMapMailgun),
        'superface/resend.provider.json': new Uint8Array(comlinkProviderResend),
        'superface/mailgun.provider.json': new Uint8Array(comlinkProviderMailgun)
      },
      token: undefined
    });

    // Resend
    // const inputs = {
    //   from: "onboarding@resend.dev",
    //   to: "z@superface.ai",
    //   subject: "Hello World",
    //   html: "<p>Hello from EDGARX on the edge!</p>",
    // };

    // const provider = {
    //   provider: 'resend',
    //   parameters: {},
    //   security: { bearer_token: { token: env.RESEND_TOKEN } }
    // }

    // Mailgun
    const inputs = {
      from: 'demo@demo.superface.org',
      to: 'z@superface.ai',
      subject: 'Hello World from EDGAR',
      text: 'This is a plain text email with mailgun.'
    };

    const provider = {
      provider: 'mailgun',
      parameters: { DOMAIN: env.MAILGUN_DOMAIN },
      security: { basic: { username: env.MAILGUN_USERNAME, password: env.MAILGUN_PASSWORD } }
    }

    const profile = await client.getProfile('communication/send-email');
    const result = await profile
      .getUseCase('SendEmail')
      .perform(inputs, provider);

    let response;
    try {
      const ok = await result;
      response = new Response(`Result: ${JSON.stringify(ok, null, 2)}`);
    } catch (error) {
      if (error instanceof PerformError) {
        let response = 'Error:';
        for (const [key, value] of Object.entries(error.errorResult)) {
          response += `\n${key}: ${value}`;
        }
        response = new Response(response, { status: 400 });
      } else {
        response = new Response(`${error.name}\n${error.message}`, { status: 500 });
      }
    }

    ctx.waitUntil(client.sendMetricsToSuperface());
    return response;
  }
}
