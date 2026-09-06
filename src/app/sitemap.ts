import type { MetadataRoute } from "next";

// Update the base URL once the production domain is known.
const BASE_URL = "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/services", "/projects", "/quote", "/contact"];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
