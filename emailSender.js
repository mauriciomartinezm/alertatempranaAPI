const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Configurar OAuth 2.0
const OAuth2 = google.auth.OAuth2;
const USER = process.env.user;
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REFRESH_TOKEN = process.env.refresh_token;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, "https://developers.google.com/oauthplayground");

  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
};

const enviarCorreo = async (to, subject, htmlContent) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `Alerta temprana <${USER}>`, // Remitente
      to: to,                  // Destinatario
      subject: subject,        // Asunto del correo
      html: htmlContent,       // Contenido en HTML
    };

    const info = await transporter.sendMail(mailOptions);
    return(`Correo enviado: ${info.response}`);
  } catch (error) {
    return(`Error enviando el correo: ${error}`);
  }
};

module.exports = { enviarCorreo };
