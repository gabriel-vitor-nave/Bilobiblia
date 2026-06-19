const readline = require("readline");
const fs = require("fs");

const DB_FILE = "./biloles-db.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { ptToBl: {}, blToPt: {} };
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDB();

/*
========================================
DICIONÁRIO SAGRADO (EXCEÇÕES)
========================================
*/

const specialPtToBl = {
  bilola: "bll",
  furico: "frk",
  terra: "teron",
  sol: "soln",
  agua: "aqun",
};

const specialBlToPt = Object.fromEntries(
  Object.entries(specialPtToBl).map(([k, v]) => [v, k])
);

/*
========================================
NORMALIZAÇÃO
========================================
*/

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:()"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
========================================
HASH + SEED DETERMINÍSTICO
========================================
*/

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function seededShuffle(str, seed) {
  const arr = str.split("");

  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join("");
}

/*
========================================
BOINGOING CIPHER (FIXO)
========================================
*/

function toBoingoing(word) {
  const clean = word.replace(/[^a-z]/g, "");

  if (clean.length <= 1) {
    return clean + "oing";
  }

  const seed = hashString(clean);
  const scrambled = seededShuffle(clean, seed);

  return scrambled + "oing";
}

/*
========================================
PORTUGUÊS -> BILOLÊS
========================================
*/

function toBiloles(text) {
  return normalize(text)
    .split(" ")
    .map(word => {
      if (specialPtToBl[word]) {
        return specialPtToBl[word];
      }

      if (!db.ptToBl[word]) {
        const encoded = toBoingoing(word);

        db.ptToBl[word] = encoded;
        db.blToPt[encoded] = word;

        return encoded;
      }

      return db.ptToBl[word];
    })
    .join(" ");
}

/*
========================================
BILOLÊS -> PORTUGUÊS
========================================
*/

function toPortuguese(text) {
  return normalize(text)
    .split(" ")
    .map(word => {
      if (specialBlToPt[word]) return specialBlToPt[word];

      if (db.blToPt[word]) return db.blToPt[word];

      if (word.endsWith("oing")) {
        return `[~${word.slice(0, -4)}]`;
      }

      return `[?${word}]`;
    })
    .join(" ");
}

/*
========================================
CLI
========================================
*/

console.log("\n=== TRADUTOR DE BILOLÊS (BOINGOING DETERMINÍSTICO) ===");
console.log("1 - Português -> Bilolês");
console.log("2 - Bilolês -> Português\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Escolha o modo: ", (mode) => {
  rl.question("Digite o texto: ", (input) => {

    if (mode === "1") {
      const result = toBiloles(input);
      saveDB(db);

      console.log("\nBILOLÊS:");
      console.log(result);
    }

    else if (mode === "2") {
      console.log("\nPORTUGUÊS:");
      console.log(toPortuguese(input));
    }

    else {
      console.log("Modo inválido. Nem o Boingoing conseguiu interpretar isso.");
    }

    rl.close();
  });
});