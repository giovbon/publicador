/* Tema ------------------------------------------------------------------- */

const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const THEME_KEY = "tema";

const themeLabel = () =>
  root.dataset.theme === "dark"
    ? "Mudar para o tema claro"
    : "Mudar para o tema escuro";

if (themeToggle) {
  themeToggle.setAttribute("aria-label", themeLabel());

  themeToggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    themeToggle.setAttribute("aria-label", themeLabel());

    try {
      localStorage.setItem(THEME_KEY, next === "light" ? "claro" : "escuro");
    } catch (_) {
      /* armazenamento indisponível: o tema vale só nesta visita */
    }
  });
}

/* Progresso de leitura --------------------------------------------------- */

const progress = document.querySelector("[data-progress]");
const article = document.querySelector(".post-body");

if (progress && article) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    progress.style.width = `${percentage}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

/* Blocos de código ------------------------------------------------------- */

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }

    textarea.remove();
    return ok;
  }
};

document.querySelectorAll("pre.shiki").forEach((pre) => {
  if (pre.closest(".code-block")) return;

  const code = pre.querySelector("code");
  if (!code) return;

  const languageClass = [...code.classList].find((name) =>
    name.startsWith("language-"),
  );
  const language = languageClass
    ? languageClass.replace("language-", "")
    : "código";

  const wrapper = document.createElement("div");
  wrapper.className = "code-block";

  const bar = document.createElement("div");
  bar.className = "code-bar";

  const label = document.createElement("span");
  label.textContent = language;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "code-copy";
  button.textContent = "copiar";

  button.addEventListener("click", async () => {
    const ok = await copyText(code.textContent);
    button.textContent = ok ? "copiado" : "erro";
    window.setTimeout(() => {
      button.textContent = "copiar";
    }, 1600);
  });

  bar.append(label, button);
  pre.parentNode.insertBefore(wrapper, pre);
  wrapper.append(bar, pre);
});

/* Sumário: destaca a seção visível --------------------------------------- */

const toc = document.querySelector(".post-aside .toc");

if (toc) {
  const links = [...toc.querySelectorAll('a[href^="#"]')];

  const entries = links
    .map((link) => {
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const heading = document.getElementById(id);
      return heading ? { link, heading, id } : null;
    })
    .filter(Boolean);

  if (entries.length > 0) {
    const setActive = (id) => {
      entries.forEach(({ link, id: entryId }) => {
        if (entryId === id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    entries.forEach(({ heading }) => observer.observe(heading));
  }
}
