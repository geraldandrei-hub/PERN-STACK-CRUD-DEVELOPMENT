/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createType("document_status", ["Draft", "In Review", "Approved", "Archived"]);

  pgm.createTable("documents", {
    id:          { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    owner_id:    { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    title:       { type: "text", notNull: true },
    description: { type: "text" },
    status:      { type: "document_status", notNull: true, default: "Draft" },
    author:      { type: "text", notNull: true },
    created_at:  { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at:  { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createIndex("documents", "owner_id");

  pgm.createTrigger("documents", "trg_documents_updated_at", {
    when: "BEFORE", operation: "UPDATE", level: "ROW", function: "set_updated_at",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("documents");         // index + trigger drop with it
  pgm.dropType("document_status");
};