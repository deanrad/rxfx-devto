const fs = require("fs");
const path = require("path");

const ARTICLES = "articles.json";

// Path to the input JSON file
const inputFilePath = path.join(__dirname, ARTICLES);

// Directory where markdown files will be created
const outputDir = path.join(__dirname, "markdown_files");

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read the JSON file
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  try {
    const records = JSON.parse(data);

    // Process each record
    records.forEach((record) => {
      const { slug, body_markdown } = record;

      if (!slug || !body_markdown) {
        console.warn(
          `Record skipped due to missing slug or body_markdown:`,
          record
        );
        return;
      }

      const fileName = `${slug}.md`;
      const filePath = path.join(outputDir, fileName);

      // Write the markdown file
      fs.writeFile(filePath, body_markdown, "utf8", (err) => {
        if (err) {
          console.error(`Error writing file for slug "${slug}":`, err);
        } else {
          console.log(`Markdown file created: ${filePath}`);
        }
      });
    });
  } catch (parseError) {
    console.error("Error parsing JSON data:", parseError);
  }
});
