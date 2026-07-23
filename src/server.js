require('dotenv').config();

const buildApp = require('./app')

const app = buildApp();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on https://localhost:${PORT}`);
});