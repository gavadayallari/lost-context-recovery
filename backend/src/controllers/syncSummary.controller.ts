import { Request, Response } from "express";
import { getSyncSummary } from "../services/syncSummary.service";

export const getSyncSummaryController = async (
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

    const summary = await getSyncSummary(jobId);

    res.status(200).json({
      success: true,
      message: "Sync summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch sync summary",
    });
  }
};