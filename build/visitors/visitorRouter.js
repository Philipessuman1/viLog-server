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
const visitorService_1 = require("./visitorService");
const host_1 = require("../host/host");
router.post('/addvisitor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.sendFile('index.html');
    }
    try {
        // const visitorId = addVisitorToDB(req.body.id);
        yield (0, host_1.sendNotifications)(req.body.id);
        res.status(201).send("Success");
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: "FAILED", data: { error } });
    }
}));
router.put('/signoutvisitor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, visitorService_1.signOutVisitor)(req.body.id);
        res.status(204).send("Signout successful");
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: "FAILED", data: { error } });
    }
}));
router.get('*', (req, res) => {
    res.sendFile(__dirname, '../../frontend/src/pages/Home.tsx');
});
exports.default = router;
