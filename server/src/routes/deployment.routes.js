import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deployPortfolio,
  downloadPortfolioZip,
  downloadPortfolioHtml,
  saveLiveUrl,
  pushToGitHub,
  clearDeployment,
} from "../controllers/deployment.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/deploy", deployPortfolio);
router.post("/github-push", pushToGitHub);
router.get("/download-zip/:id", downloadPortfolioZip);
router.get("/download-html/:id", downloadPortfolioHtml);
router.post("/save-live-url", saveLiveUrl);
router.post("/clear-deployment", clearDeployment);

export default router;

