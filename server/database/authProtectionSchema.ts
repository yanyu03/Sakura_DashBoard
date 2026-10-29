import type { DatabaseConnection } from '../dbContract';
import {protectionChecksum,protectionSql} from '../authProtection';
export function applyAuthProtectionSchema(db: DatabaseConnection) {
  const old = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=13")
    .get() as { checksum: string } | undefined;
  if (old) {
    if (old.checksum !== protectionChecksum)
      throw new Error("Migration 13 checksum mismatch");
    return;
  }
  db.transaction(() => {
    db.prepare(protectionSql).run();
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(13,?,?)",
    ).run("persistent-authentication-cooldowns", protectionChecksum);
  })();
}