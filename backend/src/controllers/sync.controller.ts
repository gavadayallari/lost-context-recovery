import { Request, Response } from "express";
import {startRepositorySync, getSyncStatus} from "../services/sync.service";

export const syncRepositoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { repoUrl } = req.body;

    if (
      typeof repoUrl !== "string" ||
      !repoUrl.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Repository URL is required",
      });
      return;
    }

    const job =
      await startRepositorySync(repoUrl);

    res.status(202).json({
      success: true,
      message: "Repository sync started",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start repository sync",
    });
  }
};

export const getSyncStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId } = req.params;

    if (typeof jobId !== "string") {
      res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
      return;
    }

    const job = await getSyncStatus(jobId);

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Sync job not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get sync status",
    });
  }
};