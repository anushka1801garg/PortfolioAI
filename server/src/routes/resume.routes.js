import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import {
  uploadResume,
  getUserResumes,
  deleteResume,
} from "../controllers/resume.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/upload", upload.single("resume"), uploadResume);

router.get("/", getUserResumes);

router.delete("/:id", deleteResume);

export default router;
