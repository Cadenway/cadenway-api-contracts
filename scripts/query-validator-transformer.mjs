/** Give Orval's Zod generator a body-capable operation for each HTTP QUERY operation. */
export default function queryValidatorTransformer(document) {
  const paths = { ...document.paths };
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    if (!item?.query) continue;
    const syntheticPath = `${path}/__query_validator`;
    if (Object.hasOwn(paths, syntheticPath)) {
      throw new Error(`QUERY validator path already exists: ${syntheticPath}`);
    }
    const { query, ...otherOperations } = item;
    paths[path] = otherOperations;
    paths[syntheticPath] = { parameters: item.parameters, post: query };
  }
  return { ...document, paths };
}
