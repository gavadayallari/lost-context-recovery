import { Request, Response } from "express";
import {
  getProjectOverview,
} from "../services/overview.service";

export const getProjectOverviewController = async (
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

    const overview =
      await getProjectOverview(owner, repo);

    res.status(200).json({
      success: true,
      message: "Project overview fetched successfully",
      data: overview,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch project overview",
    });
  }
};