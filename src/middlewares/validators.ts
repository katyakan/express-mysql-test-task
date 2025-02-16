import { celebrate, Joi, Segments } from "celebrate";

//валидация id пользователя mail/phone
const phoneRegex = /^[+]?[0-9]{1,4}[ ]?([0-9]{6,15})$/;

export const validateUserId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string()
      .pattern(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/) // Для почты
      .message('Invalid email format')
      .required()
      .when(Joi.ref('userId'), {
        is: Joi.string().pattern(phoneRegex),
        then: Joi.string().pattern(phoneRegex).message('Invalid phone number format'),
        otherwise: Joi.string().email().message('Invalid email format'),
      })
  }),
});
// Валидация id файла
export const validateFileId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    fileId: Joi.number().integer().required(),
  }),
});

// Валидация файла
export const validateFile = celebrate({
  [Segments.BODY]: Joi.object().keys({
    file: Joi.object().required(),
  }),
});
