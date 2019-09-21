"use strict";

let MESSAGE_TYPES = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
};

persianDate.toLocale('en');

Vue.component('day', {
  props: ['habit'],
  template: '',
});

let app = new Vue({
  el: "#app",
  data: {
    days: {},
    daysInMonth: [],
    habits: [],
    today: null,
    isLoading: true,
  },
  mounted: function() {
    this.today = new persianDate();
    this.loadMonthData(this.today);
    document.getElementById("app").addEventListener("scroll", function(e) {
      let datesElement = e.target.querySelector(".dates");
      if (datesElement !== null) {
        datesElement.style.right = e.target.scrollWidth - e.target.scrollLeft - e.target.offsetWidth + "px";
      }
      let habitsTitlesElement = e.target.querySelector(".habits-titles");
      if (habitsTitlesElement !== null) {
        habitsTitlesElement.style.top = e.target.scrollTop + "px";
      }
    });
  },
  computed: {
    
  },
  methods: {
    loadMonthData: function(date) {
      this.isLoading = true;
      this.daysInMonth = [];
      let firstDayOfMonth = date.startOf("month");
      let numberOfDaysInMonth = date.daysInMonth();
      for (let i = 0; i < numberOfDaysInMonth; i++) {
        let newDate = firstDayOfMonth.add("days", i);
        let date = newDate.format("YYYY/MM/DD");
        let dateInPersian = newDate.toLocale("fa").format("YYYY/MM/DD");
        let day = this.days[date] != undefined ? this.deepClone(this.days[date]) : { date: date };
        day.dateInPersian = dateInPersian;
        this.daysInMonth.push(day);
      }
      this.isLoading = false;
      /*for (let key of Object.keys(this.daysInMonth)) {
        console.log(this.daysInMonth[key]);
      }*/
    },
    deepClone: function(obj) {
      if (!obj || typeof obj !== 'object') {
        return obj;
      }
      let newObj = {};
      if (Array.isArray(obj)) {
        newObj = obj.map(item => this.deepClone(item));
      } else {
        Object.keys(obj).forEach((key) => {
          return newObj[key] = this.deepClone(obj[key]);
        })
      }
      return newObj;
    },
  },
});