const app = require('./app');
require('dotenv').config({ path: './.env' });

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}.`);
});