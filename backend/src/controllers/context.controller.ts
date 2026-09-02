import { Request, Response } from "express";
import { getProjectContext } from "../services/context.service";

export const getProjectContextController = async (
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

    const context = await getProjectContext(
      owner,
      repo
    );

    res.status(200).json({
      success: true,
      message: "Project context fetched successfully",
      data: context,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};