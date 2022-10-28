class ApiFeatures{
  constructor(query, queryObj){
    this.query = query;
    this.queryObj = queryObj
  }
  filter(){
    let queryObjCopy = { ...this.queryObj };
    const removedField = [ "page", "limit", "keyword", "sort" ];
    removedField.forEach(field => delete Object(queryObjCopy)[field]);
    queryObjCopy = JSON.parse(JSON.stringify(queryObjCopy).replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`));
    this.query = this.query.find(queryObjCopy);
    return this;
  }
  sort(){
    let sortStr;
    if(this.queryObj.sort){
      sortStr = this.queryObj.sort;
      sortStr = JSON.parse(JSON.stringify(sortStr).split(',').join(' '))
    }else{
      sortStr = 'price'
    }
    this.query = this.query.sort(sortStr)
    return this;
  }
  pagination(resPerPage){
    const currentPage = this.queryObj.page*1 || 1
    const skip = (currentPage-1)*resPerPage;
    this.query = this.query.limit(resPerPage).skip(skip)
    return this;
  }

}

module.exports = ApiFeatures;