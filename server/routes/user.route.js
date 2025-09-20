import { Router } from "express";
import {

  refereshAccessToken,
  userLogin,
  userLogOut,
  userRegister,
} from "../controllers/user.control.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(userRegister);

router.route("/login").post(userLogin);

//Secure Route
router.route("/logout").post(verifyJWT, userLogOut);
router.route("/refresh-token").post(refereshAccessToken);