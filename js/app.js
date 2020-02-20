"use strict";

Element.prototype.documentOffsetTop = function () {
  return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
};

persianDate.toLocale('en');

let MESSAGE_TYPES = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
};
 
let HABIT_TYPES = {
  NUMBER: { value: "number", title: "عددی", inputType: "number" },
  TEXT: { value: "text", title: "متنی", inputType: "text" },
  BINARY: { value: "checkbox", title: "دودویی", inputType: "checkbox" },
};

Vue.component("day-title", {
  props: {
    day: Object,
    today: persianDate,
  },
  template: `
  <div class="date" :class="{ 'date-selected': day.date == today.format('YYYY/MM/DD') }">
    {{ day.dateInPersian }}
  </div>`,
});

Vue.component("habit-title", {
  props: {
    habit: Object,
    sum: Number,
  },
  template: `<div class="habit-title">{{ habit.title }}<br>{{ sum }}</div>`,
});

Vue.component("loading", {
  props: {
    isLoading: Boolean,
    isPartial: Boolean,
  },
  template: `
  <div class="top-0 bottom-0 left-0 right-0 items-center justify-center z-30 bg-white"
    :class="{ hidden: !isLoading, flex: isLoading, absolute: isPartial, fixed: !isPartial }">
    <div class="loader"></div>
  </div>`,
});

Vue.component("base-checkbox", {
  model: {
    prop: "checked",
    event: "change",
  },
  props: {
    checked: [ String, Boolean ], // empty strings are valid too (which must be seen as false)
  },
  template: `
    <div class="border-b-2 p-3">
      <input type="checkbox" class="border-gray-300 bg-transparent"
        :checked="checked" @change="$emit('change', $event.target.checked)" />
    </div>
    `
});

Vue.component("base-number-input", {
  props: {
    value: [ Number, String ],
  },
  template: `
    <input type="number" class="border-gray-300 bg-transparent"
      :value="value" @change="$emit('input', $event.target.value)" />  
    `
});

Vue.component("day-habit", {
  props: {
    value: [ Number, String, Boolean ],
    habit: Object,
  },
  data: function() {
    return {
      inputValue: this.value,
    };
  },
  watch: {
    inputValue: function(val) {
      this.$emit("input", val);
      this.$emit("save-day"); // this way, we don't need to watch the whole days array for changes
    },
  },
  template: `
  <div class="inline-block w-24">
    <base-checkbox v-if="habit.inputType == 'checkbox'" v-model="inputValue"></base-checkbox>
    <base-number-input v-else-if="habit.inputType == 'number'" v-model="inputValue"></base-number-input>
    <input v-else :type="habit.inputType" :value="value" v-on:input="$emit('input', $event.target.value)"
      class="border-gray-300 bg-transparent" v-on:change="$emit('save-day')">
  </div>`,
});

