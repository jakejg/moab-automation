import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

import routes from './routes';

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Calendar service is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
