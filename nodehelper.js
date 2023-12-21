const NodeHelper = require("nodehelper");
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = NodeHelper.create({
  start: function () {
    console.log('Starting helper: ' + this.name);
    this.started = false;
  },

  scheduleUpdate: function () {
    var self = this;
    this.updatetimer = setInterval(function () {
      self.getFood();
    }, self.config.updateInterval);
  },

  getFood: function () {
    var self = this;
    console.log((new Date(Date.now())).toLocaleTimeString() + ': Getting food for module ' + this.name);
    axios.get('https://www.mensaplan.de/zweibruecken/mensa-zweibruecken/index.html')
        .then((response) => {
            const $ = cheerio.load(response.data);
            const rows = $('.aw-weekly-menu.aw-group-5 p');

            const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
            const foodTable = "<table><tr><th>Tag</th><th>Gericht 1</th><th>Gericht 2</th></tr>";

            for (let i = 1; i <= 5; i++) {
                const food1 = rows.eq(i * 2 + 5).text().trim();
                const food2 = rows.eq(i * 2 + 10).text().trim();
                foodTable += `<tr><td>${days[i]}</td><td>${food1}</td><td>${food2}</td></tr>`;
            }

            foodTable += "</table>";
            self.sendSocketNotification('NEW_FOOD', foodTable);
        })
        .catch((error) => {
            console.error(`Fehler beim Abrufen der Daten: ${error.message}`);
            self.sendSocketNotification('SERVICE_FAILURE', { StatusCode: 600, Message: error.message });
        });
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'CONFIG' && !this.started) {
      this.config = payload;
      this.started = true;
      this.scheduleUpdate();
      this.getFood();
    } else if (notification === 'FETCH_FOOD') {
      this.getFood();
    }
  }
});
