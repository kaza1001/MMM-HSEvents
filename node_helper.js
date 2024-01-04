const NodeHelper = require("node_helper");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting node helper for MMM-HSEvents");
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_EVENTS") {
      this.getEvents();
    }
  },
  getEvents: function () {
    var self = this;
    axios
      .get("https://www.hs-kl.de/hochschule/aktuelles/termine-events")
      .then(function (response) {
        const $ = cheerio.load(response.data);
        const events = [];
        $('.vevent').each((index, element) => {
          const date = $(element).find('.dtstart').text().trim();
          const title = $(element).find('.summary a').text().trim();
          const description = $(element).find('.teaser.description').text().trim();
          events.push({ date, title, description });
        });
        self.sendSocketNotification("EVENTS_RESULT", events);
      })
      .catch(function (error) {
        console.error("Error fetching events: " + error.message);
      });
  },
});
