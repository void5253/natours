class ApiFeatures {
  constructor(query, reqquery) {
    this.query = query;
    this.reqquery = reqquery;
  }
  filter() {
    let queryObj = { ...this.reqquery };
    const queryParamsToExclude = ["page", "sort", "limit", "fields"];
    queryParamsToExclude.forEach((param) => delete queryObj[param]);

    let queryObjStr = JSON.stringify(queryObj);
    queryObjStr = queryObjStr.replaceAll(
      /\blt|lte|gt|gte|in\b/g,
      (word) => `$${word}`
    );
    queryObj = JSON.parse(queryObjStr);

    if (queryObj.difficulty?.["$in"]) {
      queryObj.difficulty["$in"] = queryObj.difficulty["$in"].split(",");
    }
    this.query.find(queryObj);
    return this;
  }
  sort() {
    let sortOptions = this.reqquery.sort || "-ratingsAverage,price";
    sortOptions = sortOptions.replaceAll(",", " ");
    this.query.sort(sortOptions);
    return this;
  }
  paginate() {
    const toursPerPage = this.reqquery.limit * 1 || 3;
    const page = this.reqquery.page * 1 || 1;
    const skip = (page - 1) * toursPerPage;
    this.query.skip(skip).limit(toursPerPage);
    return this;
  }
  fields() {
    if (this.reqquery.fields) {
      const fields = this.reqquery.fields.split(",").join(" ");
      this.query.select(fields);
    }
    this.query.select("-__v -createdAt");
    return this;
  }
}

export { ApiFeatures };
