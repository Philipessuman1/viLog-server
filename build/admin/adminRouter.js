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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const pool = require('../db').pool;
const bcrypt_1 = __importDefault(require("bcrypt"));
require('dotenv').config({ path: '../../.env' });
const adminService_1 = require("./adminService");
const path_1 = __importDefault(require("path"));
const jwtGenerator_1 = require("../utils/jwtGenerator");
const validInfo = require('../utils/validInfo');
const authorizationMiddleware_1 = require("../utils/authorizationMiddleware");
router.post("/newAdmin", validInfo, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const admin = yield pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (admin.rows.length > 0) {
            return res.status(401).json("Admin already exist!");
        }
        const salt = yield bcrypt_1.default.genSalt(process.env.SALT_ROUNDS);
        const bcryptPassword = yield bcrypt_1.default.hash(password, salt);
        let newAdmin = yield pool.query('INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING *', [email, bcryptPassword]);
        const jwtToken = (0, jwtGenerator_1.jwtGenerator)(newAdmin.rows[0].id);
        return res.json({ jwtToken });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}));
router.post('/adminlogin', validInfo, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const admin = yield pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (admin.rows.length === 0) {
            return res.status(401).json("Email or Password Incorrect");
        }
        const validPassword = yield bcrypt_1.default.compare(password, admin.rows[0].password);
        if (!validPassword) {
            return res.status(401).json("Email or Password Incorrect");
        }
        const token = (0, jwtGenerator_1.jwtGenerator)(admin.rows[0].id);
        res.json({ token });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}));
router.get('/verify', authorizationMiddleware_1.authorize, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(true);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
}));
router.get('/hosts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allEmployees = yield (0, adminService_1.getAllEmployees)();
        res.status(200).send(allEmployees);
    }
    catch (error) {
        res.status(500).send({ status: "FAILED", data: { error } });
    }
}));
router.put('/modhost/:id', adminService_1.modifyHost);
router.delete('/deletehost/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, adminService_1.updateVisitorsforDelete)(req.body);
        yield (0, adminService_1.deleteHost)(req.body);
        res.status(204).send("Host deleted");
    }
    catch (error) {
        res.status(500).send({ status: "FAILED", data: { error } });
    }
}));
router.post('/addhost', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, adminService_1.addHost)(req.body);
        res.status(201).send("Successful");
    }
    catch (err) {
        res.status(500).send({ status: "FAILED", data: { err } });
    }
}));
router.get('/visitors', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allVisitors = yield (0, adminService_1.getVisitors)();
        res.status(200).json(allVisitors);
    }
    catch (error) {
        res.status(500).send({ status: "FAILED", data: { error } });
    }
}));
router.get('/dailyvisits', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dailyVisits = yield (0, adminService_1.getDailyVisits)();
        res.status(200).json(dailyVisits);
    }
    catch (error) {
        res.status(500).send({ status: "FAILED", data: { error } });
    }
}));
/*router.get('/busyHost', async (req, res) => {
    try {
        const busiestHosts = await getBusiestHosts();
        res.status(200).json(busiestHosts)
    } catch (error) {
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})*/
router.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/src/pages/Home.tsx'));
});
exports.default = router;
