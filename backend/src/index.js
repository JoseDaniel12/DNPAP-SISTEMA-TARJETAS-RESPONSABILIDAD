const app = require('./app');

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}.`);
});