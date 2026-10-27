// Keep local verification writes out of the repository's tracked SQLite WAL.
process.env.SAKURA_DATA_DIR ||= '.local-data';
process.env.SAKURA_DEMO_MODE ||= 'true';
await import('../server');
