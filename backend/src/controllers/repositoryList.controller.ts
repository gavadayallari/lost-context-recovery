import { Request, Response } from "express";
import { getRepositories } from "../services/repositoryList.service";

export const getRepositoriesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const repositories = await getRepositories();

    res.status(200).json({
      success: true,
      message: "Repositories fetched successfully",
      count: repositories.length,
      data: repositories,
    });
  } catch (error) {
    console.error("Repository list error:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch repositories",
    });
  }
};