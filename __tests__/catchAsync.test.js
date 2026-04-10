const catchAsync = require('../utils/catchAsync');

describe('catchAsync', () => {
  it('should calls the wrapped function with req, res, next', async () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrapped = catchAsync(handler);

    const req = { body: {} };
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it('should calls next(err) when the async function throws', async () => {
    const error = new Error('Async boom');
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = catchAsync(handler);

    const req = {};
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should does NOT call next when the async function resolves successfully', async () => {
    const handler = jest.fn().mockResolvedValue('done');
    const wrapped = catchAsync(handler);

    const next = jest.fn();
    await wrapped({}, {}, next);

    expect(next).not.toHaveBeenCalled();
  });
});
