import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import routes from './index.js'; // Main router to include API and HTML routes
// Handle __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware for JSON, URL-encoded data, and static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'))); // Serve static assets
// Register all routes
app.use(routes);
// Fallback route for serving index.html (useful for SPA)
app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html')); // Adjust path if needed
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
    console.log('Running from directory:', __dirname);
});
