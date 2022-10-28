/** @format */
const uuid = require("uuid");
const axios = require("axios");

const momo = {
  SUB_KEY: "",
  API_USER: "",
  API_KEY: "",
  HOST: "",
  ENVIRONMENT: "sandbox",
  access_token: "",

  initilise: function (options) {
    this.SUB_KEY = options.SUB_KEY;
    this.API_USER = options.API_USER;
    this.API_KEY = options.API_KEY;
    this.HOST = options.HOST;
  },
  // put a uuid code as your userid , in other for mtn to identify you.
  createUser: function (userId) {
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: `https://${this.HOST}/v1_0/apiuser`,
        data: { providerCallbackHost: "clinic.com" },
        headers: {
          "X-Reference-Id": `${userId}`,
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": `${this.SUB_KEY}`,
        },
      })
        .then((respond) => {
          const data = {
            status: respond.status,
            statusText: respond.statusText,
          };
          resolve(data);
        })
        .catch((err) => {
          if (err.response) {
            //server responds with error message
            reject(err.response.data);
          } else if (err.request) {
            //would not communicate with server
            reject("check internet and try again");
          } else {
            reject(err);
          }
        });
    });
  },
  generateApiKey: function (apiUser) {
    return new Promise((resolve, reject) => {
      axios({
        method: "POST",
        url: `https://${this.HOST}/v1_0/apiuser/${apiUser}/apikey`,
        data: { providerCallbackHost: "clinic.com" },
        headers: {
          "Ocp-Apim-Subscription-Key": `${this.SUB_KEY}`,
        },
      })
        .then((responds) => {
          this.API_KEY = responds.apiKey;
          resolve(responds.data);
        })
        .catch((err) => {
          if (err.response) {
            reject(err.response.data);
          } else if (err.request) {
            reject("Bad internet, connection . try again");
          } else {
            reject(err);
          }
        });
    });
  },
  createAccessToken: function () {
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: `https://${this.HOST}/collection/token/`,
        data: { providerCallbackHost: "clinic.com" },
        headers: {
          "Ocp-Apim-Subscription-Key": `${this.SUB_KEY}`,
          Authorization: `${this.genAuthString(this.API_USER, this.API_KEY)}`,
        },
      })
        .then((response) => {
          this.access_token = response.data.access_token;
          resolve({ success: true, message: "access token created" });
        })
        .catch((err) => {
          if (err.response) {
            reject(err.response.data);
          } else if (err.request) {
            reject("Bad internet connection, try again");
          } else {
            reject(err);
          }
        });
    });
  },
  genAuthString: function () {
    const string = `${this.API_USER}:${this.API_KEY}`;
    const encoded = btoa(string);
    return `Basic ${encoded}`;
  },
  requestTopay: async function (paymentData) {
    const transactionId = paymentData.externalId;

    await this.createAccessToken();

    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: `https://${this.HOST}/collection/v1_0/requesttopay`,
        data: paymentData,
        headers: {
          "X-Reference-Id": `${transactionId}`,
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": `${this.SUB_KEY}`,
          Authorization: `Bearer ${this.access_token}`,
          "X-Target-Environment": this.ENVIRONMENT,
        },
      })
        .then((response) => {
          const data = {
            transactionId,
            status: response.status,
            statusText: response.statusText,
          };
          resolve(data);
        })
        .catch((err) => {
          if (err.response) {
            reject(err.response.data);
          } else if (err.request) {
            reject("Bad internet connection, try again");
          } else {
            reject(err);
          }
        });
    });
  },
  getTractionStatus: async function (transactionId) {
    await this.createAccessToken();

    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: `https://${this.HOST}/collection/v1_0/requesttopay/${transactionId}`,
        headers: {
          "Ocp-Apim-Subscription-Key": `${this.SUB_KEY}`,
          Authorization: `Bearer ${this.access_token}`,
          "X-Target-Environment": this.ENVIRONMENT,
        },
      })
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          if (err.response) {
            reject(err.response.data);
          } else if (err.request) {
            reject("bad internet connection , try again");
          } else {
            reject(err);
          }
        });
    });
  },
};

module.exports = momo;
