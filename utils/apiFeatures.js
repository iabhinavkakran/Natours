class APIFeatures {
    constructor(query, queryString){
      this.query = query;
      this.queryString = queryString;
    }
  
    filter(){
      // 1) Filtering
      const queryObj = {...this.queryString};
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach(el=> delete queryObj[el]);
  
      // 2) Advance Filtering
  
      //http://localhost:3000/api/v1/tours?price[gte]=500&duration[lt]=8
  
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`);
  
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
  
    }
  
    sort(){
      // 3) sorting
  
      // http://localhost:3000/api/v1/tours?sort=-price,ratingsAverage
  
      if(this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      }else{
        this.query = this.query.sort('-createdAt');
      }
  
      return this;
    }
  
    limitFields(){
      // 4) fields limiting
  
      // http://localhost:3000/api/v1/tours?fields=name,price,duration
  
      if(this.queryString.fields) {
        const fieldsBy = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fieldsBy);
      }else{
        // selecting all except __v because of the - sign
        this.query = this.query.select('-__v');
      }
  
      return this;
    }
  
    paginate(){
      // http://localhost:3000/api/v1/tours?page=1&limit=3
  
      const page = this.queryString.page * 1 || 1 ; //Number(req.query.page)
      const limit = this.queryString.limit || 100;
      // page=3, limit=10  --> page 1-> 1-10, page 2-> 11-20, page 3-> 21-30
      // query.skip(20).limit(10);
      
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
  
    }
  
  }

  module.exports = APIFeatures;
  