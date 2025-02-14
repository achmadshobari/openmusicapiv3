import routes from './routes.js';

import AlbumsHandler from './handler.js';

export default {

  name: 'albums',

  version: '1.0.0',

  register: async (server, { service, cache, validator }) => {
    const albumsHandler = new AlbumsHandler(service, cache, validator);

    server.route(routes(albumsHandler));
  },

};
