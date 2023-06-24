function SendEmail({ input, parameters, services }) {
  const url = `${services.default}/v3/${parameters.DOMAIN}/messages`;

  const options = {
    method: 'POST',
    body: {
      from: input.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      'h:Reply-To': input.replyTo,
      // TODO:
      // attachment: input.attachments?.map((attachment) => ({
      //   content: attachment.content,
      //   type: attachment.type,
      //   filename: attachment.filename,
      // })),
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    security: 'basic',
  };

  const response = std.unstable.fetch(url, options).response();
  const body = response.bodyAuto() ?? {};

  if (response.status !== 200) {
    const error = {
      title: `HTTP Error ${response.status}`,
      detail: body.message ?? 'Unknown error',
    };
    throw new std.unstable.MapError(error);
  }

  const result = {
    messageId: body.id,
  };

  return result;
}