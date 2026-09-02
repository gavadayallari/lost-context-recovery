import { Request, Response } from "express";
import { processPullRequests } from "../services/pullRequest.service";

export const getRepositoryPullRequests = async (
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

    const pullRequests = await processPullRequests(owner, repo);

    res.status(200).json({
      success: true,
      message: "Pull requests fetched successfully",
      count: pullRequests.length,
      data: pullRequests,
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