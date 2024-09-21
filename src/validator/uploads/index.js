import CoverAlbumsSchema from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const UploadsValidator = {

  validateCoverHeaders: (headers) => {
    const validationResult = CoverAlbumsSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default UploadsValidator;
