import type { NextApiRequest, NextApiResponse } from "next";
import md5 from "md5";
import { DefaultResponseMsg } from "../../types/DefaultResponseMsg";
import { User } from "../../types/User";
import connectDB from "../../middlewares/connectDB";
import { UserModel } from "../../models/UserModel";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponseMsg>
) => {
  try {
    if (req.method !== "POST") {
      res.status(400).json({ error: "Method does not exist" });
      return;
    }

    if (req.body) {
      const user = req.body as User;
      if (!user.name || user.name.length < 3) {
        res.status(400).json({ error: "Name Invalid" });
        return;
      }

      if (
        !user.email ||
        !user.email.includes("@") ||
        !user.email.includes(".") ||
        user.email.length < 4
      ) {
        res.status(400).json({ error: "Email Invalid" });
        return;
      }

      if (!user.password || user.password.length < 4) {
        res.status(400).json({ error: "Password Invalid" });
        return;
      }

      var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
      if(!strongRegex.test(user.password)){
          res.status(400).json({ error: 'Senha do usuario invalida'});
          return;
      }

      const existingUser = await UserModel.find({ email: user.email });
      if (existingUser && existingUser.length > 0) {
        res
          .status(400)
          .json({ error: "User is already exist" });
        return;
      }

      const final = {
        ...user,
        password: md5(user.password),
      };

      await UserModel.create(final);
      res.status(200).json({ msg: "User Created" });
      return;
    }

    res.status(400).json({ error: "Invalid Parameters" });
  } catch (e) {
    console.log("Error to create user: ", e);
    res
      .status(500)
      .json({ error: "Error to create user, please try again." });
  }
};

export default connectDB(handler);
