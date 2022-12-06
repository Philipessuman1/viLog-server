const pool = require('../db').pool;
import qr from 'qrcode';

//move email functionality to host module and imported into the visitor service module
// the addVisitor will also query the database for complete visit details and return an object
// with all the necessary information which will be passed into the email and
// sms functionality

// loginVisitor[addVisitorToDB, sendNotifications[sendMail, sendSMS]]
// logoutVisitor

const generateQR = (body: any) => {
   let stringJson = JSON.stringify(body);
   qr.toFile('qr_code.png', stringJson, (err): any => {
           if (err)
               return console.log(err);
           console.log('An error occured');
       })
}

export const addVisitorToDB = async (body:{ id:number; visitor_name: string; phone: any; email: string; company: string; host_name: string; host_id: number; }) => {
    try{
        await pool.query(
        `INSERT INTO visitors (visitor_name, phone, email, company,host_name, host_id)
        VALUES ($1, $2, $3, $4, $5)`, 
        [body.visitor_name, body.phone, body.email, body.company, body.host_name, body.host_id]
    )
        generateQR(body)
        
        await pool.query(`SELECT * FROM visitors ORDER BY id DESC LIMIT 1`)
        
    .then((data: { rows: { id: number; }[]; }) => {
        return data.rows[0].id
    })
   } catch(err) {
        console.error(err);
    }
}

export const signOutVisitor = (id:number) => {
    return pool.query(`
        UPDATE visitors
        SET sign_out = CLOCK_TIMESTAMP()::TIME(0)
        WHERE id = $1
    `, [id])
        .then((res: any) => console.log("Sign out successful"))
        .catch((err: { status: any; message: any; }) => {
            throw {status: err?.status || 500, message: err.message}
        })
};