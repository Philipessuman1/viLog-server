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
exports.getDailyVisits = exports.getVisitors = exports.getAllEmployees = exports.deleteHost = exports.updateVisitorsforDelete = exports.modifyHost = exports.addHost = void 0;
const pool = require('../db').pool;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const addHost = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        pool.query(`INSERT INTO hosts (host_name, department, email, phone)
        VALUES ($1, $2, $3, $4)`, [body.host_name, body.department, body.email, body.phone]);
        console.log("Added new employee");
    }
    catch (err) {
        console.log(err);
    }
});
exports.addHost = addHost;
const modifyHost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { host_name, department, email, phone } = req.body;
    try {
        pool.query(`UPDATE hosts
         SET host_name = $1, department = $2, email = $3, phone = $4
         WHERE id = $5;
        `, [host_name, department, email, phone, id]);
        res.status(200).send(`Employee with ID:${id} updated`);
    }
    catch (err) {
        throw { status: 500, message: err };
    }
});
exports.modifyHost = modifyHost;
const updateVisitorsforDelete = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        pool.query(`UPDATE visitors
         SET host_id = null
         WHERE host_id = $1;
        `, [body.id]);
        return console.log("Visitors updated");
    }
    catch (err) {
        throw { status: 500, message: err };
    }
});
exports.updateVisitorsforDelete = updateVisitorsforDelete;
const deleteHost = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        pool.query(`DELETE FROM hosts
         WHERE id = $1
        `, [body.id]);
        console.log("Host deleted");
    }
    catch (err) {
        throw { status: 500, message: err };
    }
});
exports.deleteHost = deleteHost;
const getAllEmployees = () => __awaiter(void 0, void 0, void 0, function* () {
    return pool.query('SELECT * FROM hosts')
        .then((res) => {
        return res.rows;
    })
        .catch((err) => {
        throw { status: (err === null || err === void 0 ? void 0 : err.status) || 500, message: err.message };
    });
});
exports.getAllEmployees = getAllEmployees;
const getVisitors = () => __awaiter(void 0, void 0, void 0, function* () {
    return pool.query('SELECT * FROM visitors')
        .then((res) => {
        return res.rows;
    })
        .catch((err) => {
        throw { status: (err === null || err === void 0 ? void 0 : err.status) || 500, message: err.message };
    });
});
exports.getVisitors = getVisitors;
const getDailyVisits = () => __awaiter(void 0, void 0, void 0, function* () {
    return pool.query(`SELECT date, count(*) FROM visitors
        WHERE date > current_date - interval '30' day
        GROUP BY date
        ORDER BY date asc`)
        .then((res) => {
        return res.rows;
    })
        .catch((err) => {
        throw { status: (err === null || err === void 0 ? void 0 : err.status) || 500, message: err.message };
    });
});
exports.getDailyVisits = getDailyVisits;
/*export const getBusiestHosts = async () => {
    return pool.query(
        `SELECT hosts.host_name, count(visitors.host_id)
         FROM hosts
         JOIN visitors
         ON hosts.id = visitors.host_id
         WHERE date > current_date - interval '90' day
         GROUP BY 1, 2`
    )
    .then((res: { rows: any; }) => {
        return res.rows
    })
    .catch((err: { status: any; message: any; }) => {
        throw {status: err?.status || 500, message: err.message}
    })
};*/ 
