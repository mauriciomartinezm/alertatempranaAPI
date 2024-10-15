const twilio = require("twilio");

// Configurar Twilio con Account SID y Auth Token
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = new twilio(accountSid, authToken);

function sendMessage(to){
    client.messages
    .create({
            body: "Tercer sensor, nivel crítico.",
            from: "+15715260681", // Número de Twilio
            to: to, // Tu número o el del destinatario
          })
          .then((message) => console.log(`SMS enviado: ${message.sid}`))
          .catch((error) => console.error("Error al enviar SMS:", error));
}
module.exports = { sendMessage };
