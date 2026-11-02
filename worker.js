const ADMIN_CODE = "ni3m4ndaufträgejsiqoekekdkdkelleleleleleleleleleeloeoe8292920eä3ö3örörllrkrkfldöwpwp2939393020";

export async function onRequest({request, env}) {
  const url = new URL(request.url);
  const DB = env.DB;

  await DB.prepare(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, date TEXT, task TEXT, result_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();

  // Check Code
  if (url.pathname === "/api/check-code") {
    const {code} = await request.json();
    return Response.json({ valid: code === ADMIN_CODE });
  }

  // Neuer Auftrag
  if (url.pathname === "/api/orders" && request.method === "POST") {
    const d = await request.json();
    if (d.name === ADMIN_CODE) return Response.json({ redirect: true });
    await DB.prepare(`INSERT INTO orders (name, date, task, result_type) VALUES (?,?,?,?)`).bind(d.name, d.date, d.task, d.result_type).run();
    return Response.json({ ok: true });
  }

  // Alle holen
  if (url.pathname === "/api/orders" && request.method === "GET") {
    if (request.headers.get("x-admin-code") !== ADMIN_CODE) return new Response("Unauthorized", {status:401});
    const {results} = await DB.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
    return Response.json(results);
  }

  // Löschen
  if (url.pathname.startsWith("/api/orders/") && request.method === "DELETE") {
    if (request.headers.get("x-admin-code") !== ADMIN_CODE) return new Response("Unauthorized", {status:401});
    await DB.prepare(`DELETE FROM orders WHERE id=?`).bind(url.pathname.split("/").pop()).run();
    return Response.json({ok:true});
  }

  return new Response("Not found", {status:404});
}
