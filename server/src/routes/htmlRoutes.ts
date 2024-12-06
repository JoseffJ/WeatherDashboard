import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router, type Request, type Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Define route to serve index.html
router.get('/', (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Define route to serve forecast page if needed
// router.get('/forecast', (req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname, '../../public/forecast.html'));
// });

export default router;
