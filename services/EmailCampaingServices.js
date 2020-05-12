const { RESTDataSource } = require("apollo-datasource-rest");

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
    try {
      const emails = await this.get(`members`, undefined, {
        headers: {
          Authorization: process.env.MAILCHIP_AUTH,
        },
      });
      return emails;
    } catch (error) {
      console.log(error);
    }
  }

  // an example making an HTTP POST request
  async postEmailCampaing(email) {
    try {
      const emailRes = await this.post(`members`, email, {
        headers: {
          Authorization: process.env.MAILCHIP_AUTH,
        },
      });
      return {
        status: "success",
        res: emailRes.email_address,
      };
    } catch (error) {
      return {
        status: "error",
        res: error.extensions.response.body,
      };
    }
  }

  async deleteEmailCampaing(email) {
    try {
      const emailDetete = await this.delete(`members`, email, {
        headers: {
          Authorization: process.env.MAILCHIP_AUTH,
        },
      });
      return emailDetete;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = EmailCampaingServices;
