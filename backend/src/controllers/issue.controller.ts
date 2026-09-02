import { Request, Response } from "express";
import { processIssues } from "../services/issue.service";

export const getRepositoryIssues = async (
  req: Request,
  res: Response
) => {
  try {
    const { owner, repo } = req.params;

    if (typeof owner !== "string" || typeof repo !== "string") {
      res.status(400).json({
        success: false,
        message: "Owner and repository name are required",
      });
      return;
    }

    const issues = await processIssues(owner, repo);

    res.status(200).json({
      success: true,
      message: "Issues fetched successfully",
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};