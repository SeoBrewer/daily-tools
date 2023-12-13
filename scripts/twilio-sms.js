// Name: Twilio SMS/WhatsApp with AI translation
// Description: Send sms or whatsapp using twilio and openAI for translation
// Author: Army Nougues
// Twitter: @armyangray


import "@johnlindquist/kit"

let twilio = await npm('twilio');
let OpenAI = await npm('openai');

const twilioAccountSid = await env('TWILIO_ACCOUNT_SID');
const twilioAuthToken = await env('TWILIO_AUTH_TOKEN');
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

const openaiApiKey = await env('OPENAI_API_KEY');
const openai = new OpenAI({apiKey: openaiApiKey});

const messageType = await arg("Choose the message type:", ["WhatsApp", "SMS"]);
const to = await arg("Enter the recipient's phone number:");

const languageOptions = {
    "English": "en",
    "Norwegian": "no",
    "Chinese": "zh",
    "Japanese": "ja",
    "Russian": "ru"
};

const chosenLanguage = await arg("Choose the language to translate to:", Object.keys(languageOptions));
const textToTranslate = await arg("Enter the text to translate (Spanish):");

const completion = await openai.chat.completions.create({
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Translate this Spanish text to ${languageOptions[chosenLanguage]}: ${textToTranslate}` }
    ],
    model: "gpt-3.5-turbo",
});

const translation = completion.choices[0].message.content;

let fromNumber;
if (messageType === "WhatsApp") {
    fromNumber = `whatsapp:${await env('TWILIO_WHATSAPP_NUMBER')}`;
} else {
    fromNumber = await env('TWILIO_SMS_NUMBER');
}


twilioClient.messages
  .create({
     body: translation,
     from: fromNumber,
     to: messageType === "WhatsApp" ? `whatsapp:${to}` : to
  })
  .then(message => console.log(`Message sent successfully. SID: ${message.sid}`))
  .catch(error => console.error(`Failed to send message: ${error.message}`));
