/* eslint-disable @typescript-eslint/no-var-requires */
const { faker } = require("@faker-js/faker");
const fs = require("fs");

const pageTemplate = (content) => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Mithras Web Extension Test Page</title>
    
  </head>
  <body>
    <p>View source.</p>
    ${content}
  </body>
</html>`;
};

const productTemplate = (doc) => {
    return `
    <div>
      <!-- https://schema.org/Product -->
      <pre>
${JSON.stringify(doc, null, 2)}
      </pre>
      <script type="application/ld+json">
${JSON.stringify(doc, null, 2)}
      </script>
    </div>
`;
};

const productDoc = (seed) => {
    faker.seed(seed);
    return {
        "@context": { "@vocab": "https://schema.org/" },
        "@type": "Product",
        aggregateRating: {
            "@type": "AggregateRating",
            bestRating: faker.datatype.number({ min: 1, max: 100 }),
            ratingCount: faker.datatype.number({ min: 1, max: 100 }),
            ratingValue: faker.datatype.number({ min: 1, max: 100 }),
        },
        image: faker.image.business(),
        name: faker.commerce.productName(),
        offers: {
            "@type": "AggregateOffer",
            highPrice: faker.commerce.price(100),
            lowPrice: faker.commerce.price(10),
            offerCount: faker.datatype.number({ min: 1, max: 10 }),
            offers: [
                {
                    "@type": "Offer",
                    url: faker.internet.url(),
                },
                {
                    "@type": "Offer",
                    url: faker.internet.url(),
                },
            ],
        },
    };
};

(async () => {
    console.log("generating random test page...");
    const products = [];
    for (let i = 0; i < 10; i++) {
        const product = productDoc(i);
        products.push(product);
    }
    // console.log(JSON.stringify(products, null, 2));
    const pageContent = products.map(productTemplate).join("\n");
    fs.writeFileSync("./docs/index.html", pageTemplate(pageContent));
})();
