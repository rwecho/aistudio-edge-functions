export const postProcessImages = (urlHash: string, markdown: string) => {
  markdown = markdown.replace(
    /\.\/(image-.*?\.(jpg|jpeg|png|gif))/g,
    (_, p1) => {
      const root = process.env.NEXT_PUBLIC_API_URL;
      // combine root and path
      return `${root}/articles/${urlHash}/${p1}`;
    }
  );
  return markdown;
};
