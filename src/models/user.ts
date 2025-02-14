import mongoose, { Schema, Document, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { CallbackError } from 'mongoose';

interface IUser extends Document {
  name?: string;
  about?: string;
  avatar?: string;
  email: string;
  password: string;
  isPasswordMatch(password: string): Promise<boolean>;
}


const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: false,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: false,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 200,
  },
  avatar: {
    type: String,
    required: false,
    default: 'https://example.com/avatar.jpg',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false
  },
});


userSchema.pre('save', async function(next) {
  const user = this as IUser;


  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    return next(err as CallbackError);
  }
});


userSchema.methods.isPasswordMatch = async function(password: string) {
  const user = this as IUser;
  return bcrypt.compare(password, user.password);
};


export default model<IUser>('User', userSchema);
