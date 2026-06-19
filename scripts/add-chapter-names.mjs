import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const BOOKS_DIR = join(ROOT, 'public', 'books');

const CHAPTER_NAMES = {
  "boingenesis": {
    1: "O Princípio do Boing",
    2: "A Serpente e o Furico",
    3: "O Primeiro Boingoingoing"
  },
  "mandamentos-de-bilola": {
    1: "As Leis do Monte Bilola",
    2: "A Quebra das Tábuas"
  },
  "proverbios-bilolicos": {
    1: "A Sabedoria dos Justos",
    2: "O Caminho da Retidão"
  },
  "atos-dos-boingadores": {
    1: "A Reunião dos Guerreiros",
    2: "As Primeiras Boingadas"
  },
  "lamentacoes-contra-o-furico": {
    1: "A Tristeza do Desvio",
    2: "A Queda e o Choro"
  },
  "cronicas-boingais": {
    1: "O Reinado de Bilola",
    2: "A Dinastia do Boing"
  },
  "profecias-do-grande-boingoingoing": {
    1: "A Revelação do Som",
    2: "O Juízo Final"
  },
  "apocalibola": {
    1: "As Sete Trombetas",
    2: "O Novo Boing-Céu"
  }
};

async function main() {
  const slugs = JSON.parse(readFileSync(join(BOOKS_DIR, 'index.json'), 'utf-8'));

  for (const slug of slugs) {
    const bookDir = join(BOOKS_DIR, slug);
    const names = CHAPTER_NAMES[slug];
    if (!names) {
      console.warn(`⚠️ No names configured for book slug: ${slug}`);
      continue;
    }

    const chapterFiles = readdirSync(bookDir)
      .filter((f) => f.startsWith('capitulo-') && f.endsWith('.md'))
      .sort();

    for (const file of chapterFiles) {
      const chapterMatch = file.match(/capitulo-(\d+)\.md/);
      if (!chapterMatch) continue;
      const chapterNumber = parseInt(chapterMatch[1], 10);

      const name = names[chapterNumber];
      if (!name) {
        console.warn(`⚠️ No name configured for ${slug} chapter ${chapterNumber}`);
        continue;
      }

      const filePath = join(bookDir, file);
      let content = readFileSync(filePath, 'utf-8');
      
      // Replace the first line if it matches '# Capítulo N' (without name)
      // or '# Capítulo N: Name' (with name, to update it safely)
      const lines = content.split('\n');
      if (lines.length > 0 && lines[0].startsWith('# Capítulo')) {
        lines[0] = `# Capítulo ${chapterNumber}: ${name}`;
        content = lines.join('\n');
        writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Updated ${slug}/${file} -> "# Capítulo ${chapterNumber}: ${name}"`);
      }
    }
  }
}

main().catch(console.error);
