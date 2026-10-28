import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  applyIdentityHierarchy,
  hierarchyChecksum,
} from "../server/database/identityHierarchy";
fs.mkdirSync(".local-data", { recursive: true });
process.env.SAKURA_DATA_DIR = fs.mkdtempSync(
  path.resolve(".local-data", "hierarchy-test-"),
);
const { sqliteDb: db } = await import("../server/sqliteDb");
const results: { name: string; status: string }[] = [];
function check(name: string, action: () => void) {
  action();
  results.push({ name, status: "PASS" });
  console.log("PASS " + name);
}
const institution = (id: string) =>
  db.prepare("INSERT INTO institutions VALUES (?,?,?)").run(id, id, id);
const unit = (id: string, org: string, parent: string | null, kind: string) =>
  db
    .prepare(
      "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,?,?,?,?)",
    )
    .run(id, org, parent, kind, id, id);
const identity = (id: string, org: string, kind: string, no: string) =>
  db
    .prepare(
      "INSERT INTO identity_registry(id,institution_id,identity_kind,external_id) VALUES (?,?,?,?)",
    )
    .run(id, org, kind, no);
const position = (
  id: string,
  org: string,
  u: string,
  role: string,
  level: number,
) =>
  db
    .prepare(
      "INSERT INTO organization_positions(id,institution_id,unit_id,role_code,code,hierarchy_level) VALUES (?,?,?,?,?,?)",
    )
    .run(id, org, u, role, id, level);
const appointment = (id: string, org: string, i: string, p: string) =>
  db
    .prepare(
      "INSERT INTO identity_appointments(id,institution_id,identity_id,position_id,starts_on) VALUES (?,?,?,?,'2026-10-28')",
    )
    .run(id, org, i, p);
const line = (id: string, sub: string, sup: string, org = "A") =>
  db
    .prepare(
      "INSERT INTO identity_reporting_lines(id,institution_id,subordinate_id,supervisor_id) VALUES (?,?,?,?)",
    )
    .run(id, org, sub, sup);
