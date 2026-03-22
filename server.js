const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware Configuration
app.use(cors()); // Allow API calls from different frontend domains (avoid CORS errors)
app.use(express.json());

// ================= YOUR GMAIL CONFIGURATION =================
const SMTP_EMAIL = 'YOUR_GMAIL_ADDRESS@gmail.com'; // Email used for sending
const SMTP_PASSWORD = 'YOUR_GMAIL_APP_PASSWORD';   // App Password
const RECEIVER_EMAIL = 'truongquocvi@gmail.com';   // Email to receive notifications
// ==========================================================

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD
    }
});

app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    const mailOptions = {
        from: SMTP_EMAIL,
        to: RECEIVER_EMAIL,
        subject: `[Portfolio Contact] New message from ${name}`,
        text: `You have a new contact from your Portfolio Website:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        replyTo: email // So you can click reply and answer directly to the sender's email
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Server error when sending email' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});