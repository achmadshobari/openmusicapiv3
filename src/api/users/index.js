import routes from './routes.js';

import UsersHandler from './handler.js';

export default {

  name: 'users',

  version: '1.0.0',

  register: async (server, { service, validator }) => {
    const usersHandler = new UsersHandler(service, validator);

    server.route(routes(usersHandler));
  },
};
