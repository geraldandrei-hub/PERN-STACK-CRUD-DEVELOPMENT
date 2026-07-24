const {Router} = require('express');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/validate');

const {
    createDocumentSchema,
    updateDocumentSchema,
    idParamSchema
} = require ('./documents.schema');

function buildDocumentRouter(controller) {
    const router = Router();

    router.use(authenticate);

    router.get('/', controller.list);
    router.post('/',validate(createDocumentSchema), controller.create)

    router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
    router.put(
        '/:id',
        validate(idParamSchema, 'params'),
        validate(updateDocumentSchema),
        controller.update
    );

    router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

    return router;
}

module.exports = buildDocumentsRouter;