module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      ctx.app.emit('error', err, ctx);

      const status = err.status || 500;
      const error = {
        message: status === 500 ? 'Internal Server Error' : err.message,
      };

      if (status === 422) {
        error.details = err.errors;
      }

      ctx.body = ctx.helper.error(error.message, status);
      ctx.status = status;
    }
  };
};