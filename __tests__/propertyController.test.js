jest.mock('../models/propertyModel', () => ({}));
jest.mock('../utils/cloudinary', () => ({ upload: { array: jest.fn() } }));
jest.mock('../controllers/handlerFactory', () => ({
  getAll:    jest.fn(() => jest.fn()),
  getOne:    jest.fn(() => jest.fn()),
  createOne: jest.fn(() => jest.fn()),
  updateOne: jest.fn(() => jest.fn()),
  deleteOne: jest.fn(() => jest.fn()),
}));

const { processImages, setOwnerFilter } = require('../controllers/propertyController');

function buildReq(body = {}, files = []) {
  return { body: { ...body }, files };
}

const res = {};
const next = jest.fn();

beforeEach(() => next.mockClear());

describe('processImages — boolean field coercion', () => {
  const boolFields = ['isprivatebathroom', 'issharedbed', 'billsincluded', 'furnished', 'isnew', 'available'];

  boolFields.forEach((field) => {
    test(`converts req.body.${field} = "true" → true`, () => {
      const req = buildReq({ [field]: 'true' });
      processImages(req, res, next);
      expect(req.body[field]).toBe(true);
    });

    test(`converts req.body.${field} = "false" → false`, () => {
      const req = buildReq({ [field]: 'false' });
      processImages(req, res, next);
      expect(req.body[field]).toBe(false);
    });
  });

  it('should leaves boolean fields untouched when absent', () => {
    const req = buildReq({});
    processImages(req, res, next);
    expect(req.body.furnished).toBeUndefined();
  });
});

describe('processImages — numeric field coercion', () => {
  it('should converts price string to Number', () => {
    const req = buildReq({ price: '1500' });
    processImages(req, res, next);
    expect(req.body.price).toBe(1500);
    expect(typeof req.body.price).toBe('number');
  });

  it('should converts bedrooms string to Number', () => {
    const req = buildReq({ bedrooms: '3' });
    processImages(req, res, next);
    expect(req.body.bedrooms).toBe(3);
  });

  it('should converts bathrooms string to Number', () => {
    const req = buildReq({ bathrooms: '2' });
    processImages(req, res, next);
    expect(req.body.bathrooms).toBe(2);
  });
});

describe('processImages — image handling', () => {
  it('should uses existingPrimary as primaryimage when provided', () => {
    const req = buildReq({ existingPrimary: 'http://old/img.jpg' }, []);
    processImages(req, res, next);
    expect(req.body.primaryimage).toBe('http://old/img.jpg');
  });

  it('should uses first new upload as primaryimage when no existingPrimary', () => {
    const req = buildReq({}, [{ path: 'http://new/1.jpg' }, { path: 'http://new/2.jpg' }]);
    processImages(req, res, next);
    expect(req.body.primaryimage).toBe('http://new/1.jpg');
    expect(req.body.images).toEqual(['http://new/2.jpg']);
  });

  it('should merges existingImages with new uploaded files', () => {
    const req = buildReq(
      { existingImages: ['http://old/a.jpg'], existingPrimary: 'http://old/primary.jpg' },
      [{ path: 'http://new/b.jpg' }],
    );
    processImages(req, res, next);
    expect(req.body.images).toEqual(['http://old/a.jpg', 'http://new/b.jpg']);
  });

  it('should accepts existingImages as a single string (not array)', () => {
    const req = buildReq(
      { existingImages: 'http://old/single.jpg', existingPrimary: 'http://old/primary.jpg' },
      [],
    );
    processImages(req, res, next);
    expect(req.body.images).toEqual(['http://old/single.jpg']);
  });

  it('should removes existingPrimary and existingImages from req.body', () => {
    const req = buildReq({ existingPrimary: 'http://p.jpg', existingImages: [] }, []);
    processImages(req, res, next);
    expect(req.body.existingPrimary).toBeUndefined();
    expect(req.body.existingImages).toBeUndefined();
  });

  it('should calls next() after processing', () => {
    const req = buildReq({}, []);
    processImages(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('setOwnerFilter', () => {
  it('should copies ownerId from params to query.owner', () => {
    const req = { params: { ownerId: 'abc123' }, query: {} };
    setOwnerFilter(req, res, next);
    expect(req.query.owner).toBe('abc123');
    expect(next).toHaveBeenCalled();
  });

  it('should does not set query.owner when ownerId is absent', () => {
    const req = { params: {}, query: {} };
    setOwnerFilter(req, res, next);
    expect(req.query.owner).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
