import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { rssPlugin } from "@11ty/eleventy-plugin-rss";
import Shiki from "@shikijs/markdown-it";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const stripHtml = (html) => String(html).replace(/<[^>]+>/g, " ");

const isPublished = (item) =>
  !item.data.draft && item.date <= new Date();

const getPosts = (collectionApi) =>
  collectionApi
    .getFilteredByGlob("src/posts/*.md")
    .filter(isPublished)
    .sort((a, b) => b.date - a.date);

const monthsShort = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export default async function (eleventyConfig) {
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  md.use(
    await Shiki({
      theme: "vesper",
      langs: [
        "bash", "shell", "css", "diff", "go", "html", "ini", "js", "json",
        "jsx", "md", "python", "rust", "sql", "ts", "tsx", "yaml",
      ],
    }),
  );

  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.linkInsideHeader({
      symbol: "#",
      class: "heading-anchor",
      placement: "after",
    }),
    slugify,
  });

  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: ["auto", 640, 960],
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
    },
  });

  eleventyConfig.addFilter("toc", (content) => {
    const headings = [
      ...String(content).matchAll(
        /<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g,
      ),
    ].map(([, level, id, inner]) => ({
      level: Number(level),
      id,
      text: inner
        .replace(/<a\b[^>]*class="heading-anchor"[^>]*>[\s\S]*?<\/a>/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    }));

    if (headings.length === 0) return "";

    const items = headings
      .map(
        (heading) =>
          `<li class="toc-level-${heading.level}"><a href="#${heading.id}">${heading.text}</a></li>`,
      )
      .join("");

    return `<nav class="toc" aria-label="Sumário"><ol>${items}</ol></nav>`;
  });

  eleventyConfig.addFilter("slugify", slugify);

  eleventyConfig.addFilter("longDate", (date) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
  );

  eleventyConfig.addFilter("shortDate", (date) => {
    const d = new Date(date);
    return `${String(d.getUTCDate()).padStart(2, "0")} ${monthsShort[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });

  eleventyConfig.addFilter("isoDate", (date) =>
    new Date(date).toISOString().slice(0, 10),
  );

  eleventyConfig.addFilter("readingTime", (content) => {
    const text = stripHtml(content).replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return `${minutes} min de leitura`;
  });

  eleventyConfig.addFilter("wordCount", (content) => {
    const text = stripHtml(content).replace(/\s+/g, " ").trim();
    return text ? text.split(" ").length : 0;
  });

  eleventyConfig.addFilter("postsByTag", (posts, tag) =>
    posts.filter((post) => (post.data.tags || []).includes(tag)),
  );

  eleventyConfig.addCollection("posts", (collectionApi) => getPosts(collectionApi));

  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const counts = new Map();

    getPosts(collectionApi).forEach((post) => {
      (post.data.tags || []).forEach((tag) => {
        if (tag === "posts") return;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
      .map(([name, count]) => ({ name, count, slug: slugify(name) }));
  });

  eleventyConfig.addCollection("postsByYear", (collectionApi) => {
    const groups = new Map();

    getPosts(collectionApi).forEach((post) => {
      const year = new Date(post.date).getUTCFullYear();
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(post);
    });

    return [...groups.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, posts]) => ({ year, posts }));
  });

  eleventyConfig.addShortcode("year", () => new Date().getFullYear());
  eleventyConfig.addGlobalData("buildDate", () => new Date());

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ public: "/" });

  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
