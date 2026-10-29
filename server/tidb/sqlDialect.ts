/** Deliberately bounded compatibility for the existing parameterized application SQL. */
export function tidbSql(input: string): string {
  return input
    .replace(
      /\btitle\s*\|\|\s*(summary|body)\s*\|\|\s*tags_json\b/gi,
      "CONCAT(title,$1,tags_json)",
    )
    .replace(
      /^SELECT COUNT\(\*\) AS n FROM sqlite_master WHERE type='table'$/i,
      "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE'",
    )
    .replace(
      /JOIN organization_unit_profiles p ON p\.unit_id=\(SELECT unit_id FROM organization_positions WHERE id=a\.position_id\)/gi,
      "JOIN organization_positions qp ON qp.id=a.position_id JOIN organization_unit_profiles p ON p.unit_id=qp.unit_id",
    )
    .replace(
      /strftime\('%Y-%m-%dT%H:%M:%fZ',\s*'now'\)/gi,
      "DATE_FORMAT(UTC_TIMESTAMP(3),'%Y-%m-%dT%H:%i:%s.%fZ')",
    )
    .replace(
      /datetime\('now'(?:,\s*'localtime')?\)/gi,
      "DATE_FORMAT(UTC_TIMESTAMP(),'%Y-%m-%d %H:%i:%s')",
    )
    .replace(
      /\bdate\(([^()]+)\)/gi,
      "DATE_FORMAT(STR_TO_DATE($1,'%Y-%m-%d'),'%Y-%m-%d')",
    )
    .replace(/COLLATE NOCASE/gi, "COLLATE utf8mb4_general_ci")
    .replace(/\bINSERT OR IGNORE\b/gi, "INSERT IGNORE")
    .replace(/ON CONFLICT\([^)]*\) DO UPDATE SET/gi, "ON DUPLICATE KEY UPDATE")
    .replace(/\bexcluded\.([a-z_][a-z_0-9]*)/gi, "VALUES(`$1`)")
    .replace(/\blength\(/gi, "CHAR_LENGTH(")
    .replace(/\bjson_valid\(/gi, "JSON_VALID(")
    .replace(/NOT GLOB '\*\[\^0-9a-f\]\*'/gi, "NOT REGEXP '[^0-9a-f]'")
    .replace(/"([a-z_][a-z_0-9]*)"/gi, "`$1`");
}
export function splitSqlList(text: string) {
  const result: string[] = [];
  let depth = 0,
    quote = "",
    start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) {
        if (text[i + 1] === quote) i++;
        else quote = "";
      }
    } else if (c === "'" || c === '"' || c === "`") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "," && !depth) {
      result.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  result.push(text.slice(start).trim());
  return result;
}
export function sqlGroups(text: string, keyword: string) {
  const result: string[] = [];
  const matcher = new RegExp("\\b" + keyword + "\\s*\\(", "gi");
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(text))) {
    let depth = 1,
      quote = "",
      i = matcher.lastIndex;
    const start = i;
    for (; i < text.length && depth; i++) {
      const c = text[i];
      if (quote) {
        if (c === quote) {
          if (text[i + 1] === quote) i++;
          else quote = "";
        }
      } else if (c === "'" || c === '"') quote = c;
      else if (c === "(") depth++;
      else if (c === ")") depth--;
    }
    if (depth) throw Error("Unbalanced SQL definition");
    result.push(text.slice(start, i - 1));
    matcher.lastIndex = i;
  }
  return result;
}
