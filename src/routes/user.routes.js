import { Router } from "express";
import { logoutUser, registerUser, loginUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { veryfyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser); // No middleware here

router.route("/logout").post(veryfyJwt, logoutUser); // Apply veryfyJwt middleware here

router.route("/refresh-token").post(refreshAccessToken)
export default router;
