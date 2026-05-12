import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import packagesRouter from "./packages";
import bankAccountsRouter from "./bank_accounts";
import ordersRouter from "./orders";
import enrollmentsRouter from "./enrollments";
import materialsRouter from "./materials";
import questionsRouter from "./questions";
import quizzesRouter from "./quizzes";
import tryoutsRouter from "./tryouts";
import attemptsRouter from "./attempts";
import adminRouter from "./admin";
import studentRouter from "./student";
import preTestRouter from "./pre-test";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(packagesRouter);
router.use(bankAccountsRouter);
router.use(ordersRouter);
router.use(enrollmentsRouter);
router.use(materialsRouter);
router.use(questionsRouter);
router.use(quizzesRouter);
router.use(tryoutsRouter);
router.use(attemptsRouter);
router.use(adminRouter);
router.use(studentRouter);
router.use(preTestRouter);

export default router;
