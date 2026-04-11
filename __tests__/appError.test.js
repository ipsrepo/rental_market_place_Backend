const AppError = require('../utils/appError');

describe('AppError', () => {
    it('should sets message correctly', () => {
        const err = new AppError('Something went wrong', 400);
        expect(err.message).toBe('Something went wrong');
    });

    it('should sets statusCode correctly', () => {
        const err = new AppError('Not found', 404);
        expect(err.statusCode).toBe(404);
    });

    it('should status is "failed" for 4xx errors', () => {
        expect(new AppError('Bad request', 400).status).toBe('failed');
        expect(new AppError('Unauthorised', 401).status).toBe('failed');
        expect(new AppError('Not found', 404).status).toBe('failed');
    });

    it('should status is "error" for 5xx errors', () => {
        expect(new AppError('Server error', 500).status).toBe('error');
        expect(new AppError('Bad gateway', 502).status).toBe('error');
    });

    it('should isOperational is always true', () => {
        const err = new AppError('Ops error', 400);
        expect(err.isOperational).toBe(true);
    });

    it('should is an instance of Error', () => {
        const err = new AppError('test', 400);
        expect(err).toBeInstanceOf(Error);
    });

    it('should has a stack trace', () => {
        const err = new AppError('test', 400);
        expect(err.stack).toBeDefined();
    });
});
