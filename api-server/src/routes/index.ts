import { Router, type IRouter } from "express";
import healthRouter from "./health";
import affirmationsRouter from "./affirmations";
import ritualsRouter from "./rituals";
import dreamsRouter from "./dreams";
import journalRouter from "./journal";
import dashboardRouter from "./dashboard";
import claimLegacyRouter from "./claim-legacy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(affirmationsRouter);
router.use(ritualsRouter);
router.use(dreamsRouter);
router.use(journalRouter);
router.use(dashboardRouter);
router.use(claimLegacyRouter);

export default router;
