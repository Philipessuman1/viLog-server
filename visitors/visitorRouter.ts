import express from 'express';
const router = express.Router();
import { addVisitorToDB, signOutVisitor } from './visitorService';
import { sendNotifications } from '../host/host';

router.post('/addvisitor', async (req, res) => {
    if (!req.body){
        res.sendFile('index.html');
    }
    try {
       // const visitorId = addVisitorToDB(req.body.id);
        await sendNotifications(req.body.id)
        res.status(201).send("Success")
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})

router.put('/signoutvisitor/:id', async (req, res) => {
    try {
        await signOutVisitor(req.body.id)
        res.status(204).send("Signout successful")
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})

router.get('*', (req, res) => {
    res.sendFile(__dirname, '../../frontend/src/pages/Home.tsx');
})

export default router;