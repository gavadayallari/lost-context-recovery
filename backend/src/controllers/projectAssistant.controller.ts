import { Request, Response } from "express";
import { askAssistant } from "../ai/projectAssistant.service";

export const askProjectAssistant = async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { question } = req.body;

    if (typeof owner !== "string" || typeof repo !== "string") {
      res.status(400).json({ success: false, message: "Owner and repository name are required" });
      return;
    }

    if (typeof question !== "string" || !question.trim()) {
      res.status(400).json({ success: false, message: "Question is required" });
      return;
    }

    const result = await askAssistant(owner, repo, question);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to answer question";
    
    if (errorMessage.includes("Repository not found")) {
      res.status(404).json({
        success: false,
        message: errorMessage,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};
