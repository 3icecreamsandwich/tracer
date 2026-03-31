export function nowIsoSql() {
  return "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"
}
