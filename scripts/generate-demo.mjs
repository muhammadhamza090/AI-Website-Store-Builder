const brief = {
  businessName: "LuxeNest",
  industry: "Premium home decor",
  targetAudience: "Modern homeowners who value elegant design",
  productsOrServices: "Furniture, candles, wall art",
  preferredStyle: "Elegant, warm, premium",
  preferredColors: "Warm neutrals with a rich accent",
  ecommerceType: "DTC ecommerce store",
  brandTone: "Confident, refined, welcoming"
};

const url = process.env.DEMO_URL || "http://localhost:3000/api/generate";

console.log("Generating demo site via", url);

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(brief)
});

const json = await res.json();
if (!res.ok) {
  console.error("Generation failed:", json);
  process.exit(1);
}

console.log("siteId:", json.siteId);
console.log("preview:", `http://localhost:3000/preview/${json.siteId}`);

