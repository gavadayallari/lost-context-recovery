import { Router } from "express";

import {
  getSyncHistoryController,
} from "../controllers/syncHistory.controller";

const router = Router();

router.get(
  "/:owner/:repo",
  getSyncHistoryController
);

export default router;