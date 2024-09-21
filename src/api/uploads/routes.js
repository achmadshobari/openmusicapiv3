import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const routes = (handler) => [

  {

    method: 'GET',

    path: '/albums/cover/{param*}',

    handler: {

      directory: {

        path: path.resolve(__dirname, 'file/cover'),

      },

    },

  },

  {

    method: 'POST',

    path: '/albums/{id}/covers',

    handler: handler.postUploadCoverHandler,

    options: {

      payload: {

        allow: 'multipart/form-data',

        multipart: true,

        output: 'stream',

      },

    },

  },

];

export default routes;
