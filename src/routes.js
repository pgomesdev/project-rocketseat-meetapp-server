import { Router } from 'express';

const routes = new Router();

routes.get('/', (req, res) => res.json({ message: 'Welcome to my api' }));

export default routes;
