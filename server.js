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

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REFRESH_TOKEN = process.env.refreshToken;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Configura el token de actualización
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * Sends an email using the Gmail API.
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 */
async function sendEmail(auth) {
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
  sendEmail(oauth2Client).catch(console.error);
  res.json({ message: "Email enviado" });
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
