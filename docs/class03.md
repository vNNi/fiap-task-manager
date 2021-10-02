---------- CONFIGS

https://ifonts.xyz/biennale-font.html
https://css-tricks.com/snippets/css/a-guide-to-flexbox/

npm i react-bootstrap bootstrap@4.6.0 node-sass sass
 npm i axios


--------- TYPE

-- AccessTokenProps .ts

export type AccessTokenProps = {
    setAccessToken(e : string) : void
}

--------- NEXT.JS

-- _app.tsx
import "../styles/app.scss";
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp

-- index.tsx

import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import { Home } from '../containers/Home';
import { Login} from '../containers/Login';

const Index: NextPage = () => {

  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    if(typeof window !== "undefined"){
      const token = localStorage.getItem('accessToken')
      if(token){
        setAccessToken(token);
      }
    }
  })

  return (
    !accessToken ? <Login setAccessToken={setAccessToken} /> 
        : <Home  setAccessToken={setAccessToken}/>
  )
}

export default Index

-- Login.tsx
import type { NextPage } from 'next'
import { useState } from 'react'
import { executeRequest } from '../services/api';
import { AccessTokenProps } from '../types/AccessTokenProps';

const Login: NextPage<AccessTokenProps> = ({
  setAccessToken
}) => {

  const [login, setLogin] = useState('teste');
  const [password, setPassword] = useState('');
  const [msgErro, setMsgErro] = useState('');
  const [isLoading, setLoading] = useState(false);

  const doLogin = async (e : any) =>{
    try{
      setLoading(true);
      e.preventDefault();
      
      if(!login || !password){
        setMsgErro('Parâmetros de entrada inválidos');
          setLoading(false);
        return;
      }

      const body = {
        login,
        password
      }

      const result = await executeRequest('login', 'POST', body);
      
      setMsgErro('');
      if(result && result.data){
        localStorage.setItem('accessToken', result.data.token);
        localStorage.setItem('userName', result.data.name);
        localStorage.setItem('userEmail', result.data.email);
        setAccessToken(result.data.token);
      }else{
        setMsgErro('Nao foi possivel processar login tente novamente!');
      }
    }catch(e : any){
      console.log(e);
      if(e?.response?.data?.error){
        setMsgErro(e?.response?.data?.error);
      }else{
        setMsgErro('Ocorreu erro ao processar login tente novamente!');
      }
    }

    setLoading(false);
  }

  return (
    <div className="container-login">
      <img src="/logo.svg" alt="Logo Fiap" className="logo"/>
      <form>
        {msgErro && <p>{msgErro}</p>}
        <div className="input">
          <img src="/mail.svg" alt="Logo Fiap"/>
          <input type="text" placeholder="Informe seu email"
            value={login} onChange={e => setLogin(e.target.value)} />
        </div>
        <div className="input">
          <img src="/lock.svg" alt="Logo Fiap"/>
          <input type="password" placeholder="Informe sua senha"
            value={password} onChange={e => setPassword(e.target.value)}/>
        </div>
        <button className={isLoading ? "disabled" : ""} type="button" onClick={doLogin} disabled={isLoading}>{isLoading ? "...Carregando" : "Login"}</button>
      </form>
    </div>
  )
}

export { Login }

-- Home.tsx

import type { NextPage } from 'next'
import { useState } from 'react'
import { Header } from '../components/Header';
import { executeRequest } from '../services/api';
import { AccessTokenProps } from '../types/AccessTokenProps';

const Home: NextPage<AccessTokenProps> = ({ setAccessToken }) => {
  
  const sair = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setAccessToken('');
  }

  return (
    <>
      <Header sair={sair}/>
    </>
  )
}

export { Home }


--------- CSS

-- config.scss
$primaryColor: #ED1164;
$secondaryColor: #91A3AD;
$lightGreyColor: #FFEBF2;
$mediumGreyColor: #91A3AD;
$darkGreyColor: #575757;
// vermelho #D60B04 - laranja #ED421C - amarelo #EDB428
$errorColor: #D60B04;

-- app.scss

@import "~bootstrap/scss/bootstrap";

@font-face {
    font-family: 'Biennale Regular';
    font-style: normal;
    font-weight: normal;
    src: url('../public/fonts/BiennaleRegular.otf') format('opentype');
}

html {
    height: 100%;
    font-family: 'Biennale Regular';
}

body {
    height: 100%;
    font-family: 'Biennale Regular';
}

#__next{
    height: 100%;
    display: flex;
    flex: 1 1 0%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    -webkit-box-pack: center;
    -webkit-box-align: center;
    padding: 0px;
}

