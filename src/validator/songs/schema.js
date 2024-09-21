import Joi from 'joi';

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  genre: Joi.string().required(),
  year: Joi.number().required(),
  performer: Joi.string().required(),
  albumId: Joi.string().optional(),
  duration: Joi.number().optional(),
});

export default SongPayloadSchema;
