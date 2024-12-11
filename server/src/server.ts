import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import routes from './routes/index.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(routes);
// Middleware for static files, JSON, and URL-encoded data
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect API and HTML routes
app.use('/api/weather', routes);

// HTML route to serve index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => console.log(`Server listening on PORT: ${PORT}`));