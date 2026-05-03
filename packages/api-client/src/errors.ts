export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** True if the request was rejected due to a conflict (e.g. desk already booked) */
  get isConflict() {
    return this.status === 409;
  }

  /** True if the session is expired or the user is not authenticated */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** True if the user lacks permission (no company, wrong role, wrong plan) */
  get isForbidden() {
    return this.status === 403;
  }
}
