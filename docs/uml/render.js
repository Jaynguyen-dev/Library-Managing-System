const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const plantumlEncoder = require("plantuml-encoder");

const PUML_PATH = path.join(__dirname, "class_diagram.puml");
const OUTPUT_DIR = __dirname;

const FORMATS = [
  { ext: "svg", type: "svg" },
  { ext: "png", type: "png" },
  { ext: "jpg", type: "jpg" },
];

function download(url, outputPath, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects <= 0) return reject(new Error("Too many redirects"));
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { timeout: 120000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        console.log(`  Following redirect to ${redirectUrl.substring(0, 80)}...`);
        return download(redirectUrl, outputPath, redirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        fs.writeFileSync(outputPath, Buffer.concat(chunks));
        resolve(Buffer.concat(chunks).length);
      });
    }).on("error", reject).on("timeout", function() {
      this.destroy();
      reject(new Error("Timeout"));
    });
  });
}

async function renderDiagram() {
  const pumlSource = fs.readFileSync(PUML_PATH, "utf-8");
  const encoded = plantumlEncoder.encode(pumlSource);

  for (const fmt of FORMATS) {
    const url = `https://www.plantuml.com/plantuml/${fmt.type}/${encoded}`;
    console.log(`Fetching ${fmt.ext}...`);
    const outPath = path.join(OUTPUT_DIR, `class_diagram.${fmt.ext}`);
    try {
      const bytes = await download(url, outPath);
      console.log(`  Saved: class_diagram.${fmt.ext} (${(bytes / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  Failed to render ${fmt.ext}: ${err.message}`);
    }
  }

  console.log("\nDone! Files saved to:", OUTPUT_DIR);
}

renderDiagram();
