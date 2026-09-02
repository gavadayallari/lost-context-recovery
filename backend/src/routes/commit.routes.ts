import { Router } from "express";
import { getRepositoryCommits } from "../controllers/commit.controller";

const router = Router();

router.get("/:owner/:repo", getRepositoryCommits);

export default router;