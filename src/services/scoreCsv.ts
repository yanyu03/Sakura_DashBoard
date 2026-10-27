/** Small RFC 4180 reader for teacher-provided score files. No evaluation of cell content. */
export function parseScoreCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  const value = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (c === '"') {
      if (quoted && value[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || cell === "") quoted = !quoted;
      else throw new Error("引号位置无效");
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && value[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("CSV 引号没有闭合");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  const header = rows.shift();
  if (!header || header[0] !== "student_no" || header[1] !== "status")
    throw new Error("表头前两列必须为 student_no,status");
  return rows.map((r, index) => {
    if (r.length !== header.length)
      throw new Error(`第 ${index + 2} 行列数不符`);
    const status = r[1].trim();
    const scores =
      status === "scored"
        ? r.slice(2).map((v) => {
            if (!v.trim() || !Number.isFinite(Number(v)))
              throw new Error(`第 ${index + 2} 行存在空分数或非法数字`);
            return Number(v);
          })
        : [];
    if (status !== "scored" && r.slice(2).some((v) => v.trim()))
      throw new Error(`第 ${index + 2} 行缺考/未评分记录不能填写分数`);
    return { student_no: r[0].trim(), status, scores };
  });
}
export function downloadCsv(name: string, rows: unknown[][]) {
  const csv =
    "\uFEFF" +
    rows
      .map((r) =>
        r
          .map(
            (value) =>
              '"' +
              (typeof value === "string" && /^[=+@\-\t\r]/.test(value)
                ? "'" + value
                : String(value ?? "")
              ).replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
