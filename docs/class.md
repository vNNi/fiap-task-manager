------------------------------------------------------------ AULA 02 --
Node.js > 12
Mongo DB Community Server ou imagem Docker Mongo DB
Mongo Compass
VS Code
Postman / Insominia

SETUP - 
	npx create-next-app --type gerenciador-tarefas-next
	npm i mongoose md5
	npm i --save-dev @types/md5
	npm i jsonwebtoken
	npm i --save-dev @types/jsonwebtoken

START - npm run dev (Next / Vue)

----------------------------------------------- ENV

.env.example
DB_CONNECTION_STRING=mongodb://localhost:27017/gerenciadorTarefasFiapDB
MY_SECRET_KEY=minhaSenhaSuperSeguraParaOToken

.env.local
DB_CONNECTION_STRING=mongodb://localhost:27017/gerenciadorTarefasFiapDB
MY_SECRET_KEY=minhaSenhaSuperSeguraParaOToken

----------------------------------------------- TYPES

Login.ts 

export type Login = {
    login: string,
    password : string
}

DefaultResponseMsg.ts (type)

export type DefaultResponseMsg = {
    error? : string,
    msg? : string
}

User.ts

export type User = {
    _id: String,
    name : String,
    email : String, 
    password : String
}

LoginResponse .ts

export type LoginResponse = {
    token: string,
    name: string,
    email : string
}

Task.ts

export type Task = {
    _id?: string,
    name : string, 
    userId : string, 
    finishPrevisionDate : Date, 
    finishDate? : Date
}

----------------------------------------------- APIS

--- login.ts 

import type {NextApiRequest, NextApiResponse} from 'next';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import connectDB from '../../middlewares/connectDB';
import {UserModel} from '../../models/UserModel';
import {DefaultResponseMsg} from '../../types/DefaultResponseMsg';
import { Login } from '../../types/Login';
import { LoginResponse } from '../../types/LoginResponse';

 const handler = async (req : NextApiRequest, res : NextApiResponse<DefaultResponseMsg | LoginResponse>) => {
    try{
        if(req.method !== 'POST'){
            res.status(400).json({ error: 'Metodo solicitado nao existe '});
            return;
        }

        const {MY_SECRET_KEY} = process.env;
        if(!MY_SECRET_KEY){
            res.status(500).json({ error: 'ENV my secret key nao encontrada '});
            return;
        }

        if(req.body){
            const auth = req.body as Login;
            if(auth.login && auth.password){
                const usersFound = await UserModel.find({email : auth.login, password: md5(auth.password)});
                if(usersFound && usersFound.length > 0){
                    const user = usersFound[0];
                    const token = jwt.sign({_id : user._id}, MY_SECRET_KEY);
                    res.status(200).json({ token, name: user.name, email: user.email});
                    return;
                }
            }
        }

        res.status(400).json({ error: 'Usuario ou senha invalidos '});
    }catch(e){
        console.log('Ocorreu erro ao autenticar usuario: ', e);
        res.status(500).json({ error: 'Ocorreu erro ao autenticar usuario, tente novamente '});
    }
}

export default connectDB(handler);

--- user.ts

import type {NextApiRequest, NextApiResponse} from 'next';
import md5 from 'md5';
import {DefaultResponseMsg} from '../../types/DefaultResponseMsg';
import { User } from '../../types/User';
import connectDB from '../../middlewares/connectDB';
import {UserModel} from '../../models/UserModel';

const handler = async(req : NextApiRequest, res : NextApiResponse<DefaultResponseMsg>) =>{
    try{
        if(req.method !== 'POST'){
            res.status(400).json({ error: 'Metodo solicitado nao existe '});
            return;
        }

        if(req.body){
            const user = req.body as User;
            if(!user.name || user.name.length < 3){
                res.status(400).json({ error: 'Nome do usuario invalido'});
                return;
            }

            if(!user.email || !user.email.includes('@') || !user.email.includes('.')
                || user.email.length < 4){
                res.status(400).json({ error: 'Email do usuario invalido'});
                return;
            }

            var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
            if(!strongRegex.test(user.password)){
                res.status(400).json({ error: 'Senha do usuario invalida'});
                return;
            }

            const existingUser = await UserModel.find({email : user.email});
            if(existingUser && existingUser.length > 0){
                res.status(400).json({ error: 'Ja existe usuario com o email informado'});
                return;
            }

            const final = {
                ...user,
                password : md5(user.password)
            }

            await UserModel.create(final);
            res.status(200).json({msg: 'Usuario adicionado com sucesso'});
            return;
        }

        res.status(400).json({error: 'Parametros de entrada invalidos'});
    }catch(e){
        console.log('Ocorreu erro ao criar usuario: ', e);
        res.status(500).json({ error: 'Ocorreu erro ao criar usuario, tente novamente '});
    }
}

export default connectDB(handler);

-- task.ts

import type {NextApiRequest, NextApiResponse} from 'next';
import {DefaultResponseMsg} from '../../types/DefaultResponseMsg';
import connectDB from '../../middlewares/connectDB';
import jwtValidator from '../../middlewares/jwtValidator';
import { Task } from '../../types/Task';
import { TaskModel } from '../../models/TaskModel';
import { UserModel } from '../../models/UserModel';

