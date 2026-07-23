-- Up Migration

CREATE TYPE document_status AS ENUM ('Draft', 'In Review', 'Approved', 'Archived');

CREATE TABLE documents (
  id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT            NOT NULL,
  description TEXT,
  status      document_status NOT NULL DEFAULT 'Draft',
  author      TEXT            NOT NULL,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- Index the FK so "list my documents" stays fast.
CREATE INDEX idx_documents_owner_id ON documents(owner_id);

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration

DROP TABLE documents;
DROP TYPE document_status;
