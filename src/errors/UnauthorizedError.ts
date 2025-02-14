export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message = "Необходима авторизация") {
    super(message);
    this.statusCode = 401;
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
