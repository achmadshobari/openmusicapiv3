import routes from './routes.js';

import ExportsHandler from './handler.js';

export default {

  name: 'exports',

  version: '1.0.0',

  register: async (server, { exportService, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler(exportService, playlistsService, validator);

    server.route(routes(exportsHandler));
  },

};
