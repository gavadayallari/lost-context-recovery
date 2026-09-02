import { Router } from "express";
import {
  askProjectQuestion,
} from "../controllers/projectQuestion.controller";

const router = Router();

router.post(
  "/:owner/:repo",
  askProjectQuestion
);

export default router;