const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { enviarCorreo } = require("./emailSender");
//const { sendMessage } = require("./smsSender");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Declarar las variables correctamente
let sensorValues = "0";
let commands = "";

// Ruta para recibir los datos (POST)
app.post("/recibir_datos", async (req, res) => {
  console.log("Cuerpo: ", req.body);
  sensorValues = req.body.sensor_values; // Acceder a sensor_values
  commands = req.body.commands; // Acceder a commands

  console.log("Valores de los sensores:", sensorValues);
  console.log("Comandos:", commands);
  res.json({ message: "Datos recibidos correctamente" });

  // Enviar mensaje si se detecta un comando específico
  //if (commands[2] === "Encender tercero") {
    // Envía un SMS de alerta
    //sendMessage("+573205056994");
    // Envía un correo de alerta
    //try {
    //  console.log("Subprograma");
    //  const resultado = await enviarCorreo(
    //    "mauriciomartinez0416@gmail.com",
    //    "Nivel del agua crítico",
    //    "hola"
    //  );
    //  console.log(resultado);
//
    //  res.json({ message: resultado });
    //} catch (error) {
    //  res.status(500).json({ message: `Error enviando el correo: ${error}` });
    //}
 // }
});

// Nueva ruta para servir los datos almacenados (GET)
app.get("/recibir_datos", (req, res) => {
  console.log("Solicitud recibida");
  res.json({ sensores: sensorValues, comandos: commands }); // Enviar los datos almacenados como JSON
});

//test
app.get("/enviar_correo", async (req, res) => {
  //try {
    const resultado = await enviarCorreo(
      "mauriciomartinez0416@gmail.com",
      "Nivel del agua crítico",
      "<h1>Nivel del agua crítico</h1><h2>alertatemprana.space</h2>"
    );
    res.json({ message: resultado });
  //} catch (error) {
   // res.status(500).json({ message: `Error enviando el correo: ${resultado}` });
  //}
});

const server = app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
