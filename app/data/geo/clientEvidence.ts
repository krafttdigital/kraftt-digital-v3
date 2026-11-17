/** Client geography supplied by the owner on 13 November 2026.
 * Service matches describe documented delivery, never performance or offices.
 */
export const clientEvidence: Record<string, readonly { slug: string; services: readonly string[] }[]> = {
  bathinda: [
    { slug: 'bharat-bhushan-singla', services: ['web-design-development'] },
    { slug: 'kiraq-jewellery', services: ['web-design-development', 'ecommerce-store-development', 'brand-identity'] },
    { slug: 'shree-hari-spintex', services: ['web-design-development'] },
    { slug: 'gate-seeds', services: ['web-design-development'] },
  ],
  barnala: [{ slug: 'mittal-architect', services: ['web-design-development'] }],
  delhi: [{ slug: 'aegis-squad', services: ['web-design-development'] }],
  gurugram: [{ slug: 'elixir-beverages', services: ['web-design-development', 'brand-identity'] }],
};

export const clientCityByProject = Object.fromEntries(
  Object.entries(clientEvidence).flatMap(([city, entries]) => entries.map(item => [item.slug, city[0].toUpperCase() + city.slice(1)])),
);
