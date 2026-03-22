class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // PARSE THE QUERY
    const queryObj = { ...this.queryString };
    console.log(this.queryString);

    // FILTER THE SPECIAL OPERATION QUERIES
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERS
    let mongoQuery = JSON.stringify(queryObj);
    mongoQuery = mongoQuery.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    // QUERY
    this.query = this.query.find(JSON.parse(mongoQuery));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); // Use Mongoose sort before awaiting
    } else {
      this.query = this.query.sort('-createdAt name');
    }

    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const limitedFields = this.queryString.fields.split(',').join(' ');
      console.log(limitedFields);
      this.query = this.query.select(limitedFields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipCount = (page - 1) * limit;

    this.query = this.query.skip(skipCount).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
