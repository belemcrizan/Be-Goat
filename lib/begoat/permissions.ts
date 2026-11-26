export function isSameOriginWrite(req: Request) {
  return (
    req.headers.get("origin") === new URL(req.url).origin &&
    req.headers.get("sec-fetch-site") !== "cross-site" &&
    req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ===
      "application/json"
  );
}
