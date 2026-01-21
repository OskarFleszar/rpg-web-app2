export const toImgSrcBackground = (
  val?: string | null,
  mime = "image/jpeg",
) => {
  if (!val || val === "null" || val === "undefined" || val.trim() === "") {
    return null;
  }
  if (
    val.startsWith("data:") ||
    val.startsWith("http") ||
    val.startsWith("blob:")
  ) {
    return val;
  }
  return `data:${mime};base64,${val}`;
};
