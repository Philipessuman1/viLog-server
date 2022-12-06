import express from 'express';
import cors from 'cors';
import visitorRouter from './visitors/visitorRouter';
import adminRouter from './admin/adminRouter';
import * as dotenv from "dotenv";
import path from 'path';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


//middleware
app.use(cors());
app.use(express.json()); //req.body

if (process.env.NODE_ENV === "production") {
    app.use(express.static('../frontend/dist'))
};

app.use(visitorRouter);
app.use(adminRouter);


app.get('*', (req, res) => {
    console.log('outer route')
    res.sendFile(path.join(__dirname, '../frontend/src/pages/Home.tsx'));
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)});