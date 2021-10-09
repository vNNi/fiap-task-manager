import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { executeRequest } from "../services/api";
import { AccessTokenProps } from "../types/AccessTokenProps";

const Login: NextPage<AccessTokenProps> = ({ setAccessToken }) => {
  const [login, setLogin] = useState(typeof window !=='undefined' && localStorage?.getItem("userEmail") || "");
  const [password, setPassword] = useState("");
  const [msgError, setMsgError] = useState("");
  const [passwordView, setPasswordView] = useState(false);
  const [loading, setLoading] = useState(false);

  const route = useRouter();

  const doLogin = async (e: any) => {
    try {
      setLoading(true);
      e.preventDefault();

      if (!login || !password) {
        setMsgError("Parâmetros de entrada inválidos");
        setLoading(false);
        return;
      }

      const body = {
        login,
        password,
      };

      const result = await executeRequest("login", "POST", body);

      setMsgError("");
      if (result && result.data) {
        localStorage.setItem("accessToken", result.data.token);
        localStorage.setItem("userName", result.data.name);
        localStorage.setItem("userEmail", result.data.email);
        setAccessToken(result.data.token);
      } else {
        setMsgError("Nao foi possivel processar login tente novamente!");
      }
    } catch (e: any) {
      console.log(e);
      if (e?.response?.data?.error) {
        setMsgError(e?.response?.data?.error);
      } else {
        setMsgError("Ocorreu erro ao processar login tente novamente!");
      }
    }

    setLoading(false);
  };

  const routePush = () => {
    route.push('/registry')
  };

  return (
    <div className="container-form">
      <img src="/logo.svg" alt="logo fiap" className="logo" />
      <form action="">
        {msgError && <p>{msgError}</p>}
        <div className="input">
          <img src="/mail.svg" alt="logo fiap" />
          <input
            type="text"
            placeholder="Informe seu email"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
          />
        </div>
        <div className="input">
          <img src="/lock.svg" alt="logo fiap" />
          <input
            type="password"
            placeholder="Informe sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button type="submit" onClick={doLogin} disabled={loading}>
          {loading ? "Carregando..." : "Login"}
        </button>
        <p className="registry-link" onClick={routePush}>Ainda nao tem conta? Cadastra-se aqui !</p>
      </form>
    </div>
  );
};

export default Login;
