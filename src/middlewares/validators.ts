import { celebrate, Joi, Segments } from "celebrate";


// Регулярное выражение для телефона
const phoneRegex = /^[+]?[0-9]{1,4}[ ]?([0-9]{6,15})$/;

export const validateUserId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string()
      .custom((value, helpers) => {
                const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (emailRegex.test(value)) {
          return value;
        }
                if (phoneRegex.test(value)) {
          return value;
        }
               return helpers.error("any.invalid");
      })
      .required()
      .messages({
        "any.invalid": 'Invalid userId format (should be email or phone number)',
      }),
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
