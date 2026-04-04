export function matchRoute(pathname, routes) {
  return routes.find((route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)) ?? null;
}

export function toUpstreamUrl(route, url) {
  const suffix = url.pathname.slice(route.prefix.length) || '/';

  return new URL(`${suffix}${url.search}`, route.targetUrl).toString();
}
