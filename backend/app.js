// IMPORTS
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

// VARIABLES
const corsOptions = { origin: true, optionSuccessStatus: 200 };

// APPLICATION
const app = express();

// MIDLEWARES
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/temp/'
}));

// ROUTES
app.get('/', async (_, res) => {
    return res.status(200).json({ msg: 'Proyecto Final de IPC2.' });
});

app.use('/auth', require('./routes/auth.routes.js'));
app.use('/programas', require('./routes/programas.routes.js'));
app.use('/empleados', require('./routes/empleados.routes.js'));
app.use('/bienes', require('./routes/bienes.routes.js'));
app.use('/tarjetas', require('./routes/tarjetas.routes.js'));

module.exports = app;