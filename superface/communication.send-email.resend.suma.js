function SendEmail({input, parameters, services}){
  const url = `${services.default}/email`;
const options = {
  method: 'POST',
  body: {
    to: input.to,
    from: input.from,
    subject: input.subject,
    bcc: input.bcc,
    cc: input.cc,
    reply_to: input.replyTo,
    html: input.html,
    text: input.text,
  },
  headers: {
    'Content-Type': 'application/json',
  },
  security: 'bearer_token',
};

const response = std.unstable.fetch(url, options).response();
const body = response.bodyAuto() ?? {};

if (response.status !== 200) {
  const error = {
    title: `Error ${response.status}`,
    detail: body.message || 'An error occurred while sending the email.',
  };
  throw new std.unstable.MapError(error);
}

const result = {
  messageId: body.id,
};

return result;
}