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
    daysInMonth: {},
    today: null,
    isLoading: true,
  },
  mounted: function() {
    this.today = new persianDate();
    this.loadMonthData(this.today);
  },
  computed: {
    
  },
  methods: {
    loadMonthData: function(date) {
      this.isLoading = true;
      this.daysInMonth = {};
      let firstDayOfMonth = date.startOf("month");
      let numberOfDaysInMonth = date.daysInMonth();
      for (let i = 0; i < numberOfDaysInMonth; i++) {
        let date = firstDayOfMonth.add("days", i).format("YYYY/MM/DD");
        this.daysInMonth[date] = this.days[date] != undefined ? this.deepClone(this.days[date]) : { date: date };
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