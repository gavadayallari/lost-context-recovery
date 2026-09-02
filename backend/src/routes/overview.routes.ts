import { Router } from "express";
import {
  getProjectOverviewController,
} from "../controllers/overview.controller";

const router = Router();

router.get(
  "/:owner/:repo",
  getProjectOverviewController
);

export default router;