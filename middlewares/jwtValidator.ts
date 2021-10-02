import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import {DefaultResponseMsg} from '../types/DefaultResponseMsg';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtValidator = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse<DefaultResponseMsg>) => {

    const {MY_SECRET_KEY} = process.env;
    if(!MY_SECRET_KEY){
        return res.status(500).json({ error: 'Secret key no found'});
    }

    if(!req || !req.headers){
        return res.status(400).json({ error: 'Not possible validate token'});
    }

    if(req.method !== 'OPTIONS'){
        const authorization = req.headers['authorization'];
        if(!authorization){
            return res.status(401).json({ error: 'Token not provided'});
        }

        const token = authorization.substr(7);
        if(!token){
            return res.status(401).json({ error: 'Token not provided'});
        }

        try{
            const decoded = await jwt.verify(token, MY_SECRET_KEY) as JwtPayload;
            if(!decoded){
                return res.status(401).json({ error: 'Not possible validate token'});
            }

            if(req.body){
                req.body.userId = decoded._id;
            }else if(req.query){
                req.query.userId = decoded._id;
            }
        }catch(e){
            console.log(e)
            return res.status(500).json({ error: 'Error to handle JWT token'});
        }
    }

    return handler(req, res);
}

export default jwtValidator;
