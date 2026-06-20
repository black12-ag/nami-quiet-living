export async function onRequestGet(context) {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" }
  });
}
