import { Request, Response } from "express";
import { processCommits } from "../services/commit.service";

export const getRepositoryCommits = async (
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

    const commits = await processCommits(owner, repo);

    res.status(200).json({
      success: true,
      message: "Commits fetched successfully",
      count: commits.length,
      data: commits,
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