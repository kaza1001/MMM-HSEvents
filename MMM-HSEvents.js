Module.register("MMM-HSEvents", {
    defaults: {
      updateInterval: 10 * 60 * 1000, // 10 minutes
    },
  
    start: function () {
      this.events = [];
      this.getEvents();
      var self = this;
      setInterval(function () {
        self.getEvents();
      }, this.config.updateInterval);
    },
  
    getStyles: function () {
      return ["MMM-HSEvents.css"];
    },
  
    getDom: function () {
      var wrapper = document.createElement("table");
      wrapper.className = "event-table";
      if (this.events.length == 0) {
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        cell.innerHTML = "Loading events...";
        row.appendChild(cell);
        wrapper.appendChild(row);
        return wrapper;
      }
      this.events.forEach(event => {
        var row = document.createElement("tr");
        var dateCell = document.createElement("td");
        dateCell.innerHTML = event.date;
        var titleCell = document.createElement("td");
        titleCell.innerHTML = event.title;
        var descCell = document.createElement("td");
        descCell.innerHTML = event.description;
        row.appendChild(dateCell);
        row.appendChild(titleCell);
        row.appendChild(descCell);
        wrapper.appendChild(row);
      });
      return wrapper;
    },
  
    getEvents: function () {
      var self = this;
      axios
        .get("https://www.hs-kl.de/hochschule/aktuelles/termine-events")
        .then(function (response) {
          const $ = cheerio.load(response.data);
          const events = [];
          $('.vevent').each((index, element) => {
            const dateStr = $(element).find('.dtstart').attr('datetime'); // Get the date in ISO format
            const eventDate = new Date(dateStr);
            const today = new Date();
            if (eventDate >= today) { // Only consider future or today's events
              const date = $(element).find('.dtstart').text().trim();
              const title = $(element).find('.summary a').text().trim();
              const description = $(element).find('.teaser.description').text().trim();
              events.push({ date, title, description });
            }
          });
          self.sendSocketNotification("EVENTS_RESULT", events);
        })
        .catch(function (error) {
          console.error("Error fetching events: " + error.message);
        });
    },
    
  
    socketNotificationReceived: function (notification, payload) {
      if (notification === "EVENTS_RESULT") {
        this.events = payload;
        this.updateDom();
      }
    },
  });
  