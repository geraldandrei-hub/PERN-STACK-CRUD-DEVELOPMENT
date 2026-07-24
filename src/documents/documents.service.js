const {notFoundError} = require('../errors');

class DocumentService {
    constructor(repo) {
        this.repo = repo;
    }

    async list(ownerId) {
        return this.repo.findAllbyOwner(ownerId);
    }

    async getById(id, ownerId) {
        const document = await this.repo.findByIdForOwner(id, ownerId);
        if(!document) throw notFoundError('Document not found');
        return document;
    }

    async create(ownerId, data) {
        return this.repo.create({...data, ownerId});
    }

    async update(id, ownerId, fields) {
        const updated = await this.repo.update(id, ownerId, fields);
        if (!updated) throw new notFoundError('Document not found');
        return updated;
    }

    async remove(id, ownerId) {
        const deleted = await this.repo.deleteForOwner(id, ownerId);
        if(!deleted) throw new notFoundError('Document not found');
    }
}

module.exports = DocumentService;