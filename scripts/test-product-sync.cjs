const assert = require("node:assert/strict");
const fs = require("node:fs");
const { stripTypeScriptTypes } = require("node:module");
async function load(file, imports = {}) {
  let code = stripTypeScriptTypes(fs.readFileSync(file, "utf8"));
  for (const [path, url] of Object.entries(imports))
    code = code.replaceAll(`"${path}"`, JSON.stringify(url));
  const url =
    "data:text/javascript;base64," + Buffer.from(code).toString("base64");
  return { url, module: await import(url) };
}
async function main() {
  const {
    module: { productHeaders, parseProductSheet },
  } = await load("lib/product-sheet.ts");
  const {
    module: { products },
  } = await load("lib/products.ts");
  const sizes = await load("lib/product-sizes.ts");
  const { sizePrice } = sizes.module;
  const {
    module: { parseOrder, orderRows },
  } = await load("lib/orders.ts", { "./product-sizes": sizes.url });
  const {
    module: { cartItems, changeCartSize, readCart },
  } = await load("lib/cart.ts", { "./product-sizes": sizes.url });
  const rows = [
    productHeaders,
    ...products.map((p) => [
      p.id,
      p.name.trim(),
      p.family,
      p.notes.trim(),
      p.price,
      ...["5ml", "10ml", "30ml", "50ml"].map((s) => sizePrice(p, s)),
      p.priceLabel ?? "",
      p.image,
      p.tint,
      p.popular,
      true,
    ]),
  ];
  const catalog = parseProductSheet(rows);
  assert.equal(catalog.length, 32);
  const imageRows = [
    [...productHeaders, "Detail Image URLs"],
    [...rows[1], "/img/detail-one.png\nhttps://example.com/detail-two.jpg"],
  ];
  assert.deepEqual(parseProductSheet(imageRows)[0].detailImages, [
    "/img/detail-one.png",
    "https://example.com/detail-two.jpg",
  ]);
  imageRows[1][14] = "";
  assert.deepEqual(parseProductSheet(imageRows)[0].detailImages, []);
  imageRows[1][14] = "javascript:alert(1)";
  assert.throws(() => parseProductSheet(imageRows), /Detail Image URLs/);
  for (let i = 0; i < products.length; i++)
    for (const s of ["full", "5ml", "10ml", "30ml", "50ml"])
      assert.equal(sizePrice(catalog[i], s), sizePrice(products[i], s));
  assert.equal(
    parseProductSheet([...rows, [...Array(12).fill(""), false, false]]).length,
    32,
  );
  const changed = structuredClone(rows);
  changed[1][4] = 570000;
  changed[1][5] = 36000;
  const updated = parseProductSheet(changed);
  assert.equal(sizePrice(updated[0], "full"), 570000);
  assert.equal(sizePrice(updated[0], "5ml"), 36000);
  assert.equal(cartItems({ "8321:5ml": 2 }, updated)[0].price, 36000);
  const newRow = [...rows[1]];
  newRow[0] = "new-perfume";
  const added = parseProductSheet([...rows, newRow]);
  assert.equal(cartItems({ "new-perfume:5ml": 1 }, added).length, 1);
  assert.deepEqual(
    changeCartSize({ "new-perfume:5ml": 1 }, "new-perfume:5ml", "10ml", added),
    { "new-perfume:10ml": 1 },
  );
  global.localStorage = {
    getItem: () =>
      JSON.stringify({ "new-perfume:5ml": 1, 8321: 2, "bad:wrong": 1 }),
  };
  assert.deepEqual(readCart(), { "new-perfume:5ml": 1, "8321:full": 2 });
  const hidden = structuredClone(rows);
  hidden[1][13] = false;
  assert.equal(
    parseProductSheet(hidden).some((p) => p.id === "8321"),
    false,
  );
  for (const bad of ["", "oops", -1, 0, 1.5]) {
    const invalid = structuredClone(rows);
    invalid[1][4] = bad;
    assert.throws(() => parseProductSheet(invalid));
  }
  assert.throws(() => parseProductSheet([...rows, rows[1]]));
  assert.throws(() => parseProductSheet([["ID"], ["8321"]]));
  const order = {
    requestId: "00000000-0000-4000-8000-000000000000",
    name: "Test",
    phone1: "09123456789",
    phone2: "",
    address: "Test address",
    items: [
      { productId: "8321", size: "full", quantity: 1, unitPrice: 560000 },
    ],
  };
  assert.equal(parseOrder(order, catalog).items[0].price, 560000);
  for (const input of [0.1, "10%", "10.0%"] ) {
    const promoted = parseProductSheet([[...productHeaders, "Promotion"], [...rows[1], input]]);
    assert.equal(sizePrice(promoted[0], "full"), 504000);
    assert.equal(sizePrice(promoted[0], "5ml"), 31500);
    const bag = cartItems({ "8321:5ml": 3 }, promoted)[0];
    assert.equal(bag.price * bag.quantity, 94500);
    assert.equal(bag.normalPrice, 35000);
    assert.throws(() => parseOrder(order, promoted), /price has changed/);
    const discountedOrder = { ...order, items: [{ productId: "8321", size: "5ml", quantity: 3, unitPrice: 31500 }] };
    const saved = orderRows(parseOrder(discountedOrder, promoted))[0];
    assert.deepEqual(saved.slice(8), [35000, 3, 0.1, 94500, "Pending"]);
    assert.throws(() => parseOrder(discountedOrder, catalog), /price has changed/);
  }
  for (const input of ["bad", -0.1, 10, "101%", "-1%"])
    assert.throws(() => parseProductSheet([[...productHeaders, "Promotion"], [...rows[1], input]]), /Promotion/);
  for (const [input, expected] of [["", 560000], [0, 560000], ["100%", 0]]) {
    const promoted = parseProductSheet([[...productHeaders, "Promotion"], [...rows[1], input]]);
    assert.equal(sizePrice(promoted[0], "full"), expected);
  }
  assert.equal(sizePrice({ ...catalog[0], price: 101, promotion: 0.125 }, "full"), 88);
  assert.throws(() => parseOrder(order, updated), /price has changed/);
  assert.throws(
    () => parseOrder(order, parseProductSheet(hidden)),
    /Invalid fragrance/,
  );
  console.log(
    "PASS: 32 products and all size prices, edits, additions, hidden products, checkbox rows, validation, cart preservation, and checkout price changes.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
