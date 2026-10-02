// One-time helper: copies the seed images into seed/images/<folder>/ so the
// project keeps its own copy and does not depend on files staying in R2.
//   cd api && npm run seed:images
// Files that already exist are skipped, so it is safe to run again.
const fs = require("fs");
const path = require("path");
const projects = require("./projectsData");

const extensionOf = (url) => path.extname(new URL(url).pathname).toLowerCase() || ".jpg";

const run = async () => {
  let saved = 0;
  let failed = 0;

  for (const project of projects) {
    const folder = path.join(__dirname, "images", project.folder);
    fs.mkdirSync(folder, { recursive: true });

    for (let index = 0; index < project.sourceImages.length; index += 1) {
      const url = project.sourceImages[index];
      const name = index === 0 ? "cover" : `gallery-${index}`;
      const target = path.join(folder, name + extensionOf(url));

      if (fs.existsSync(target)) continue;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
        saved += 1;
        console.log(`Saved ${project.folder}/${path.basename(target)}`);
      } catch (error) {
        failed += 1;
        console.error(`Could not download ${url}: ${error.message}`);
      }
    }
  }

  console.log(`Done. ${saved} saved, ${failed} failed.`);
  if (failed > 0) process.exit(1);
};

run();
