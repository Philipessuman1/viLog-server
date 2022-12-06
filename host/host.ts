// Email and SMS functionality
import nodemailer from 'nodemailer';
const pool = require('../db').pool;
import 'dotenv/config';
require('dotenv').config({ path: 'server/.env'});
import axios from 'axios';

const getReceiverDetails = (id: number) => {
    return pool.query(`
        SELECT hosts.host_name AS host_name, hosts.email AS host_email, hosts.phone AS host_phone, visitors.visitor_name AS visitor_name, visitors.email AS visitor_email, visitors.phone AS visitor_phone 
        FROM hosts
        JOIN visitors
        ON hosts.id = visitors.host_id
        WHERE visitors.id = $1
        `, [id])
            .then((data: { rows: any[]; }) => {
                return data.rows[0]
            })
            .catch((err: { status: any; message: any; }) => {
                throw {status: err?.status || 500, message: err.message }
            })
}

// Email setup starts here
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

let mailOptions = {
    from: "Vilog",
    to: "",
    subject: "Meeting Details",
    text: "",
    attachments: [{filename:"qr_code.png", path: '../qr_code.png'}]
}

const visitorNotificationMessage = (visitor_name: string) => {
    return  `
    Dear ${visitor_name},

    Your meeting has been scheduled and your host has been notified.

    Your host will be expecting you.

    Kindly use the QR code on your next visit to sign in faster.

    Regards,
` };

const hostNotificationMessage = (host_name: string, visitor_name: string) => {
    return `
    Dear ${host_name},

    Your visitor ${visitor_name} has arrived and waiting for you.

    Best regards,
    Vilog Team
`
} 

const sendMail = () => {
    transporter.sendMail(mailOptions, function(err, _success) {
        if (err) {
            console.error(err)
        } else {
            console.log("Email sent successfully")
        //     fs.unlink('qr.png', (err) => {
        //         if (err) {
        //             console.error(err)
        //             return
        //         }
        //     })
        }
    })
};

//SMS setup
const sms_data = {
    'recipient': '',
    'sender': 'Vilog',
    'message': 'API is fun!',
    'is_schedule': 'false',
    'schedule_date': ''
}

const config = {
    method: 'post',
    url: process.env.SMS_URL,
    headers : {
    'Accept': 'application/json'
    },
    data : sms_data
};
    
const sendSMS = () => {
    axios(config)  
    .then(function (response)  {
    console.log(JSON.stringify(response.data));  
    })  
    .catch(function (error)  {
    console.log(error);  
    }) 
}

export const sendNotifications =  async (id: number) => {
        const receiverDetails = await getReceiverDetails(id);
        console.log(receiverDetails);
//send notification to visitors
        mailOptions.to = receiverDetails.visitor_email;
        mailOptions.attachments;
        mailOptions.text = visitorNotificationMessage(receiverDetails.visitor_name);
        sendMail();
    
        sms_data.recipient= `${receiverDetails.visitor_phone}`;
        sms_data.message = `Your meeting has been set and your host has been notified.`;
        sendSMS()
//send notification to hosts        
        mailOptions.to = receiverDetails.host_email;
        mailOptions.text = hostNotificationMessage(receiverDetails.host_name, receiverDetails.visitor_name);
        sendMail();
    
        sms_data.recipient = `${receiverDetails.host_phone}`;
        sms_data.message = `Your visitor has arrived and is waiting for you.`;
        sendSMS()
};

