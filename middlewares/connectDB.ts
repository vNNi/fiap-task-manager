import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';

const connectDB = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse) => {

    // Valido se ja esta conectado, se estiver processa a API normalmente
    if(mongoose.connections[0].readyState){
        return handler(req, res);
    }

    const {DB_CONNECTION_STRING} = process.env;
    if(!DB_CONNECTION_STRING){
        return res.status(500).json({error: 'Environment variables not found'});
    }

    await mongoose.connect(DB_CONNECTION_STRING);
    mongoose.connection.on('connected', () => console.log('Connected to Database'));
    mongoose.connection.on('error', err => console.log('Error to connect to database', err));


    return handler(req, res);
}

export default connectDB;