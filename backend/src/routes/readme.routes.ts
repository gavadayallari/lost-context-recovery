import { Router } from "express";
import { getRepositoryReadme } from "../controllers/readme.controller";

const router = Router();

router.get("/:owner/:repo", getRepositoryReadme);

export default router;