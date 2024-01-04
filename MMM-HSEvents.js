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
    this.sendSocketNotification("GET_EVENTS");
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification === "EVENTS_RESULT") {
      this.events = payload;
      this.updateDom();
    }
  },
});
