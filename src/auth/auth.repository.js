//SQL only. Receives the pg pool via the constructor,
// so it can be tested agains a fake pool with no real databases.

class AuthRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findByEmail(email) {
        const {rows} = await this.pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return rows[0] || null;
    }

    async findById(id) {
        const {rows} = await this.pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return rows[0] || null;
    }

    async create({email, passwordHash}) {
        const {rows} = await this.pool.query(
            `INSERT INTO users (email,password_hash)
             VALUES ($1,$2)
             RETURNING id, email, created_at`
             [email, passwordHash]
        );
        return rows[0] || null;
    }
}

module.exports = AuthRepository;