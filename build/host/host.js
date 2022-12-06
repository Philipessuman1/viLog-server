"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotifications = void 0;
// Email and SMS functionality
const nodemailer_1 = __importDefault(require("nodemailer"));
const pool = require('../db').pool;
require("dotenv/config");
require('dotenv').config({ path: 'server/.env' });
const axios_1 = __importDefault(require("axios"));
const getReceiverDetails = (id) => {
    return pool.query(`
        SELECT hosts.host_name AS host_name, hosts.email AS host_email, hosts.phone AS host_phone, visitors.visitor_name AS visitor_name, visitors.email AS visitor_email, visitors.phone AS visitor_phone 
        FROM hosts
        JOIN visitors
        ON hosts.id = visitors.host_id
        WHERE visitors.id = $1
        `, [id])
        .then((data) => {
        return data.rows[0];
    })
        .catch((err) => {
        throw { status: (err === null || err === void 0 ? void 0 : err.status) || 500, message: err.message };
    });
};
// Email setup starts here
let transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
let mailOptions = {
    from: "Vilog",
    to: "",
    subject: "Meeting Details",
    text: "",
    attachments: [{ filename: "qr_code.png", path: '../qr_code.png' }]
};
const visitorNotificationMessage = (visitor_name) => {
    return `
    Dear ${visitor_name},

    Your meeting has been scheduled and your host has been notified.

    Your host will be expecting you.

    Kindly use the QR code on your next visit to sign in faster.

    Regards,
`;
};
const hostNotificationMessage = (host_name, visitor_name) => {
    return `
    Dear ${host_name},

    Your visitor ${visitor_name} has arrived and waiting for you.

    Best regards,
    Vilog Team
`;
};
const sendMail = () => {
    transporter.sendMail(mailOptions, function (err, _success) {
        if (err) {
            console.error(err);
        }
        else {
            console.log("Email sent successfully");
            //     fs.unlink('qr.png', (err) => {
            //         if (err) {
            //             console.error(err)
            //             return
            //         }
            //     })
        }
    });
};
//SMS setup
const sms_data = {
    'recipient': '',
    'sender': 'Vilog',
    'message': 'API is fun!',
    'is_schedule': 'false',
    'schedule_date': ''
};
const config = {
    method: 'post',
    url: process.env.SMS_URL,
    headers: {
        'Accept': 'application/json'
    },
    data: sms_data
};
const sendSMS = () => {
    (0, axios_1.default)(config)
        .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
        .catch(function (error) {
        console.log(error);
    });
};
const sendNotifications = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverDetails = yield getReceiverDetails(id);
    console.log(receiverDetails);
    //send notification to visitors
    mailOptions.to = receiverDetails.visitor_email;
    mailOptions.attachments;
    mailOptions.text = visitorNotificationMessage(receiverDetails.visitor_name);
    sendMail();
    sms_data.recipient = `${receiverDetails.visitor_phone}`;
    sms_data.message = `Your meeting has been set and your host has been notified.`;
    sendSMS();
    //send notification to hosts        
    mailOptions.to = receiverDetails.host_email;
    mailOptions.text = hostNotificationMessage(receiverDetails.host_name, receiverDetails.visitor_name);
    sendMail();
    sms_data.recipient = `${receiverDetails.host_phone}`;
    sms_data.message = `Your visitor has arrived and is waiting for you.`;
    sendSMS();
});
exports.sendNotifications = sendNotifications;
