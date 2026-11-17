export function parseCsv(input: string): string[][] {
  if (input.length > 2_000_000) throw new Error('CSV exceeds 2 MB.');
  const rows: string[][] = [], row: string[] = [];
  let field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && !field) quoted = true;
    else if (char === ',') { row.push(field.trim()); field = ''; }
    else if (char === '\r' || char === '\n') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field.trim()); field = '';
      if (row.some(value => value)) rows.push([...row]);
      row.length = 0;
      if (rows.length > 2001) throw new Error('CSV exceeds 2,000 data rows.');
    } else field += char;
  }
  if (quoted) throw new Error('CSV has an unclosed quoted field.');
  row.push(field.trim());
  if (row.some(value => value)) rows.push(row);
  if (!rows.length) throw new Error('CSV is empty.');
  return rows;
}

export function csvExport(rows: unknown[][]): string {
  return '\uFEFF' + rows.map(row => row.map(value => {
    const raw = String(value ?? '');
    const safe = /^[\s\uFEFF]*[=+@\-]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(',')).join('\r\n');
}
