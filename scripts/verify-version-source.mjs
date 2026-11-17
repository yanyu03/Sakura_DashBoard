import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json"));
const lock = JSON.parse(read("package-lock.json"));
const version = pkg.version;
assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
assert.equal(lock.version, version, "package-lock.json root version mismatch");
assert.equal(lock.packages[""].version, version, "package-lock.json package version mismatch");
assert.ok(read("README.md").includes(`**${version}**`), "Chinese README version drift");
assert.ok(read("README.en.md").includes(`**${version}**`), "English README version drift");
assert.ok(read("docs/README.md").includes(`应用 ${version}`), "Docs index version drift");
assert.ok(read("docs/VERSIONING.md").includes(`Application (development branch): \`${version}\``), "Version guide drift");
assert.ok(read("CHANGELOG.md").includes(`当前 \`${version}\``), "Changelog version drift");
assert.ok(existsSync(path.join(root, `docs/releases/${version}.md`)), "Missing release notes");
console.log(`PASS version source consistency: ${version}`);