@import './config.scss';
@import './login.scss';
@import './header.scss';

-- login.scss

@import './config.scss';

.container-login {
    .logo {
        width: 178.35px;
        display: block;
        margin: auto;
        margin-bottom: 30px;
    }

    p {
        text-align: center;
        color: $errorColor;
        font-weight: bold;
        max-width: 300px;
    }

    .input {
        display: flex;
        flex-direction: row;
        padding: 10px;

        img{
            width: 20px;
            margin-right: 10px;
            margin-top: -10px;
        }

        input {
            width: 224px;
            font-size: 14px;
            letter-spacing: 0.01em;
            color: $primaryColor;
            border-radius: 0px;
            border-top-width: 0px;
            border-left-width: 0px;
            border-right-width: 0px;
            border-bottom-width: 0.1em;
            border-color: $mediumGreyColor;
            padding-bottom: 8px;

            outline: none;

            &:focus {
                border-color: $primaryColor;
            }

            &::placeholder {
                color: $mediumGreyColor;
                opacity: 1;
            }

            &:-ms-input-placeholder {
                color: $mediumGreyColor;
            }

            &::-ms-input-placeholder{
                color: $mediumGreyColor;
            }
        }
    }

    button {
        width: 100%;
        height: 56px;
        background-color: $primaryColor;
        border: none;
        color: white;
        border-radius: 12px;
        font-size: 16px;
        margin-top: 30px;
    }

    @media screen and (min-width:1024px) {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        
        .logo{
            width:520px;
            margin: 0px;
        }

        p {
            max-width: none;
        }

        form {
            border-style: solid;
            border-color: $primaryColor;
            border-width: 0.1em;
            border-radius: 32px;
            padding: 80px 40px;
            
            .input{
                img{
                    width: 20px;
                }

                input{
                    width: 343px;
                }
            }
        }
    }
}

-- header.scss

@import './config.scss';

.container-header{
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    border-bottom-color: $lightGreyColor;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    padding-top: 24px;
    padding-bottom: 24px;

    .logo {
        width: 92px;
        margin-left: 24px;
    }

    button {
        display: none;
    }

    .desktop {
        display: none;
    }

    .mobile {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        span {
            color: $primaryColor;
            margin-right: 10px;
        }
        img {
            width: 30px;
            margin-right: 16px;
        }
    }

    @media screen and (min-width:1024px) {
        .mobile {
            display: none;
        }

        .logo {
            width: 130px;
            margin-left: 80px;
        }

        button {
            display: block;
            border : none;
            background-color: $secondaryColor;
            color: white;
            border-radius: 12px;
            font-size: 16px;
            width: 175px;
            height: 40px;
            align-items: center;

            span {
                font-size: 24px;
                letter-spacing: 2px;
            }
        }

        .desktop {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            margin-right: 80px;
    
            span {
                font-size: 20px;
                color: $primaryColor;
                margin-right: 20px;
            }
            img {
                cursor: pointer;
            }
        }
    }
}

--------- COMPONENTS

-- Header.tsx

import type { NextPage } from 'next'
import { useState } from 'react'
import { executeRequest } from '../services/api';
import { AccessTokenProps } from '../types/AccessTokenProps';

type HeaderProps = {
    sair() : void
}

const Header: NextPage<HeaderProps> = ({ sair }) => {

  const fullName = localStorage.getItem('userName');
  const userName = fullName?.split(' ')[0] || '';

  return (
    <div className="container-header">
      <img src="/logo.svg" alt="Logo Fiap" className="logo"/>
      <button><span>+</span> Adicionar Tarefa</button>
      <div className="mobile">
        <span>Olá, {userName}</span>
        <img src="/exit-mobile.svg" alt="Deslogar" onClick={sair}/>
      </div>
      <div className="desktop">
        <span>Olá, {userName}</span>
        <img src="/exit-desktop.svg" alt="Deslogar" onClick={sair}/>
      </div>
    </div>
  )
}

export { Header }

--------- SERVICES

-- api.ts

import axios, {Method} from 'axios';

export const executeRequest = (endpoint: string, method :Method, body? : any) =>{
    const headers = { 'Content-Type' : 'application/json'} as any;

    const URL = 'http://localhost:3000/api/' + endpoint;
    console.log(`executando : ${URL}, metodo : ${method}, body : ${body}
        , headers : ${headers}`);
    return axios.request({
        url : URL,
        method : method,
        data: body? body : '',
        headers : headers,
        timeout: 30000
    });
}

--------- ASSETS (SVG/FONTE) PASTA PUBLIC

-- logo.svg
-- mail.svg
-- lock.svg
-- fonts/BiennaleRegular.otf

---------