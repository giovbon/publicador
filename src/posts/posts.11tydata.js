export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    permalink: (data) => {
      if (data.draft) return false;
      if (data.page.date > new Date()) return false;
      return `/blog/${data.page.fileSlug}/`;
    },
  },
};