try {
  check(
    "upgrade adds nine metadata tables without changing legacy accounts",
    () => {
      assert.equal(
        (
          db.prepare("SELECT COUNT(*) n FROM schema_migrations").get() as {
            n: number;
          }
        ).n,
        13,
      );
      assert.ok(
        db.prepare("SELECT id FROM faculty_users WHERE id='fac-admin'").get(),
      );
      assert.equal(
        (
          db.prepare("SELECT COUNT(*) n FROM identity_registry").get() as {
            n: number;
          }
        ).n,
        0,
      );
    },
  );
  check("organization roots and vertical units can be created", () => {
    institution("A");
    institution("B");
    unit("rootA", "A", null, "school");
    unit("rootB", "B", null, "school");
    unit("division", "A", "rootA", "division");
    unit("department", "A", "division", "department");
    unit("grade", "A", "rootA", "grade");
    unit("class", "A", "grade", "class");
    unit("group", "A", "class", "group");
  });
  check("cross-institution parent and duplicate roots are rejected", () => {
    assert.throws(() => unit("bad", "B", "rootA", "department"));
    assert.throws(() => unit("rootA2", "A", null, "school"));
  });
  check("invalid vertical type and self-parent are rejected", () => {
    assert.throws(() => unit("badclass", "A", "department", "class"));
    assert.throws(() => unit("self", "A", "self", "division"));
  });
  check(
    "reparent and changes invalidating existing child kinds are rejected",
    () => {
      assert.throws(() =>
        db
          .prepare(
            "UPDATE organization_units SET parent_id='department' WHERE id='division'",
          )
          .run(),
      );
      assert.throws(() =>
        db
          .prepare(
            "UPDATE organization_units SET kind='department' WHERE id='grade'",
          )
          .run(),
      );
    },
  );
  check(
    "composite staff/student identifiers distinguish institution and identity type",
    () => {
      identity("director", "A", "staff", "001");
      identity("teacher", "A", "staff", "002");
      identity("mentor", "A", "staff", "003");
      identity("student", "A", "student", "001");
      identity("guardian", "A", "guardian", "001");
      identity("other", "B", "staff", "001");
      assert.throws(() => identity("duplicate", "A", "staff", "001"));
      identity("letters", "A", "staff", "ABC");
      assert.throws(() => identity("lettersdup", "A", "staff", "abc"));
    },
  );
  check(
    "external number and institution cannot be changed after creation",
    () => {
      assert.throws(() =>
        db
          .prepare(
            "UPDATE identity_registry SET external_id='999' WHERE id='teacher'",
          )
          .run(),
      );
      assert.throws(() =>
        db
          .prepare(
            "UPDATE identity_registry SET institution_id='B' WHERE id='teacher'",
          )
          .run(),
      );
    },
  );
  check(
    "positions and appointments accept staff identities and reject role mismatch",
    () => {
      position("dirP", "A", "rootA", "director", 10);
      position("mentorP", "A", "division", "mentor", 20);
      position("teachP", "A", "department", "teacher", 30);
      appointment("dirA", "A", "director", "dirP");
      appointment("mentorA", "A", "mentor", "mentorP");
      appointment("teachA", "A", "teacher", "teachP");
      assert.throws(() => appointment("badstudent", "A", "student", "teachP"));
      assert.throws(() => appointment("foreign", "A", "other", "teachP"));
      assert.throws(() => appointment("duprole", "A", "teacher", "teachP"));
    },
  );
  check("direct reporting chain accepts ancestor positions", () => {
    line("teacher-mentor", "teachA", "mentorA");
    line("mentor-director", "mentorA", "dirA");
  });
  check(
    "reverse rank, cycles, self-reporting and extra direct supervisor are rejected",
    () => {
      assert.throws(() => line("cycle", "dirA", "teachA"));
      assert.throws(() => line("self", "dirA", "dirA"));
      assert.throws(() => line("second", "teachA", "dirA"));
      assert.throws(() =>
        db
          .prepare(
            "UPDATE identity_reporting_lines SET supervisor_id='teachA' WHERE id='mentor-director'",
          )
          .run(),
      );
    },
  );
  check(
    "unrelated department cannot become an administrative supervisor",
    () => {
      unit("otherDept", "A", "division", "department");
      identity("otherDir", "A", "staff", "004");
      position("otherDirP", "A", "otherDept", "director", 5);
      appointment("otherDirA", "A", "otherDir", "otherDirP");
      assert.throws(() => line("sideways", "dirA", "otherDirA"));
    },
  );
  check("cross-institution object ownership is rejected", () => {
    assert.throws(() =>
      db
        .prepare(
          "INSERT INTO identity_objects VALUES ('bad','A','other','student','student-x')",
        )
        .run(),
    );
    db.prepare(
      "INSERT INTO identity_objects VALUES ('record','A','student','student','student-001')",
    ).run();
  });
  check("bindings use identity/object/relation/period composite key", () => {
    db.prepare(
      "INSERT INTO identity_object_bindings(id,institution_id,identity_id,object_id,relation,period_key,created_by) VALUES ('link','A','guardian','record','guardian_of','2026','student')",
    ).run();
    assert.throws(() =>
      db
        .prepare(
          "INSERT INTO identity_object_bindings(id,institution_id,identity_id,object_id,relation,period_key,created_by) VALUES ('dup','A','guardian','record','guardian_of','2026','student')",
        )
        .run(),
    );
  });
  check(
    "foreign identities and invalid guardian/student roles cannot bind",
    () => {
      assert.throws(() =>
        db
          .prepare(
            "INSERT INTO identity_object_bindings(id,institution_id,identity_id,object_id,relation,created_by) VALUES ('bad','A','other','record','member','student')",
          )
          .run(),
      );
      assert.throws(() =>
        db
          .prepare(
            "INSERT INTO identity_object_bindings(id,institution_id,identity_id,object_id,relation,created_by) VALUES ('badrole','A','teacher','record','guardian_of','student')",
          )
          .run(),
      );
    },
  );
  check(
    "confirmed binding requires digest and the recipient confirmation",
    () => {
      assert.throws(() =>
        db
          .prepare(
            "UPDATE identity_object_bindings SET status='confirmed',confirmed_by='guardian' WHERE id='link'",
          )
          .run(),
      );
      assert.throws(() =>
        db
          .prepare(
            "UPDATE identity_object_bindings SET status='confirmed',confirmed_by='teacher',proof_key_hash=? WHERE id='link'",
          )
          .run("a".repeat(64)),
      );
      db.prepare(
        "UPDATE identity_object_bindings SET status='confirmed',confirmed_by='guardian',proof_key_hash=? WHERE id='link'",
      ).run("a".repeat(64));
    },
  );
  check(
    "repeated migration is idempotent and corrupt checksums are rejected",
    () => {
      applyIdentityHierarchy(db);
      assert.equal(
        (
          db
            .prepare(
              "SELECT COUNT(*) n FROM schema_migrations WHERE version=12",
            )
            .get() as { n: number }
        ).n,
        1,
      );
      db.prepare(
        "UPDATE schema_migrations SET checksum='bad' WHERE version=12",
      ).run();
      assert.throws(() => applyIdentityHierarchy(db), /checksum mismatch/);
      db.prepare(
        "UPDATE schema_migrations SET checksum=? WHERE version=12",
      ).run(hierarchyChecksum);
      assert.deepEqual(db.pragma("foreign_key_check"), []);
      assert.equal(db.pragma("integrity_check", { simple: true }), "ok");
    },
  );
  fs.mkdirSync("docs/verification/hierarchy", { recursive: true });
  fs.writeFileSync(
    "docs/verification/hierarchy/results.json",
    JSON.stringify(
      { testedAt: new Date().toISOString(), checks: results },
      null,
      2,
    ),
  );
} finally {
  db.close();
}
