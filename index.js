const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const API_KEY = process.env.API_KEY || 'xxx'; // ixer.io API key
const EMAIL = process.env.EMAIL || 'xxx'; // your email address
const PASSWORD = process.env.PASSWORD || 'xxx'; // your email password
const TO_EMAIL = process.env.TO_EMAIL || 'xxx'; // recipient email address
const THRESHOLD = process.env.THRESHOLD || 4.56; // exchange rate threshold


async function getExchangeRate() {
    const url = `https://api.apilayer.com/exchangerates_data/latest?symbols=CNY&base=AUD&access_key${API_KEY}`;
    const response = await axios.get(url, {
        headers: {
            'apikey': API_KEY,
        }
    });
    const rate = response.data.rates.CNY
    return rate;
}

async function sendEmail(rate) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: {
            user: EMAIL,
            pass: PASSWORD,
        },
    });

    const mailOptions = {
        from: EMAIL,
        to: TO_EMAIL,
        subject: 'AUD/CNY Exchange Rate Alert',
        text: `The exchange rate is ${rate.toFixed(2)}, which is lower than ${THRESHOLD}!`,
    };
    transporter.sendMail(mailOptions, (error, info) => {

        console.log(`Email sent: ${info.messageId}`);

    });
}

cron.schedule('* * * * *', async () => {
    const rate = await getExchangeRate();
    console.log(`AUD/CNY exchange rate: ${rate.toFixed(2)}`);
    console.log(typeof rate);
    if (Number(rate) < THRESHOLD) {
        console.log('email');
        await sendEmail(rate);
    }
});

// (async () => {
//     const rate = await getExchangeRate();
//     console.log(`AUD/CNY exchange rate: ${rate.toFixed(2)}`);
//     if (Number(rate) < THRESHOLD) {
//         await sendEmail(rate);
//     }
// })()