let app = new Vue({
  el: "#app",
  data: {
    days: {},
    daysInMonth: [],
    habits: [],
    today: null,
    isLoading: true,
    newHabit: {
      title: "",
      inputType: HABIT_TYPES.NUMBER.inputType,
      targetValue: "",
      targetMonthValue: "",
      targetMonthCount: "",
    },
    currentDate: null,
    habitTypes: HABIT_TYPES,
    maxHabitId: 1,
    isNewColumnModalVisible: false,
  },
  mounted: function() {
    //this.habitTypes = this.deepClone(HABIT_TYPES);
    this.today = new persianDate();
    this.currentDate = this.today;
    this.loadHabits();
    this.loadMonthData(this.currentDate);
    this.maxHabitId = window.localStorage.getItem("maxHabitId") || 1;
    Vue.nextTick(function() {    
      var appElement = document.getElementById("app");
      var selectedDateElement = document.querySelector(".date-selected");
      if (selectedDateElement != null) {
        appElement.scrollTo(0, selectedDateElement.documentOffsetTop() - (window.innerHeight / 2));
      }
    });
  },
  watch: {
    /*daysInMonth: {
      handler: function(val, oldVal) {
        for (let key of Object.keys(val)) {
          window.localStorage.setItem(val[key].date, JSON.stringify(val[key]));
        }
        console.log("changed");
      },
      deep: true,
    },*/
  },
  computed: {
    habitsSumOfValues: function() {
      console.log(this.habits.length);
      let result = Array(this.habits.length).fill(0);
      console.log(result);
      for (let i = 0; i < this.daysInMonth.length; i++) {
        for (let j = 0; j < this.habits.length; j++) {
          console.log(this.daysInMonth[i]["habit" + this.habits[j].id]);
          result[j] += Number(this.daysInMonth[i]["habit" + this.habits[j].id]);
        }
      }
      console.log(result);
      return result;
    },
  },
  methods: {
    saveDay: function(date) {
      for (let i = 0; i < this.daysInMonth.length; i++) {
        if (this.daysInMonth[i].date == date) {
          //console.log(JSON.stringify(this.daysInMonth[i].date));
          window.localStorage.setItem(date, JSON.stringify(this.daysInMonth[i]));
        }
      }
    },
    scroll: function(e) {
      let datesElement = e.target.querySelector(".dates");
      if (datesElement !== null) {
        datesElement.style.right = e.target.scrollWidth - e.target.scrollLeft - e.target.offsetWidth + "px";
      }
      let habitsTitlesElement = e.target.querySelector(".habits-titles");
      if (habitsTitlesElement !== null) {
        habitsTitlesElement.style.top = e.target.scrollTop + "px";
      }
    },
    loadHabits: function() {
      this.habits = JSON.parse(window.localStorage.getItem("habits"));
      if (this.habits === null) {
        this.habits = [];
      }
    },
    saveHabits: function() {
      window.localStorage.setItem("habits", JSON.stringify(this.habits));
      window.localStorage.setItem("maxHabitId", this.maxHabitId);
    },
    loadMonthData: function(date) {
      this.isLoading = true;
      this.daysInMonth = [];
      let firstDayOfMonth = date.startOf("month");
      let numberOfDaysInMonth = date.daysInMonth();
      for (let i = 0; i < numberOfDaysInMonth; i++) {
        let newDate = firstDayOfMonth.add("days", i);
        let date = newDate.format("YYYY/MM/DD");
        let dateInPersian = newDate.toLocale("fa").format("YYYY/MM/DD");
        let day = {};
        for (let j = 0; j < this.habits.length; j++) {
          day["habit" + this.habits[j].id] = "";
        }
        let savedDate = JSON.parse(window.localStorage.getItem(date));
        day = Object.assign(day, savedDate !== null ? this.deepClone(savedDate) : { date: date });
        day.dateInPersian = dateInPersian;
        this.daysInMonth.push(day);
      }
      this.isLoading = false;
      /*for (let key of Object.keys(this.daysInMonth)) {
        console.log(this.daysInMonth[key]);
      }*/
    },
    addNewHabit: function() {
      this.newHabit.id = this.maxHabitId++;
      if (this.newHabit.title != "" && this.newHabit.inputType != "") {
        this.habits.push(this.deepClone(this.newHabit));
      }
      for (let i = 0; i < this.daysInMonth.length; i++) {
        Vue.set(app.daysInMonth[i], "habit" + this.newHabit.id, "");
      }
      this.newHabit = { title: "", inputType: HABIT_TYPES.NUMBER.value, targetValue: "", targetMonthValue: "", targetMonthCount: "" };
      this.saveHabits();
    },
    showPreviousMonth: function() {
      this.currentDate = this.currentDate.add("month", -1);
      this.loadMonthData(this.currentDate);
    },
    showNextMonth: function() {
      this.currentDate = this.currentDate.add("month", 1);
      this.loadMonthData(this.currentDate);
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