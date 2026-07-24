const {z} = require('zod');

const STATUSES = ['draft', 'In Review', 'Approved', 'Archived'];

const createDocumentSchema = z.object ({
    title: z.string().trim().min(1, 'title is required'),
    author: z.string().trim().min(1, 'author is required'),
    description: z.string().trim().optional(),
    status: z.enum(STATUSES).optional(),
});

const updateDocumentSchema = createDocumentSchema
    .partial()
    .refine((data) => Object.keys(data).length> 0, {
        message: 'At least one field must be provided for update',
    });

const idParamSchema = z.object({
    id: z.string().uuid('Invalid document ID')
});

module.exports = {
    createDocumentSchema,
    updateDocumentSchema,
    idParamSchema,
    STATUSES
}