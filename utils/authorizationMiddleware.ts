
import jwt from 'jsonwebtoken';
import dotenv  from "dotenv";
dotenv.config();


export const authorize = async (req:any, res:any, next: any) => {
        const token = req.header("jwt_token");
    
        if(!token) {
            return res.status(403).send("Not Authorized");
        }
    
    try {

        const payload = jwt.verify(token, process.env.TOKEN_SECRET as unknown as string);

        req.admin = (payload as any).admin;
        next();
    } catch (err) {
        console.log(err)
        return res.status(403).send("Not Authorized");
    }
};