export function success(res, data, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export function error(res, message = "Internal server error", statusCode = 500, errors = []) {
  return res.status(statusCode).json({ success: false, message, errors });
}
