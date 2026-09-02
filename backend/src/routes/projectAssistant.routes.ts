import { Router } from "express";
import { askProjectAssistant } from "../controllers/projectAssistant.controller";

const router = Router();
router.post("/:owner/:repo", askProjectAssistant);

export default router;
