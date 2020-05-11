const { RESTDataSource } = require('apollo-datasource-rest');

class EmailCampaingServices extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.MAILCHIP_URL;
  }
  // willSendRequest(request) {
  //   console.log(`request 1: ${JSON.stringify(request)}`);
  //   request.headers.set('Authorization', process.env.MAILCHIP_AUTH)
  // }

  async getEmailCampaing() {
    console.log("here")
    try {
      const emails = await this.get(`members`, undefined, {
        headers: {
          'Authorization': process.env.MAILCHIP_AUTH
        }
      });
      console.log(emails)
      return emails

    } catch (error) {
      console.log(error)
    }
  }

  // an example making an HTTP POST request
  async postEmailCampaing(email) {
    try {
      const emailSave = await this.post(`members`, email, {
        headers: {
          'Authorization': process.env.MAILCHIP_AUTH
        }
      });
      console.log("email res ", emailSave)
      return emailSave
    } catch (error) {
      console.log(error)
    }
  }

  // async deleteEmailCampaing(movie) {
  //   return this.delete(
  //     `emails/${movie.id}`, // path
  //   );
  // }
}

module.exports = EmailCampaingServices