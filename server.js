const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { google } = require("googleapis");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Scopes: Modify these if you need different permissions.
const SCOPES = process.env.scopes; // Cambié a 'send' para poder enviar correos
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS = JSON.parse(process.env.credentials); // Parsear la variable de entorno
const REFRESH_TOKEN = process.env.refresh_token 
console.log(REFRESH_TOKEN);
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const key = CREDENTIALS.web || CREDENTIALS.installed;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: REFRESH_TOKEN,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  // Crear un cliente usando las credenciales en la variable de entorno
  const { client_id, client_secret, redirect_uris } = CREDENTIALS.web; // Ajusta según el formato de tus credenciales
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Aquí necesitas una forma de obtener un token. Si tienes un refresh_token guardado, úsalo.
  if (REFRESH_TOKEN) {
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    return oAuth2Client;
  }

  throw new Error('No refresh_token found.'); // Manejo de error si no hay refresh_token.
}

async function sendEmail(auth) {
  const gmail = google.gmail({ version: "v1", auth });

  const email = [
    "From: Mauricio <mauromm1603@gmail.com>",
    "To: mauriciomartinez0416@gmail.com",
    "Subject: Test email from Node.js",
    "",
    "This is a test email sent from Node.js using Gmail API!",
  ].join("\n");

  const base64EncodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64EncodedEmail,
      },
    });
    console.log("Email sent:", res.data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

let sensorValues = "";
let commands = "";

app.post("/recibir_datos", (req, res) => {
  sensorValues = req.body.sensor_values; // Acceder a sensor_values
  commands = req.body.commands; // Acceder a commands

  console.log("Valores de los sensores:", sensorValues);
  console.log("Comandos:", commands);
  res.json({ message: "Datos recibidos correctamente" });

  // Enviar mensaje si se detecta un comando específico
  if (commands[2] === "Encender tercero") {
    // Aquí va el código para enviar SMS
  }
});

// Nueva ruta para servir los datos almacenados (GET)
app.get("/recibir_datos", async (req, res) => {
  try {
    const auth = await authorize();
    await sendEmail(auth); // Pasar el auth a sendEmail
    res.json({ sensores: sensorValues, comandos: commands }); // Enviar los datos almacenados como JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al enviar el correo.");
  }
});

app.get("/oauth2callback", async (req, res) => {
  try {
    const auth = await authorize();
    await sendEmail(auth); // Pasar el auth a sendEmail
    res.json({ sensores: sensorValues, comandos: commands }); // Enviar los datos almacenados como JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al enviar el correo.");
  }
});

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
      console.log(`El puerto ${port} está en uso.`);
  }
});
