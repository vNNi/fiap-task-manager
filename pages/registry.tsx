import type { NextPage } from "next";
import RegistryContainer from "../containers/Registry";
const Registry: NextPage = () => {
  return (<RegistryContainer setAccessToken={() => ({})} />);
};

export default Registry;
