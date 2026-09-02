import { Router } from "express";
import {
  getProjectUnderstandingController,
} from "../controllers/projectUnderstanding.controller";

const router = Router();

router.get(
  "/:owner/:repo",
  getProjectUnderstandingController
);

export default router;