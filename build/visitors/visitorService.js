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
exports.signOutVisitor = exports.addVisitorToDB = void 0;
const pool = require('../db').pool;
const qrcode_1 = __importDefault(require("qrcode"));
//move email functionality to host module and imported into the visitor service module
// the addVisitor will also query the database for complete visit details and return an object
// with all the necessary information which will be passed into the email and
// sms functionality
// loginVisitor[addVisitorToDB, sendNotifications[sendMail, sendSMS]]
// logoutVisitor
const generateQR = (body) => {
    let stringJson = JSON.stringify(body);
    qrcode_1.default.toFile('qr_code.png', stringJson, (err) => {
        if (err)
            return console.log(err);
        console.log('An error occured');
    });
};
const addVisitorToDB = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pool.query(`INSERT INTO visitors (visitor_name, phone, email, company,host_name, host_id)
        VALUES ($1, $2, $3, $4, $5)`, [body.visitor_name, body.phone, body.email, body.company, body.host_name, body.host_id]);
        generateQR(body);
        yield pool.query(`SELECT * FROM visitors ORDER BY id DESC LIMIT 1`)
            .then((data) => {
            return data.rows[0].id;
        });
    }
    catch (err) {
        console.error(err);
    }
});
exports.addVisitorToDB = addVisitorToDB;
const signOutVisitor = (id) => {
    return pool.query(`
        UPDATE visitors
        SET sign_out = CLOCK_TIMESTAMP()::TIME(0)
        WHERE id = $1
    `, [id])
        .then((res) => console.log("Sign out successful"))
        .catch((err) => {
        throw { status: (err === null || err === void 0 ? void 0 : err.status) || 500, message: err.message };
    });
};
exports.signOutVisitor = signOutVisitor;
