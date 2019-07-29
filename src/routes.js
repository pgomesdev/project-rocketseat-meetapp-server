import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import RegisterController from './app/controllers/RegisterController';
import AttendController from './app/controllers/AttendController';
import ScheduleController from './app/controllers/ScheduleController';
import auth from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Public Routes
routes.get('/', (req, res) => res.json({ message: 'Welcome to MeetApp API.' }));
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Private Routes
routes.use(auth);

// User
routes.put('/users', UserController.update);

// Meetup
routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

// Schedule
routes.get('/schedule', ScheduleController.index);

// Attend
routes.get('/attend', AttendController.index);

// Register
routes.post('/register', RegisterController.store);

// File
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
