/**
 * Reusable class to apply filtering, searching, sorting, field-limiting
 * and pagination on a Mongoose query, based on Express request query params.
 *
 * Usage:
 *   const features = new ApiFeatures(Complaint.find(), req.query)
 *     .search(['title', 'description', 'address'])
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const results = await features.query;
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query object
    this.queryString = queryString; // req.query
  }

  /**
   * Full-text / regex search across given fields using `keyword` query param.
   * @param {string[]} fields
   */
  search(fields = []) {
    if (this.queryString.keyword && fields.length) {
      const keyword = this.queryString.keyword.trim();
      const searchConditions = fields.map((field) => ({
        [field]: { $regex: keyword, $options: "i" },
      }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  /**
   * Applies filters based on query params, excluding reserved keywords.
   * Supports comparison operators like gte, gt, lte, lt via query strings
   * e.g. ?priority=High&createdAt[gte]=2024-01-01
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["keyword", "sort", "page", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sorts results. Defaults to newest first.
   * e.g. ?sort=priority,-createdAt
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  /**
   * Limits returned fields.
   * e.g. ?fields=title,status,priority
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  /**
   * Applies pagination.
   * e.g. ?page=2&limit=10
   */
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
