import { Request, Response } from "express";
import { getProjectTimeline } from "../services/timeline.service";

export const getProjectTimelineController = async (
  req: Request,
  res: Response
) => {
  try {
    const { owner, repo } = req.params;

    if (
      typeof owner !== "string" ||
      typeof repo !== "string"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Owner and repository name are required",
      });
      return;
    }

    const timeline = await getProjectTimeline(
      owner,
      repo
    );

    res.status(200).json({
      success: true,
      message: "Project timeline fetched successfully",
      data: timeline,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch project timeline",
    });
  }
};