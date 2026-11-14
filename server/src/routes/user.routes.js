import { Router } from "express";

import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  updateSubscription,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/profile", verifyJWT, getUserProfile);

router.put("/profile", verifyJWT, updateUserProfile);

router.post("/avatar", verifyJWT, upload.single("avatar"), uploadAvatar);

router.post("/subscribe", verifyJWT, updateSubscription);

export default router;

