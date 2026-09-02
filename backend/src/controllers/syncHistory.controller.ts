import { Request, Response } from "express";

import {
  getRepositorySyncHistory,
} from "../services/syncHistory.service";

export const getSyncHistoryController = async (
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

    const history =
      await getRepositorySyncHistory(
        owner,
        repo
      );

    res.status(200).json({
      success: true,
      message:
        "Sync history fetched successfully",
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(
      "Sync history error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch sync history",
    });
  }
};