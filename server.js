const express = require("express");
const bodyParser = require("body-parser");

//const cors = require("cors");

//const twilio = require("twilio");
const nodemailer = require("nodemailer");

const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const app = express();
const port = 3000;

//app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar OAuth 2.0

// Scopes: Modify these if you need different permissions.
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"]; // Cambié a 'send' para poder enviar correos
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request authorization to call APIs.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Sends an email using the Gmail API.
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 */
async function sendEmail() {
  const gmail = google.gmail({ version: "v1", auth });

  // Create email body (adjust "to" and "from" as needed)
  const email = [
    "From: Mauricio <mauromm1603@gmail.com>",
    "To: mauriciomartinez0416@gmail.com",
    "Subject: Test email from Node.js",
    "",
    "This is a test email sent from Node.js using Gmail API!",
  ].join("\n");

  // Encode email
  const base64EncodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    // Send email using Gmail API
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
// Configurar Twilio con Account SID y Auth Token
//const accountSid = "AC60d6a776ef035b1cfed967a400bde0d8";
//const authToken = "08ddfb9a61986bd1c56e28f5e239776f";
//const client = new twilio(accountSid, authToken);

// Declarar las variables correctamente
let sensorValues = "";
let commands = "";

// Ruta para recibir los datos (POST)
app.post("/recibir_datos", (req, res) => {
  sensorValues = req.body.sensor_values; // Acceder a sensor_values
  commands = req.body.commands; // Acceder a commands

  console.log("Valores de los sensores:", sensorValues);
  console.log("Comandos:", commands);
  res.json({ message: "Datos recibidos correctamente" });

  // Enviar mensaje si se detecta un comando específico
  if (commands[2] === "Encender tercero") {
    // Envía un SMS de alerta
    client.messages
      .create({
        body: "¡Alerta! El tercer sensor detecta un nivel crítico.",
        from: "+15715260681", // Número de Twilio
        to: "+573205056994", // Tu número o el del destinatario
      })
      .then((message) => console.log(`SMS enviado: ${message.sid}`))
      .catch((error) => console.error("Error al enviar SMS:", error));
  }
});

// Nueva ruta para servir los datos almacenados (GET)
app.get("/recibir_datos", (req, res) => {
  authorize().then(sendEmail).catch(console.error);
  res.json({ sensores: sensorValues, comandos: commands }); // Enviar los datos almacenados como JSON
});

app.get("/oauth2callback", (req, res) => {
  authorize().then(sendEmail).catch(console.error);
  res.json({ sensores: sensorValues, comandos: commands }); // Enviar los datos almacenados como JSON
});

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
      console.log(`El puerto ${port} está en uso.`);
      // Opcionalmente reiniciar el servidor con otro puerto
  }
});

