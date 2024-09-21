import autoBind from 'auto-bind';

class UsersHandler {
  constructor(service, validator) {
    this._validator = validator;

    this._service = service;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);

    const { username, password, fullname } = request.payload;

    const userId = await this._service.addUser({ username, password, fullname });

    const response = h.response({

      status: 'success',

      data: {

        userId,

      },

    });

    response.code(201);

    return response;
  }
}

export default UsersHandler;
