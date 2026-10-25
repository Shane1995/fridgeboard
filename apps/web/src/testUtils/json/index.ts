export const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status });