const handler = async(req:NextApiRequest, res:NextApiResponse<DefaultResponseMsg>) =>{
    try{
        if(req.method === 'POST'){
            return await saveTask(req, res);
        }else if(req.method === 'GET'){
            return;
        }else if(req.method === 'PUT'){
            return;
        }else if(req.method === 'DELETE'){
            return;
        }

        res.status(400).json({ error: 'Metodo solicitado nao existe '});
    }catch(e){
        console.log('Ocorreu erro ao gerenciar tarefas: ', e);
        res.status(500).json({ error: 'Ocorreu erro ao gerenciar tarefas, tente novamente '});
    }
}

const saveTask = async(req:NextApiRequest, res:NextApiResponse<DefaultResponseMsg>) =>{
    if(req.body){
        const userId = req.body.userId;
        if(!userId){
            return res.status(400).json({ error: 'Usuario nao informado'});
        }

        const userFound = await UserModel.findById(userId);
        if(!userFound){
            return res.status(400).json({ error: 'Usuario nao encontrado'});
        }

        const task = req.body as Task;

        if(!task.name || task.name.length < 2){
            return res.status(400).json({ error: 'Nome da tarefa invalida'});
        }

        if(!task.finishPrevisionDate || new Date(task.finishPrevisionDate).getDate() < new Date().getDate()){
            return res.status(400).json({ error: 'Data de previsao invalida ou menor que hoje'});
        }

        const final = {
            ...task,
            userId,
            finishDate : undefined
        } as Task;

        await TaskModel.create(final);
        return res.status(200).json({ msg: 'Tarefa criada com sucesso'});
    }

    return res.status(400).json({ error: 'Parametros de entrada invalido'});
}

export default connectDB(jwtValidator(handler));

----------------------------------------------- POSTMAN

Login:
{
    "login": "admin@admin.com",
    "password": "Admin@123"
}


----------------------------------------------- MODELS

UserModel.ts

import mongoose, {Schema} from 'mongoose';

const UserSchema = new Schema({
    name : { type : String, required: [true, '* Campo obrigatorio!']},
    email : { type : String, required: [true, '* Campo obrigatorio!']},
    password : { type : String, required: [true, '* Campo obrigatorio!']},
});

export const UserModel = mongoose.models.users || mongoose.model('users', UserSchema);

TaskModel.ts

import mongoose, {Schema} from 'mongoose';

const TaskSchema = new Schema({
    name : {type: String, required: [true, '* Campo obrigatorio!']},
    userId : {type: String, required: [true, '* Campo obrigatorio!']},
    finishPrevisionDate : {type: Date, required: [true, '* Campo obrigatorio!']},
    finishDate : {type: Date},
});

export const TaskModel = mongoose.models.tasks || mongoose.model('tasks', TaskSchema);

----------------------------------------------- MIDDLEWARES

--ConectDB.ts
import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';

const connectDB = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse) => {

    // Valido se ja esta conectado, se estiver processa a API normalmente
    console.log('MongoDD readyState', mongoose.connections[0].readyState);
    if(mongoose.connections[0].readyState){
        return handler(req, res);
    }

    const {DB_CONNECTION_STRING} = process.env;
    if(!DB_CONNECTION_STRING){
        return res.status(500).json({error: 'ENV database nao informada'});
    }

    await mongoose.connect(DB_CONNECTION_STRING);
    mongoose.connection.on('connected', () => console.log('Conectado na database'));
    mongoose.connection.on('error', err => console.log('Ocorreu erro ao conectar na database', err));


    return handler(req, res);
}

export default connectDB;

-- jwtValidation.ts
import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import {DefaultResponseMsg} from '../types/DefaultResponseMsg';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtValidator = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse<DefaultResponseMsg>) => {

    const {MY_SECRET_KEY} = process.env;
    if(!MY_SECRET_KEY){
        return res.status(500).json({ error: 'ENV my secret key nao encontrada '});
    }

    if(!req || !req.headers){
        return res.status(400).json({ error: 'Nao foi possivel validar o token de acesso '});
    }

    if(req.method !== 'OPTIONS'){
        const authorization = req.headers['authorization'];
        if(!authorization){
            return res.status(401).json({ error: 'Nenhum token de acesso informado'});
        }

        const token = authorization.substr(7);
        if(!token){
            return res.status(401).json({ error: 'Nenhum token de acesso informado'});
        }

        try{
            const decoded = await jwt.verify(token, MY_SECRET_KEY) as JwtPayload;
            if(!decoded){
                return res.status(401).json({ error: 'Nao foi possivel validar o token'});
            }

            if(req.body){
                req.body.userId = decoded._id;
            }else if(req.query){
                req.query.userId = decoded._id;
            }
        }catch(e){
            console.log(e)
            return res.status(500).json({ error: 'Ocorreu erro ao tratar token JWT'});
        }
    }

    return handler(req, res);
}

export default jwtValidator;


// Figma
https://www.figma.com/file/knytjAN1Sb4DYxtMLNv8xw/FIAP?node-id=1%3A78

