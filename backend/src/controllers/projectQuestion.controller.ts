import { Request, Response } from "express";
import {
  answerProjectQuestion,
} from "../services/projectQuestion.service";

export const askProjectQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { owner, repo } = req.params;
    const { question } = req.body;

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

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Question is required",
      });
      return;
    }

    const result =
      await answerProjectQuestion(
        owner,
        repo,
        question
      );

    res.status(200).json({
      success: true,
      message: "Question answered successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to answer question",
    });
  }
};