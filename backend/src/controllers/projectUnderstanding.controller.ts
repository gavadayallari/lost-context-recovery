import { Request, Response } from "express";
import {
  getProjectUnderstanding,
} from "../services/projectUnderstanding.service";

export const getProjectUnderstandingController = async (
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

    const understanding =
      await getProjectUnderstanding(
        owner,
        repo
      );

    res.status(200).json({
      success: true,
      message:
        "Project understanding generated successfully",
      data: understanding,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate project understanding",
    });
  }
};