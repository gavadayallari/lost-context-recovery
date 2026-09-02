import { Request, Response } from "express";
import { processRepository } from "../services/repository.service";

export const createRepository = async (
  req: Request,
  res: Response
) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      res.status(400).json({
        success: false,
        message: "Repository URL is required",
      });
      return;
    }

    const result = await processRepository(repoUrl);

    res.status(201).json({
      success: true,
      message: "Repository fetched successfully",
      data: result,
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