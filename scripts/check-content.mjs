import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "src", "posts");
const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".md"))
  .sort();

let errors = 0;
let warnings = 0;

const asDateString = (value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
};

for (const file of files) {
  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data, content } = matter(raw);
  const issues = [];
  const notes = [];

  if (!data.title || typeof data.title !== "string") {
    issues.push("title ausente");
  }

  if (!data.description || typeof data.description !== "string") {
    issues.push("description ausente");
  } else if (data.description.length > 160) {
    notes.push(`description com ${data.description.length} caracteres (ideal: até 160)`);
  }

  if (!data.date) {
    issues.push("date ausente");
  } else if (Number.isNaN(new Date(data.date).getTime())) {
    issues.push("date inválida");
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    notes.push("sem tags");
  }

  if (content.trim().length < 200) {
    notes.push("corpo com menos de 200 caracteres");
  }

  const datePrefix = asDateString(data.date);
  if (datePrefix && !file.startsWith(datePrefix)) {
    notes.push(`nome do arquivo não começa com ${datePrefix}`);
  }

  if (data.draft) {
    notes.push("marcado como rascunho; não será publicado");
  }

  if (issues.length === 0 && notes.length === 0) {
    console.log(`ok   ${file}`);
  } else {
    if (issues.length > 0) errors += issues.length;
    if (notes.length > 0) warnings += notes.length;

    console.log(`${issues.length > 0 ? "erro" : "aviso"} ${file}`);
    issues.forEach((issue) => console.log(`     - ${issue}`));
    notes.forEach((note) => console.log(`     - ${note}`));
  }
}

console.log("");
console.log(`${files.length} arquivo(s), ${errors} erro(s), ${warnings} aviso(s)`);

if (errors > 0) process.exit(1);
