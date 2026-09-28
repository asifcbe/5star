/*
 * Shared category list for 5Star — 3 product families, 3 categories each.
 * `productType` ties each category to its family so the storefront can filter.
 */
module.exports = [
  // Bags
  { name: 'Backpacks', slug: 'backpacks', productType: 'bags', order: 1 },
  { name: 'Laptop Bags', slug: 'laptop-bags', productType: 'bags', order: 2 },
  { name: 'Duffel Bags', slug: 'duffel-bags', productType: 'bags', order: 3 },
  // Jerkins
  { name: 'Leather-Style Jerkins', slug: 'leather-style-jerkins', productType: 'jerkins', order: 4 },
  { name: 'Rainproof Jerkins', slug: 'rainproof-jerkins', productType: 'jerkins', order: 5 },
  { name: 'Winter Jerkins', slug: 'winter-jerkins', productType: 'jerkins', order: 6 },
  // Trolleys
  { name: 'Cabin Trolleys', slug: 'cabin-trolleys', productType: 'trolleys', order: 7 },
  { name: 'Medium Trolleys', slug: 'medium-trolleys', productType: 'trolleys', order: 8 },
  { name: 'Large Trolleys', slug: 'large-trolleys', productType: 'trolleys', order: 9 }
];
