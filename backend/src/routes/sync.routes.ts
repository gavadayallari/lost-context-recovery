import { Router } from "express";
import { syncRepositoryController,getSyncStatusController } from "../controllers/sync.controller";
import {getSyncSummaryController}from "../controllers/syncSummary.controller";

const router = Router();

router.post("/", syncRepositoryController);
router.get("/:jobId", getSyncStatusController);
router.get("/:jobId/summary",getSyncSummaryController);

export default router;