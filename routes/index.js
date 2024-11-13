//adapting...
import userRoutes from './users.js';
import privateRoutes from './private.js';

const constructorMethod = (app) => {
  app.use('/', userRoutes);
  app.use('/private', privateRoutes);

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

export default constructorMethod;
