import { Router } from "express";
import { getRepositoryPullRequests } from "../controllers/pullRequest.controller";

const router = Router();

router.get("/:owner/:repo", getRepositoryPullRequests);

export default router;