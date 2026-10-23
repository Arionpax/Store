/* Absolute Cooked Store content. Edit only this file.
   Add a product: copy one line, paste it below the last one. Only "url" is required.
   Optional fields (they always win over auto-fetched data): name, desc, image, cat, tags, featured.
   cat: one of the ids in "cats" below. Products without a cat appear under "Picks". */
window.STORE = {
  name: "Absolute Cooked Store",
  hub: "https://ascyst.com",                 // "back to ASCYST" link
  market: "https://www.amazon.in",           // only used by products that have "query" but no "url"
  tag: "",                                   // affiliate tag, only added to "query" links (your own tagged links stay untouched)
  disclosure: "Affiliate disclosure: ASCYST may earn a commission from qualifying purchases at no extra cost to you.",

  autoFetch: true,                           // read name, image and description from a link's page (Open Graph data)
  autoSkip: ["amazon.", "amzn."],            // domains NOT read automatically (Amazon forbids automated page reading)

  cats: [
    { id: "kitchen", label: "Kitchen equipment" },
    { id: "groceries", label: "Groceries" },
    { id: "healthy", label: "Healthy food" },
    { id: "essentials", label: "Cooking essentials" }
  ],

  products: [
  
    { url: "https://link.amazon/B06IDYnvo", 
      name: "Ember Cookware Silicone Kitchen Tool Set of 5 – Ladle, Brush, Flip, Stir & Scraper", 
      image: "products/1.jpg", 
      cat: "kitchen", 
      desc: "Set of 5 silicone kitchen tools: ladle, brush, flip, stir and scraper.", 
      tags: ["silicone", "utensils"] }
  ]
};