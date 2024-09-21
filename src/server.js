import dotenv from 'dotenv';

import Hapi from '@hapi/hapi';

import { fileURLToPath } from 'url';

import Jwt from '@hapi/jwt';

import path from 'path';

import Inert from '@hapi/inert';

import ClientError from './exceptions/ClientError.js';

// Albums songs
import AlbumsValidator from './validator/albums/index.js';

import albums from './api/albums/index.js';

import AlbumsService from './services/postgres/AlbumsService.js';

// Songs
import SongsValidator from './validator/songs/index.js';

import songs from './api/songs/index.js';

import SongsService from './services/postgres/SongsService.js';

// users
import UsersValidator from './validator/users/index.js';

import users from './api/users/index.js';

import UsersService from './services/postgres/UsersService.js';

// authentications
import AuthenticationsValidator from './validator/authentications/index.js';

import TokenManager from './tokenize/TokenManager.js';

import authentications from './api/authentications/index.js';

import AuthenticationsService from './services/postgres/AuthenticationsService.js';

// playlists
import PlaylistValidator from './validator/playlists/index.js';

import playlists from './api/playlists/index.js';

import PlaylistService from './services/postgres/PlaylistsService.js';

// collaborations
import CollaborationsValidator from './validator/collaborations/index.js';

import collaborations from './api/collaborations/index.js';

import CollaborationsService from './services/postgres/CollaborationsService.js';

// playlistSong
import PlaylistSongValidator from './validator/playlistSongs/index.js';

import playlistSongs from './api/playlistSongs/index.js';

import PlaylistSongService from './services/postgres/PlaylistSongService.js';

// Exports
import ExportsValidator from './validator/exports/index.js';

import _exports from './api/exports/index.js';

import ProducerService from './services/rabbitmq/ProducerService.js';

// uploads
import UploadsValidator from './validator/uploads/index.js';

import uploads from './api/uploads/index.js';

import StorageService from './services/storage/StorageService.js';

// Cache
import CacheService from './services/redis/CacheService.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();

const init = async () => {
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistService(collaborationsService);
  const usersService = new UsersService();
  const playlistSongService = new PlaylistSongService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService();
  const storageService = new StorageService(path.resolve(__dirname, '.api/uploads/file/cover'));
  const cacheService = new CacheService();

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,

    routes: {

      cors: {

        origin: ['*'],

      },

    },

  });

  await server.register([

    {

      plugin: Jwt,

    },

    {

      plugin: Inert,

    },

  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {

    keys: process.env.ACCESS_TOKEN_KEY,

    verify: {

      aud: false,

      iss: false,

      sub: false,

      maxAgeSec: process.env.ACCESS_TOKEN_AGE,

    },

    validate: (artifacts) => ({

      isValid: true,

      credentials: {

        id: artifacts.decoded.payload.id,

      },

    }),

  });

  await server.register([

    {

      plugin: albums,

      options: {

        service: albumsService,

        cache: cacheService,

        validator: AlbumsValidator,

      },

    },

    {

      plugin: songs,

      options: {

        service: songsService,

        validator: SongsValidator,

      },

    },

    {

      plugin: users,

      options: {

        service: usersService,

        validator: UsersValidator,

      },

    },

    {

      plugin: authentications,

      options: {

        authenticationsService,

        usersService,

        tokenManager: TokenManager,

        validator: AuthenticationsValidator,

      },

    },

    {

      plugin: playlists,

      options: {

        service: playlistsService,

        validator: PlaylistValidator,

      },

    },

    {

      plugin: collaborations,

      options: {

        collaborationsService,

        playlistsService,

        usersService,

        validator: CollaborationsValidator,

      },

    },

    {

      plugin: playlistSongs,

      options: {

        playlistsService,

        playlistSongService,

        songsService,

        validator: PlaylistSongValidator,

      },

    },

    {

      plugin: _exports,

      options: {

        exportService: ProducerService,

        playlistsService,

        validator: ExportsValidator,

      },

    },

    {

      plugin: uploads,

      options: {

        uploadsService: storageService,

        albumsService,

        validator: UploadsValidator,

      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({

          status: 'fail',

          message: response.message,

        });

        newResponse.code(response.statusCode);

        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({

        status: 'error',

        message: 'Something went wrong',

      });

      newResponse.code(500);

      return newResponse;
    }

    return h.continue;
  });

  await server.start();

  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
