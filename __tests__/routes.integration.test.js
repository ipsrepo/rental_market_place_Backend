const mongoose = require('mongoose');

jest.mock('../services/mail.service', () => ({
    sendEnquiryEmail: jest.fn().mockResolvedValue(),
}));
jest.mock('../models/userModel');
jest.mock('../models/propertyModel');
jest.mock('../models/favoriteModel');
jest.mock('../utils/cloudinary', () => ({
    upload: {
        array: () => (req, res, next) => {
            req.files = [];
            next();
        },
    },
}));
jest.mock('jsonwebtoken');
jest.mock('util', () => ({
    ...jest.requireActual('util'),
    promisify: (fn) => fn,
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/userModel');
const Property = require('../models/propertyModel');
const Favorite = require('../models/favoriteModel');
const {sendEnquiryEmail} = require('../services/mail.service');

const FAKE_USER_ID = '64a000000000000000000001';
const FAKE_TOKEN = 'Bearer test-jwt-token';

const fakeUser = {
    _id: FAKE_USER_ID,
    name: 'Alice',
    email: 'alice@test.com',
    mobile: '0871234567',
    validatePassword: jest.fn().mockResolvedValue(true),
};

const fakeProperty = {
    _id: '64a000000000000000000002',
    title: 'Nice Flat in Dublin',
    location: 'Dublin',
    price: 1500,
    propertytype: 'apartment',
    owner: {_id: FAKE_USER_ID, name: 'Alice', email: 'alice@test.com'},
};

// Build a proper awaitable Mongoose query chain
function buildChain(docs) {
    const chain = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
    };
    const p = Promise.resolve(docs);
    chain.then = p.then.bind(p);
    chain.catch = p.catch.bind(p);
    return chain;
}

beforeEach(() => {
    jest.clearAllMocks();
    jwt.verify = jest.fn().mockResolvedValue({id: FAKE_USER_ID});
    jwt.sign = jest.fn().mockReturnValue('test-token');
    User.findById = jest.fn().mockResolvedValue(fakeUser);
});

describe('GET /', () => {
    it('should returns 200 with "Server running"', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Server running');
    });
});

describe('Unmatched routes', () => {
    it('should returns 404 for unknown paths', async () => {
        const res = await request(app).get('/api/v1/nonexistent');
        expect(res.status).toBe(404);
    });
});

describe('POST /api/v1/users/signup', () => {
    it('should returns error when User.create throws', async () => {
        User.create = jest.fn().mockRejectedValue(new Error('Duplicate'));
        const res = await request(app)
            .post('/api/v1/users/signup')
            .send({name: 'Alice', email: 'alice@test.com', mobile: '087', password: 'p', passwordConfirm: 'p'});
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});

describe('POST /api/v1/users/login', () => {
    it('should returns 400 when email or password is missing', async () => {
        const res = await request(app).post('/api/v1/users/login').send({email: 'alice@test.com'});
        expect(res.status).toBe(400);
    });

    it('should returns 401 when credentials are wrong', async () => {
        User.findOne = jest.fn().mockReturnValue({select: jest.fn().mockResolvedValue(null)});
        const res = await request(app).post('/api/v1/users/login').send({email: 'x@x.com', password: 'wrong'});
        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/users', () => {
    it('should returns 200 with user list', async () => {
        User.find = jest.fn().mockReturnValue(buildChain([fakeUser]));
        const res = await request(app).get('/api/v1/users');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
    });
});

describe('GET /api/v1/users/:id', () => {
    it('should returns 201 with user when found', async () => {
        User.findById = jest.fn().mockReturnValue(buildChain(fakeUser));
        const res = await request(app).get(`/api/v1/users/${FAKE_USER_ID}`);
        expect(res.status).toBe(201);
        expect(res.body.data.doc).toBeDefined();
    });

    it('should returns 404 when user is not found', async () => {
        User.findById = jest.fn().mockReturnValue(buildChain(null));
        const res = await request(app).get(`/api/v1/users/${FAKE_USER_ID}`);
        expect(res.status).toBe(404);
    });
});

// ─── Property Routes ──────────────────────────────────────────────────────────

describe('GET /api/v1/property', () => {
    it('should returns 200 with property list', async () => {
        Property.find = jest.fn().mockReturnValue(buildChain([fakeProperty]));
        const res = await request(app).get('/api/v1/property');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

describe('GET /api/v1/property/:id', () => {
    it('should returns 201 with the property when found', async () => {
        Property.findById = jest.fn().mockReturnValue(buildChain(fakeProperty));
        const res = await request(app).get(`/api/v1/property/${fakeProperty._id}`);
        expect(res.status).toBe(201);
    });

    it('should returns 404 when property does not exist', async () => {
        Property.findById = jest.fn().mockReturnValue(buildChain(null));
        const res = await request(app).get(`/api/v1/property/${fakeProperty._id}`);
        expect(res.status).toBe(404);
    });
});

describe('POST /api/v1/property (protected)', () => {
    it('should returns 401 when no token is provided', async () => {
        const res = await request(app).post('/api/v1/property').send({});
        expect(res.status).toBe(401);
    });

    it('should returns 201 when authenticated and property is created', async () => {
        Property.create = jest.fn().mockResolvedValue(fakeProperty);
        const res = await request(app)
            .post('/api/v1/property')
            .set('Authorization', FAKE_TOKEN)
            .send({title: 'Nice Flat', price: 1500});
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
    });
});

describe('DELETE /api/v1/property/:id (protected)', () => {
    it('should returns 401 when no token is provided', async () => {
        const res = await request(app).delete(`/api/v1/property/${fakeProperty._id}`);
        expect(res.status).toBe(401);
    });

    it('should returns 200 when authenticated and property is deleted', async () => {
        Property.findByIdAndDelete = jest.fn().mockResolvedValue(fakeProperty);
        const res = await request(app)
            .delete(`/api/v1/property/${fakeProperty._id}`)
            .set('Authorization', FAKE_TOKEN);
        expect(res.status).toBe(200);
    });
});

describe('GET /api/v1/property/owner/:ownerId', () => {
    it('should returns 200 with properties for the owner', async () => {
        Property.find = jest.fn().mockReturnValue(buildChain([fakeProperty]));
        const res = await request(app).get(`/api/v1/property/owner/${FAKE_USER_ID}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
    });
});

// ─── Favorite Routes ──────────────────────────────────────────────────────────

describe('Favorites — all routes require authentication', () => {
    it('should GET /api/v1/favorites returns 401 without token', async () => {
        expect((await request(app).get('/api/v1/favorites')).status).toBe(401);
    });
    it('should POST /api/v1/favorites returns 401 without token', async () => {
        expect((await request(app).post('/api/v1/favorites').send({})).status).toBe(401);
    });
    it('should DELETE /api/v1/favorites returns 401 without token', async () => {
        expect((await request(app).delete('/api/v1/favorites').send({})).status).toBe(401);
    });
});

describe('GET /api/v1/favorites (authenticated)', () => {
    it('should returns 200 with user favorites', async () => {
        Favorite.find = jest.fn().mockReturnValue({populate: jest.fn().mockResolvedValue([{_id: 'fav1'}])});
        const res = await request(app).get('/api/v1/favorites?user=user99').set('Authorization', FAKE_TOKEN);
        expect(res.status).toBe(200);
        expect(res.body.results).toBe(1);
    });
});

describe('POST /api/v1/favorites (authenticated)', () => {
    it('should creates a favorite and returns 201', async () => {
        Favorite.create = jest.fn().mockResolvedValue({_id: 'fav2', user: FAKE_USER_ID, property: fakeProperty._id});
        const res = await request(app)
            .post('/api/v1/favorites')
            .set('Authorization', FAKE_TOKEN)
            .send({user: FAKE_USER_ID, property: fakeProperty._id});
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
    });
});

describe('DELETE /api/v1/favorites (authenticated)', () => {
    it('should deletes a favorite and returns 200', async () => {
        Favorite.findOneAndDelete = jest.fn().mockResolvedValue({_id: 'fav1'});
        const res = await request(app)
            .delete('/api/v1/favorites')
            .set('Authorization', FAKE_TOKEN)
            .send({user: FAKE_USER_ID, property: fakeProperty._id});
        expect(res.status).toBe(200);
    });

    it('should returns 404 when favorite does not exist', async () => {
        Favorite.findOneAndDelete = jest.fn().mockResolvedValue(null);
        const res = await request(app)
            .delete('/api/v1/favorites')
            .set('Authorization', FAKE_TOKEN)
            .send({user: FAKE_USER_ID, property: fakeProperty._id});
        expect(res.status).toBe(404);
    });
});

// ─── Mail Routes ──────────────────────────────────────────────────────────────

describe('POST /api/v1/mail/:propertyId (protected)', () => {
    it('should returns 401 without token', async () => {
        expect((await request(app).post('/api/v1/mail/prop1').send({})).status).toBe(401);
    });

    it('should returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/v1/mail/prop1')
            .set('Authorization', FAKE_TOKEN)
            .send({name: 'Bob'});
        expect(res.status).toBe(400);
    });

    it('should returns 404 when property is not found', async () => {
        Property.findById = jest.fn().mockReturnValue({populate: jest.fn().mockResolvedValue(null)});
        const res = await request(app)
            .post('/api/v1/mail/nonexistent')
            .set('Authorization', FAKE_TOKEN)
            .send({name: 'Bob', email: 'b@b.com', mobile: '087'});
        expect(res.status).toBe(404);
    });

    it('should returns 200 when mail is sent successfully', async () => {
        Property.findById = jest.fn().mockReturnValue({populate: jest.fn().mockResolvedValue(fakeProperty)});
        const res = await request(app)
            .post(`/api/v1/mail/${fakeProperty._id}`)
            .set('Authorization', FAKE_TOKEN)
            .send({name: 'Bob', email: 'b@b.com', mobile: '0871234567', details: 'Still available?'});
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(sendEnquiryEmail).toHaveBeenCalled();
    });
});