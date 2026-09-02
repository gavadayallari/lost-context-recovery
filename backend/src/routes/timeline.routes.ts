import { Router } from "express";
import {
  getProjectTimelineController,
} from "../controllers/timeline.controller";

const router = Router();

router.get(
  "/:owner/:repo",
  getProjectTimelineController
);

export default router;