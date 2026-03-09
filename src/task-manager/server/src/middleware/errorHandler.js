const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma errors
  if (err.code === "P2002") {
    // P2002 = unique constraint violation
    return res.status(400).json({
      error: "Unique constraint violation",
      message: "Record already exists",
    });
  }
  //P2025 = запись не найдена
  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Record not found",
      message: "Resource not found",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "Authentication failed",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "Authentication failed",
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      message: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
