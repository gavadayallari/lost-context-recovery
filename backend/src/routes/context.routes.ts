import { Router } from "express";
import {
  getProjectContextController,
} from "../controllers/context.controller";

const router = Router();

router.get(
  "/:owner/:repo",
  getProjectContextController
);

export default router;