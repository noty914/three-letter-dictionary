import { promises as fs } from "node:fs";
import path from "node:path";

const termsDir = path.resolve("src/content/terms");

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return null;
  }
  return {
    fullMatch: match[0],
    body: match[1],
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  };
}

function parseRelated(frontmatterBody) {
  const relatedMatch = frontmatterBody.match(/^related:\s*\[(.*)\]\s*$/m);
  if (!relatedMatch) {
    return { related: [], hasRelated: false };
  }

  const raw = relatedMatch[1].trim();
  if (!raw) {
    return { related: [], hasRelated: true };
  }

  const related = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return { related, hasRelated: true };
}

function uniquePreserveOrder(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

async function main() {
  const dirEntries = await fs.readdir(termsDir, { withFileTypes: true });
  const termFiles = dirEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const terms = new Map();

  for (const fileName of termFiles) {
    const slug = path.basename(fileName, ".md");
    const filePath = path.join(termsDir, fileName);
    const text = await fs.readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(text);

    if (!frontmatter) {
      console.warn(`skip(no frontmatter): ${fileName}`);
      continue;
    }

    const { related, hasRelated } = parseRelated(frontmatter.body);
    terms.set(slug, {
      slug,
      filePath,
      text,
      frontmatter,
      hasRelated,
      related: uniquePreserveOrder(related),
    });
  }

  const slugs = new Set(terms.keys());
  const relatedSets = new Map();

  for (const [slug, term] of terms.entries()) {
    const set = new Set(term.related.filter((target) => slugs.has(target)));
    relatedSets.set(slug, set);
  }

  for (const [slug, set] of relatedSets.entries()) {
    for (const target of set) {
      const targetSet = relatedSets.get(target);
      if (!targetSet) continue;
      targetSet.add(slug);
    }
  }

  let changedFiles = 0;

  for (const [slug, term] of terms.entries()) {
    const existing = term.related.filter((target) => slugs.has(target));
    const mergedSet = relatedSets.get(slug) ?? new Set();
    const additions = [...mergedSet]
      .filter((target) => !existing.includes(target))
      .sort((a, b) => a.localeCompare(b));
    const finalRelated = uniquePreserveOrder([...existing, ...additions]);
    const newRelatedLine = `related: [${finalRelated.join(", ")}]`;

    let nextFrontmatterBody;
    if (term.hasRelated) {
      nextFrontmatterBody = term.frontmatter.body.replace(
        /^related:\s*\[(.*)\]\s*$/m,
        newRelatedLine
      );
    } else {
      nextFrontmatterBody = `${term.frontmatter.body}\n${newRelatedLine}`;
    }

    const eol = term.text.includes("\r\n") ? "\r\n" : "\n";
    const nextFrontmatterFull = `---${eol}${nextFrontmatterBody}${eol}---`;
    const nextText =
      term.text.slice(0, term.frontmatter.start) +
      nextFrontmatterFull +
      term.text.slice(term.frontmatter.end);

    if (nextText !== term.text) {
      await fs.writeFile(term.filePath, nextText, "utf8");
      changedFiles += 1;
    }
  }

  let edgeCount = 0;
  let missingReverse = 0;
  for (const [slug, set] of relatedSets.entries()) {
    edgeCount += set.size;
    for (const target of set) {
      const reverse = relatedSets.get(target);
      if (!reverse || !reverse.has(slug)) {
        missingReverse += 1;
      }
    }
  }

  console.log(`terms: ${terms.size}`);
  console.log(`edges: ${edgeCount}`);
  console.log(`missingReverse: ${missingReverse}`);
  console.log(`changedFiles: ${changedFiles}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
