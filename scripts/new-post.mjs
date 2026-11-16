import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('Uso: npm run new -- "Título do texto"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const now = new Date();
const date = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("-");

const file = path.join("src", "posts", `${date}-${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`Já existe: ${file}`);
  process.exit(1);
}

const frontmatter = [
  "---",
  `title: ${JSON.stringify(title)}`,
  'description: ""',
  `date: ${date}`,
  "tags: []",
  "---",
  "",
  "Escreva aqui. O primeiro parágrafo vira a abertura do texto.",
  "",
  "## Primeira seção",
  "",
  "Conteúdo.",
  "",
].join("\n");

fs.writeFileSync(file, frontmatter, "utf8");

console.log(`Criado: ${file}`);
console.log("Preencha description e tags, e escreva o corpo.");

spawnSync("code", ["-r", file], { stdio: "ignore" });
