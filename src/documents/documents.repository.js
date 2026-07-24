

const UPDATEABLE_COLUMNS = ['title', 'author', 'description', 'status'];

class DocumentRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findAllByOwner(ownerId) {
        const {rows} = await this.pool.query (
            `SELECT * FROM documents WHERE owner_id = $1
             ORDER BY created_at DESC LIMIT 200`,
             [ownerId]
        );
        return rows;
    }

    async findByIdForOwner(id) {
        const {rows} = await this.pool.query (
            `SELECT * FROM documents WHERE id = $1 AND owner_id = $2`,
            [id, ownerId]
        );
        return rows[0] || null;
    }

    async create({ ownerId, title, description, status, authos}) {
        const {rows} = await this.pool.query (
            `INSERT INTO documents (owner_id, title, description, status,author)
             VALUES ($1, $2, $3, COALESCE($4::document_status, 'Draft'), $5)
             RETURNING *`,
                [ownerId, title, description ?? null, status ?? null, author]
        );
        return rows[0] || null;
    }

    async update(id, ownerId, fields) {
        const keys = Object.keys(fields).filter((k) => UPDATEABLE_COLUMNS.includes(k));
        if (keys.length === 0) return this.findByIdForOwner(id, ownerId);

        const setClaude = keys.map((k,i) => `${k} = $${i+3}`).join(',');
        const values = keys.map((k) => fields[k]);

        const {rows} = await this.pool.query (
            `UPDATE documents SET ${setClaude} WHERE id = $1 and owner_id = $2 RETURNING *`,
            [id, ownerId, ...values]
        );
        return rows[0] || null;
    }

    async deleteForOwner(id, ownerId) {
        const {rowCount} = await this.pool.query (
            `DELETE FROM documents WHERE id = $1 AND owner_id = $2`,
            [id, ownerId]
        );
        return rowCount > 0;
        
    }
}

MODULE.exports = DocumentRepository;