import express from 'express';
const router = express.Router();
const pool = require( '../db').pool;
import bcrypt from 'bcrypt';
require('dotenv').config({ path: '../../.env'});
import { getAllEmployees,
    getVisitors,
    getDailyVisits,
    addHost,
    modifyHost,
    deleteHost,
    updateVisitorsforDelete } from './adminService';
import path from 'path';
import { jwtGenerator } from '../utils/jwtGenerator';
const validInfo = require('../utils/validInfo');
import{authorize} from "../utils/authorizationMiddleware";

router.post("/newAdmin",validInfo, async (req, res) => {
    try{
        const {email, password} = req.body;

        const admin = await pool.query('SELECT * FROM admins WHERE email = $1',[email]);

        if(admin.rows.length > 0){
            return res.status(401).json("Admin already exist!");
        }

        const salt = await bcrypt.genSalt(process.env.SALT_ROUNDS as unknown as number);
        const bcryptPassword = await bcrypt.hash(password, salt); 

        let newAdmin = await pool.query(
            'INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING *',[email, bcryptPassword]
        );

        const jwtToken = jwtGenerator(newAdmin.rows[0].id);

        return res.json({jwtToken});
    } catch(err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.post('/adminlogin',validInfo, async (req, res) => {
    const {email, password} = req.body;
    try {
        const admin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

        if(admin.rows.length === 0){
            return res.status(401).json("Email or Password Incorrect");
        }

        const validPassword = await bcrypt.compare(password, admin.rows[0].password);

        if(!validPassword){
            return res.status(401).json("Email or Password Incorrect");
        }

        const token = jwtGenerator(admin.rows[0].id);
        res.json({token});

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.get('/verify', authorize, async(req, res) => {
    try {
      res.json(true);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });


router.get('/hosts', async (req, res) => {
    try {
        const allEmployees = await getAllEmployees();
        res.status(200).send(allEmployees)
    } catch (error) {
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})

router.put('/modhost/:id', modifyHost);

router.delete('/deletehost/:id', async (req, res) => {
    try {
        await updateVisitorsforDelete(req.body)
        await deleteHost(req.body);
        res.status(204).send("Host deleted")
    } catch (error) {
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})

router.post('/addhost', async (req, res) => {
    try {
        await addHost(req.body)
        res.status(201).send("Successful")
    } catch (err) {
        res.status(500).send({ status: "FAILED", data: {err}}) 
    }
})

router.get('/visitors', async (req, res) => {
    try {
        const allVisitors = await getVisitors();
        res.status(200).json(allVisitors)
    } catch (error) {
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})

router.get('/dailyvisits', async (req, res) => {
    try {
        const dailyVisits = await getDailyVisits();
        res.status(200).json(dailyVisits)
    } catch (error) {
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})

/*router.get('/busyHost', async (req, res) => {
    try {
        const busiestHosts = await getBusiestHosts();
        res.status(200).json(busiestHosts)
    } catch (error) {
        res.status(500).send({ status: "FAILED", data: {error}})
    }
})*/

router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/Home.tsx'));
})


export default router;
