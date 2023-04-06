// base=Product.find()

// bigQ-// search=coder&page=2&category=shortsleeves&rating[gte]=4
// &price[lte]=999&price[gte]=199&limit=5

class whereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }
  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i", //optional-search for case insensitivity
          },
        }
      : {};
    this.base = this.base.find({ ...searchword });
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };
    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];
    //convert bigQ into string =>copyQ
    let stringOfCopyQ = JSON.stringify(copyQ);
    stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)/g, (m) => `$${m}`);
    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);
    this.base = this.base.find(jsonOfCopyQ);
    return this
  }

  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }
    const skipVal = resultPerPage * (currentPage - 1);
    console.log(this.base)
    this.base = this.base.limit(resultPerPage).skip(skipVal);
    return this;
  }
}

module.exports=whereClause