function SendEmail({ input, parameters, services }) {
  const url = `${services.default}/email`;
  const options = {
    method: 'POST',
    body: input,
    headers: {
      'Content-Type': 'application/json',
    },
    security: 'bearer_token',
  };

  const response = std.unstable.fetch(url, options).response();
  const body = response.bodyAuto() ?? {};

  if (response.status !== 200) {
    const error = {
      error: body.error || 'An error occurred while sending the email.',
      code: response.status,
      rate_limit: {
        limit: parseInt(response.headers['x-ratelimit-limit'][0], 10),
        remaining: parseInt(response.headers['x-ratelimit-remaining'][0], 10),
        reset: parseInt(response.headers['x-ratelimit-reset'][0], 10),
      },
    };
    throw new std.unstable.MapError(error);
  }

  const result = {
    id: body.id,
    from: body.from,
    to: body.to,
    created_at: body.created_at,
  };

  return result;
}