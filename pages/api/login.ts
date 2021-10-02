import type { NextApiRequest, NextApiResponse } from "next";
import md5 from "md5";
import jwt from "jsonwebtoken";
import connectDB from "../../middlewares/connectDB";
import { UserModel } from "../../models/UserModel";
import { DefaultResponseMsg } from "../../types/DefaultResponseMsg";
import { Login } from "../../types/Login";
import { LoginResponse } from "../../types/LoginResponse";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponseMsg | LoginResponse>
) => {
  try {
    if (req.method !== "POST") {
      res.status(400).json({ error: "Method does not exist" });
      return;
    }

    const { MY_SECRET_KEY } = process.env;
    if (!MY_SECRET_KEY) {
      res.status(500).json({ error: "Secret key not found" });
      return;
    }

    if (req.body) {
      const auth = req.body as Login;
      if (auth.login && auth.password) {
        const usersFound = await UserModel.find({
          email: auth.login,
          password: md5(auth.password),
        });
        if (usersFound && usersFound.length > 0) {
          const user = usersFound[0];
          const token = jwt.sign({ _id: user._id }, MY_SECRET_KEY);
          res.status(200).json({ token, name: user.name, email: user.email });
          return;
        }
      }
    }

    res.status(400).json({ error: "Invalid user or password" });
  } catch (e) {
    console.log("Error to authenticate user: ", e);
    res
      .status(500)
      .json({ error: "Error to authenticate user, please try again!" });
  }
};

export default connectDB(handler);
