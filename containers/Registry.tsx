import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { executeRequest } from "../services/api";
import { AccessTokenProps } from "../types/AccessTokenProps";

const Registry: NextPage<AccessTokenProps> = ({ setAccessToken }) => {
  const route = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msgError, setMsgError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordView, setPasswordView] = useState(false);
  const [loading, setLoading] = useState(false);

  const doRegistry = async (e: any) => {
    try {
      setLoading(true);
      e.preventDefault();

      if (!email || !password || !name) {
        setMsgError("Parâmetros de entrada inválidos");
        setLoading(false);
        return;
      }

      const body = {
        name,
        email,
        password,
      };

      const result = await executeRequest("user", "POST", body);

      setMsgError("");
      setSuccess("");

      if (result && result.data) {
        setSuccess("Cadastro efetuado com sucesso !");
        localStorage.setItem("userEmail", email);
      } else {
        setMsgError("Nao foi possivel processar o cadastramento tente novamente!");
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

  const backToLogin = () => {
    route.push('/');
  };

  return (
    <div className="container-form">
      <img src="/logo.svg" alt="logo fiap" className="logo"/>
      <form action="">
        {msgError && <p className="error">{msgError}</p>}
        {success && (
            <>
                <p className="success">{success}</p>
                <p className="clickable" onClick={backToLogin}>Voltar a página de login</p>
            </>
        )}
        <div className="input">
          <img src="/user-icon.svg" alt="logo nome" />
          <input
            type="text"
            placeholder="Informe seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="input">
          <img src="/mail.svg" alt="logo email" />
          <input
            type="text"
            placeholder="Informe seu email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="input">
          <img src="/lock.svg" alt="logo senha"  />
          <input
            type={passwordView ? `text`: `password`}
            placeholder="Informe sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className="showPassword" onClick={() => setPasswordView(!passwordView)}>{passwordView ? `Esconder Senha` : `Mostrar senha`}</span>
        </div>
        <button type="submit" onClick={doRegistry} disabled={loading}>
          {loading ? "Carregando..." : "Cadastrar"}
        </button>
        <p className="registry-link" onClick={backToLogin}>Já possui cadastro? efetue o login!</p>
      </form>
    </div>
  );
};

export default Registry;
