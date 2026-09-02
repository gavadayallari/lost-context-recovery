import { Request, Response } from "express";
import { processReadme } from "../services/readme.service";

export const getRepositoryReadme = async (
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

    const readme = await processReadme(owner, repo);

    res.status(200).json({
      success: true,
      message: "README fetched successfully",
      data: readme,
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