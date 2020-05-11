const { RESTDataSource } = require('apollo-datasource-rest');

class NewsAPI extends RESTDataSource {
  constructor() {
    super()
    // this.baseURL = 'https://newsapi.org/v2/everything'
    this.baseURL = process.env.APP_API

  }

  async getNewsInfo() {
    try {
      const data = await this.get(`?sources=&apiKey=${process.env.APP_API_KEY}&pageSize=10&page=1&q=recycling, hong kong`)
      return data
    } catch (error) {
      console.log(error)
    }
  }

}
module.exports = NewsAPI