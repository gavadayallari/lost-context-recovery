import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import repositoryRoutes from "./routes/repository.routes";
import commitRoutes from "./routes/commit.routes";
import issueRoutes from "./routes/issue.routes";
import pullRequestRoutes from "./routes/pullRequest.routes";
import readmeRoutes from "./routes/readme.routes";
import contextRoutes from "./routes/context.routes";
import { testAI } from "./ai/testAI";
import syncRoutes from "./routes/sync.routes";
import timelineRoutes from "./routes/timeline.routes";
import overviewRoutes from "./routes/overview.routes";
import projectUnderstandingRoutes from "./routes/projectUnderstanding.routes";
import projectQuestionRoutes from "./routes/projectQuestion.routes";
import syncHistoryRoutes from "./routes/syncHistory.routes";
import repositoryListRoutes from "./routes/repositoryList.routes";
import projectAssistantRoutes from "./routes/projectAssistant.routes";

import { testDatabaseConnection } from "./config/database";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/repositories", repositoryRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/pull-requests", pullRequestRoutes);
app.use("/api/readme", readmeRoutes);
app.use("/api/context", contextRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/project-understanding", projectUnderstandingRoutes);
app.use("/api/project-question", projectQuestionRoutes);
app.use("/api/project-assistant", projectAssistantRoutes);
app.use("/api/sync-history", syncHistoryRoutes);
app.use("/api/repository-list", repositoryListRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Lost Context Recovery API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  await testDatabaseConnection();
  await testAI();
});