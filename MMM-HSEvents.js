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
      var wrapper = document.createElement("div");
      if (this.events.length == 0) {
        wrapper.innerHTML = "Loading events...";
        wrapper.className = "dimmed light small";
        return wrapper;
      }
      // Display the events in the wrapper
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
  