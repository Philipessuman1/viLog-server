import jwt from 'jsonwebtoken';
import dotenv  from "dotenv";
dotenv.config();


export const jwtGenerator = (id: any) => {
    const payload = {
        admin: {
            id: id
        }
    
    };

    return jwt.sign(payload, process.env.TOKEN_SECRET as unknown as string, {expiresIn: "1hr"})
}