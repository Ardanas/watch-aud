const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const API_KEY = process.env.API_KEY; // ixer.io API key
const CURRENCY_PAIR = process.env.CURRENCY_PAIR || 'AUDCNY'; // 'AUDCNY'; // AUD/CNY exchange rate
const EMAIL = process.env.EMAIL; // your email address
const PASSWORD = process.env.PASSWORD; // your email password
const TO_EMAIL = process.env.TO_EMAIL; // recipient email address
const THRESHOLD = process.env.THRESHOLD; // exchange rate threshold

async function getExchangeRate() {
    const url = `http://data.fixer.io/api/latest?access_key=${API_KEY}&symbols=${CURRENCY_PAIR}`;
    const response = await axios.get(url);
    const rate = response.data.rates[CURRENCY_PAIR];
    return rate;
}

async function sendEmail(rate) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD,
        },
    });

    const mailOptions = {
        from: EMAIL,
        to: TO_EMAIL,
        subject: 'AUD/CNY Exchange Rate Alert',
        text: `The exchange rate is ${rate.toFixed(2)}, which is lower than 4.6!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
}

cron.schedule('* * * * *', async () => {
    const rate = await getExchangeRate();
    console.log(`AUD/CNY exchange rate: ${rate.toFixed(2)}`);
    if (rate < THRESHOLD) {
        await sendEmail(rate);
    }
});