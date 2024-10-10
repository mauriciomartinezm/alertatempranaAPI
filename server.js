const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let receivedData = ""; // Variable para almacenar los datos recibidos

// Ruta para recibir los datos (POST)
app.post('/recibir_datos', (req, res) => {
    receivedData = req.body; // Guardar los datos recibidos
    console.log('Datos recibidos:', receivedData);
    res.json({ message: 'Datos recibidos correctamente' });
});

// Nueva ruta para servir los datos almacenados (GET)
app.get('/recibir_datos', (req, res) => {
    res.json({ data: receivedData }); // Enviar los datos almacenados como JSON
});

// Ruta para servir la página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', './index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
