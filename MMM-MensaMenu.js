Module.register("MMM-MensaMenu", {
    defaults: {
      updateInterval: 30 * 60 * 1000,
    },
  
    start: function () {
      Log.info("Starting module: " + this.name);
      this.loaded = false;
      this.sendSocketNotification('CONFIG', this.config);
  
      var self = this;
      this.uitimer = setInterval(function () {
        self.updateFood();
      }, self.config.updateInterval);
    },
  
    updateFood: function () {
      this.sendSocketNotification('FETCH_FOOD');
    },
  
    getDom: function () {
      var wrapper = document.createElement("div");
  
      if (!this.loaded) {
        wrapper.innerHTML = this.name + " lädt Menü ...";
        wrapper.className = "dimmed light small";
        return wrapper;
      }
  
      var foodDiv = document.createElement("div");
      foodDiv.innerHTML = this.currentFood;
      wrapper.appendChild(foodDiv);
  
      return wrapper;
    },
  
    socketNotificationReceived: function (notification, payload) {
      if (notification === "NEW_FOOD") {
        this.loaded = true;
        this.currentFood = payload;
        Log.info("Neues Menü aktualisiert: " + this.currentFood);
        this.updateDom();
      } else if (notification === "SERVICE_FAILURE") {
        this.loaded = false;
        this.currentFood = "Fehler beim Abrufen der Daten. Bitte versuche es später erneut.";
        Log.info("Servicefehler: " + payload.StatusCode + ':' + payload.Message);
        this.updateDom();
      }
    }
  });
  