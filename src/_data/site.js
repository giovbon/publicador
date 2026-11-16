export default {
  title: "Caderno",
  author: "Seu Nome",
  role: "Desenvolvedor de software",
  description:
    "Notas sobre programação, infraestrutura e o ofício de escrever código.",
  url: "https://seudominio.com",
  lang: "pt-BR",
  locale: "pt_BR",
  email: "voce@seudominio.com",
  github: "https://github.com/seu-usuario",
  linkedin: "https://www.linkedin.com/in/seu-usuario/",
  social: [
    { label: "GitHub", url: "https://github.com/seu-usuario" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/seu-usuario/" },
    { label: "RSS", url: "/feed.xml" },
  ],
  nav: [
    { label: "Escritos", url: "/" },
    { label: "Arquivo", url: "/arquivo/" },
    { label: "Tags", url: "/tags/" },
    { label: "Sobre", url: "/sobre/" },
    { label: "Agora", url: "/agora/" },
    { label: "Busca", url: "/busca/" },
  ],
  buildYear: new Date().getFullYear(),
};
