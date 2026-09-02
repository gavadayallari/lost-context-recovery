import { Router } from "express";
import { getRepositoryIssues } from "../controllers/issue.controller";

const router = Router();

router.get("/:owner/:repo", getRepositoryIssues);

export default router;