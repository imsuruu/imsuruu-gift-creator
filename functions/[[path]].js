export async function onRequest({request,env,params,next}) {
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/api/gifts") {
    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Invalid JSON", {status:400});
    }

    const id = crypto.randomUUID().replaceAll("-","").slice(0,10);
    await env.GIFTS.put(id, JSON.stringify(data), {
      expirationTtl: 60*60*24*365
    });

    return Response.json({id});
  }

  const m = url.pathname.match(/^\/api\/gifts\/([a-zA-Z0-9_-]+)$/);

  if (request.method === "GET" && m) {
    const data = await env.GIFTS.get(m[1]);
    if (!data) return new Response("Not found", {status:404});

    return new Response(data, {
      headers: {
        "Content-Type":"application/json",
        "Cache-Control":"public, max-age=60"
      }
    });
  }

  return next();
}
