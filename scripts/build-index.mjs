#!/usr/bin/env node
/**
 * build-index.mjs
 * Reads all book markdown files and generates public/search-index.json
 * with verse-level granularity including pre-computed page numbers.
 *
 * Run: node scripts/build-index.mjs
 * Auto-run: configured in package.json "prebuild" script
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const BOOKS_DIR = join(ROOT, 'public', 'books');
const OUTPUT = join(ROOT, 'public', 'search-index.json');

// Characters per page (canonical pagination for index)
const CHARS_PER_PAGE = 700;

/**
 * Parse a single chapter markdown file.
 * Verses are denoted by [N] at the start of a paragraph.
 */
function parseChapter(markdown, bookSlug, bookTitle, chapterNumber) {
  const verses = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]\s+(.+)$/);
    if (match) {
      verses.push({
        book: bookTitle,
        bookSlug,
        chapter: chapterNumber,
        verse: parseInt(match[1], 10),
        text: match[2].trim(),
      });
    }
  }

  return verses;
}

/**
 * Compute page number based on cumulative character count.
 */
function assignPages(allVerses) {
  let charCount = 0;
  let pageNumber = 1;

  return allVerses.map((verse) => {
    const verseLength = verse.text.length + 20; // +20 for number prefix overhead
    charCount += verseLength;
    if (charCount > CHARS_PER_PAGE) {
      pageNumber++;
      charCount = verseLength;
    }
    return { ...verse, page: pageNumber };
  });
}

async function main() {
  const slugs = JSON.parse(readFileSync(join(BOOKS_DIR, 'index.json'), 'utf-8'));
  const allVerses = [];

  for (const slug of slugs) {
    const bookDir = join(BOOKS_DIR, slug);
    const metadata = JSON.parse(readFileSync(join(bookDir, 'metadata.json'), 'utf-8'));

    // Find all chapter files, sorted
    const chapterFiles = readdirSync(bookDir)
      .filter((f) => f.startsWith('capitulo-') && f.endsWith('.md'))
      .sort();

    for (const file of chapterFiles) {
      // Extract chapter number from filename: capitulo-01.md → 1
      const chapterMatch = file.match(/capitulo-(\d+)\.md/);
      if (!chapterMatch) continue;
      const chapterNumber = parseInt(chapterMatch[1], 10);

      const content = readFileSync(join(bookDir, file), 'utf-8');
      const verses = parseChapter(content, slug, metadata.title, chapterNumber);
      allVerses.push(...verses);
    }
  }

  // Assign canonical page numbers across all verses globally
  const indexed = assignPages(allVerses);

  writeFileSync(OUTPUT, JSON.stringify(indexed, null, 2), 'utf-8');

  // Stats
  const bookStats = {};
  for (const v of indexed) {
    if (!bookStats[v.book]) bookStats[v.book] = { chapters: new Set(), verses: 0 };
    bookStats[v.book].chapters.add(v.chapter);
    bookStats[v.book].verses++;
  }

  console.log(`\n✅ Search index generated: ${indexed.length} verses across ${slugs.length} books\n`);
  for (const [book, stats] of Object.entries(bookStats)) {
    console.log(`  📖 ${book}: ${stats.chapters.size} capítulos, ${stats.verses} versículos`);
  }
  console.log(`\n  📄 Total de páginas: ${indexed[indexed.length - 1]?.page ?? 0}`);
  console.log(`\n  💾 Salvo em: public/search-index.json\n`);
}

main().catch(console.error);
