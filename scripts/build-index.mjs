#!/usr/bin/env node
/**
 * build-index.mjs
 * Reads all book markdown files and generates public/search-index.json
 * with verse-level granularity including pre-computed page numbers.
 *
 * Run: node scripts/build-index.mjs
 * Auto-run: configured in package.json "dev" and "build" scripts
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const BOOKS_DIR = join(ROOT, 'public', 'books');
const BOOK_INDEX_OUTPUT = join(BOOKS_DIR, 'index.json');
const OUTPUT = join(ROOT, 'public', 'search-index.json');

// Characters per page (canonical pagination for index)
const CHARS_PER_PAGE = 700;

/**
 * Parse a single chapter markdown file.
 * Verses start with [N] and can span multiple markdown lines until the next [N].
 */
function parseChapter(markdown, bookSlug, bookTitle, chapterNumber) {
  const verses = [];
  const cleanMarkdown = markdown.replace(/\r/g, '');
  const lines = cleanMarkdown.split('\n');
  
  // Try to find the chapter name from the first line (e.g. "# Capítulo 1: O Princípio do Boing")
  let chapterName = '';
  if (lines.length > 0) {
    const headerMatch = lines[0].match(/^#\s+Cap[íi]tulo\s+\d+[:\-\s]+(.+)$/i);
    if (headerMatch) {
      chapterName = headerMatch[1].trim();
    }
  }

  let currentVerse = null;

  const pushCurrentVerse = () => {
    if (!currentVerse) return;
    const text = currentVerse.lines.join('\n').trim();
    if (!text) return;

    const verseObj = {
      book: bookTitle,
      bookSlug,
      chapter: chapterNumber,
      verse: currentVerse.number,
      text,
    };
    if (chapterName) {
      verseObj.chapterName = chapterName;
    }
    verses.push(verseObj);
  };

  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]\s*(.*)$/);
    if (match) {
      pushCurrentVerse();
      currentVerse = {
        number: parseInt(match[1], 10),
        lines: match[2] ? [match[2].trim()] : [],
      };
      continue;
    }

    if (currentVerse) {
      currentVerse.lines.push(line.trimEnd());
    }
  }

  pushCurrentVerse();

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

function getChapterFiles(bookDir) {
  return readdirSync(bookDir)
    .filter((f) => f.startsWith('capitulo-') && f.endsWith('.md'))
    .sort();
}

function discoverBooks() {
  const books = [];
  const entries = readdirSync(BOOKS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const slug of entries) {
    const bookDir = join(BOOKS_DIR, slug);
    const metadataPath = join(bookDir, 'metadata.json');

    if (!existsSync(metadataPath)) {
      console.warn(`Skipping ${slug}: missing metadata.json`);
      continue;
    }

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    if (metadata.slug && metadata.slug !== slug) {
      console.warn(`Skipping ${slug}: metadata.slug is "${metadata.slug}"`);
      continue;
    }

    const chapterFiles = getChapterFiles(bookDir);
    const nextMetadata = {
      ...metadata,
      slug,
      chapters: chapterFiles.length,
    };

    if (metadata.slug !== nextMetadata.slug || metadata.chapters !== nextMetadata.chapters) {
      writeFileSync(metadataPath, `${JSON.stringify(nextMetadata, null, 2)}\n`, 'utf-8');
    }

    books.push({
      slug,
      metadata: nextMetadata,
      chapterFiles,
    });
  }

  return books.sort((a, b) => {
    const orderA = Number.isFinite(a.metadata.order) ? a.metadata.order : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(b.metadata.order) ? b.metadata.order : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return (a.metadata.title ?? a.slug).localeCompare(b.metadata.title ?? b.slug);
  });
}

async function main() {
  const books = discoverBooks();
  const slugs = books.map((book) => book.slug);
  const allVerses = [];

  writeFileSync(BOOK_INDEX_OUTPUT, `${JSON.stringify(slugs, null, 2)}\n`, 'utf-8');

  for (const { slug, metadata, chapterFiles } of books) {
    const bookDir = join(BOOKS_DIR, slug);

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
