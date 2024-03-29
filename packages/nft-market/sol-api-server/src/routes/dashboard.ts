import { json, Request, Response, Router } from 'express';

const router = Router();
router.use(json({ limit: '100mb' }));

router.get('/login', (req: Request, res: Response) => {
    try {
      res.status(200).json({ success: true, data: {} });
    } catch (error: any) {
      res.status(500);
    }
});

export default router;
