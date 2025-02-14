export class BadRequestError extends Error {
  statusCode: number;

  constructor(message = "Некорректный запрос") {
    super(message);
    this.statusCode = 400;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
