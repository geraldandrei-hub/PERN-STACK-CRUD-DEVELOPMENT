/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  // Shared trigger function (used by users AND documents).
  pgm.createFunction(
    "set_updated_at",
    [],
    { returns: "trigger", language: "plpgsql", replace: true },
    `BEGIN
       NEW.updated_at = now();
       RETURN NEW;
     END;`
  );

  pgm.createTable("users", {
    id:            { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    email:         { type: "text", notNull: true, unique: true },
    password_hash: { type: "text", notNull: true },
    created_at:    { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at:    { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createTrigger("users", "trg_users_updated_at", {
    when: "BEFORE", operation: "UPDATE", level: "ROW", function: "set_updated_at",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("users");             // its trigger drops with it
  pgm.dropFunction("set_updated_at", []);
};