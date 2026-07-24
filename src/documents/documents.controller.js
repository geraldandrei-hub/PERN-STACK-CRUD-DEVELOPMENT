class DocumentController {
    constructor(service) {
        this.service = service;
        this.list = this.list.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    async list(req,res,next) {
        try {
            const documents = await this.service.list(req.user.id);
            res.status(200).json({documents});
        } catch (err) {
            next(err)
        }
    }

    async getById(req,res,next) {
        try {
            const document = await this.service.getById(req.params.id, req.user.id);
            res.status(200).json({document});
        } catch (err) {
            next(err)
        }
    }

    async create(req,res,next) {
        try {
            const document = await this.service.create(req.user.id, req.body);
            res.status(201).json({document});
        } catch(err) {
            next(err);
        }
    }

    async remove(req, res, next) {
        try {
            await this.service.remove(req.params.id, req.user.id);
            res.status(204).end();
        } catch (err) {
            next(err)
        }
    } 


}

module.exports = DocumentController;