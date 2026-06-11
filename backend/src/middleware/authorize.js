const HttpError = require("../utils/httpError");

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new HttpError(
          401,
          "Authentication required."
        )
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new HttpError(
          403,
          "You are not authorized to perform this action."
        )
      );
    }

    next();
  };
}

module.exports = authorize;