import express from 'express';
import v1Router from './api/v1/router.js';

const app = express();
app.use(express.json());

// Mount router under object-h/api/v1
app.use('/object-h/api/v1', v1Router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Object-H API running on http://localhost:${PORT}/object-h/api/v1`);
});
