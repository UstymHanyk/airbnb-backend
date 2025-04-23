import 'reflect-metadata';
import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import path from 'path';
import { container } from './core/di-container';
import AppSymbols from './core/app-symbols';
import { PropertyController } from './presentation/controllers/PropertyController';
import { handlebarsHelpers } from './presentation/helpers/handlebars-helpers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Handlebars view engine
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'presentation/views/layouts'),
  partialsDir: path.join(__dirname, 'presentation/views/partials'),
  helpers: handlebarsHelpers
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'presentation/views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Get controller instances from DI container
const propertyController = container.resolve<PropertyController>(AppSymbols.PropertyController);

// Routes
app.get('/', (req, res) => {
  res.redirect('/properties');
});

// Property routes
app.get('/properties', (req, res) => propertyController.getAllProperties(req, res));
app.get('/properties/new', (req, res) => propertyController.getCreateForm(req, res));
app.post('/properties', (req, res) => propertyController.createProperty(req, res));
app.get('/properties/:id', (req, res) => propertyController.getPropertyDetails(req, res));
app.get('/properties/:id/edit', (req, res) => propertyController.getEditForm(req, res));
app.post('/properties/:id', (req, res) => propertyController.updateProperty(req, res));
app.post('/properties/:id/delete', (req, res) => propertyController.deleteProperty(req, res));

// Error handling
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 