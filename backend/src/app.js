require('dotenv').config();

// IMPORTS
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// VARIABLES
const corsOptions = { origin: true, optionSuccessStatus: 200 };

// APPLICATION
const app = express();

// MIDLEWARES
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


// ROUTES
app.get('/', async (_, res) => {
    return res.status(200).json({ msg: 'Backend de DNPAP.' });
});

app.use('/auth', require('./routes/auth.routes.js'));
app.use('/modelos', require('./routes/modeloBienes.routes.js'));
app.use('/bienes', require('./routes/bienes.routes.js'));
app.use('/empleados', require('./routes/empleados.routes.js'));
app.use('/tarjetas', require('./routes/tarjetas.routes.js'));
app.use('/unidadesServicio', require('./routes/unidadesServicio.routes.js'));
app.use('/reportes', require('./routes/reportes.routes.js'));

module.exports = app;