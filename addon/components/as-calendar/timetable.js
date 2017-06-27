import moment from "moment";
import Ember from "ember";
import computedDuration from "ember-calendar/macros/computed-duration";

export default Ember.Component.extend({
  classNameBindings: [":as-calendar-timetable", "model.isMonthView:as-calendar-timetable--month", "model.isWeekView:as-calendar-timetable--week", "model.isDayView:as-calendar-timetable--day"],
  tagName: "section",

  days: Ember.computed.oneWay("model.days"),
  model: null,
  timeSlotHeight: null,
  timeSlots: Ember.computed.oneWay("model.timeSlots"),
  contentComponent: null,
  dayWidth: Ember.computed.oneWay("contentComponent.dayWidth"),
  referenceElement: Ember.computed.oneWay("contentComponent.element"),

  isTimerOn: false,
  timeInterval: null,

  startOfWeek: moment().startOf("isoWeek").day(),

  _dayStartingTime: Ember.computed("model.showAllHours", "model.dayStartingTime", function () {
    return this.get("model.showAllHours") ? moment.duration(0) : this.get("model.dayStartingTime");
  }),
  _dayEndingTime: Ember.computed("model.showAllHours", "model.dayEndingTime", function () {
    return this.get("model.showAllHours") ? moment.duration(1, "day") : this.get("model.dayEndingTime");
  }),
  now: moment(),
  currentDayNumber: Ember.computed("now", function () {
    const nowDayNumber = this.get("now").day();
    const startOfWeek = this.get("startOfWeek");

    return nowDayNumber === 0 ? startOfWeek : nowDayNumber - startOfWeek;
  }),
  nowTime: Ember.computed("now", function () {
    return this.get("now").format(this.get("nowTimeLabelFormat"));
  }),
  computedNowTime: computedDuration("nowTime"),
  timeFromStartOfTheDay: Ember.computed("computedNowTime", "_dayStartingTime", function () {
    return this.get("computedNowTime").asMilliseconds() - this.get("_dayStartingTime").asMilliseconds();
  }),
  dayDuration: Ember.computed("_dayStartingTime", "_dayEndingTime", function () {
    return this.get("_dayEndingTime").asMilliseconds() - this.get("_dayStartingTime").asMilliseconds();
  }),

  hourMarkerStyle: Ember.computed("timeFromStartOfTheDay", "dayDuration", function () {
    const timeFromStartOfTheDay = this.get("timeFromStartOfTheDay");
    const dayDuration = this.get("dayDuration");

    let topPercentage = 0;
    let visibility = "visible";

    if (timeFromStartOfTheDay && dayDuration) {
      topPercentage = (timeFromStartOfTheDay / dayDuration) * 100;
    } else {
      visibility = "hidden";
    }

    return Ember.String.htmlSafe(`top: ${topPercentage}%; visibility: ${visibility}`);
  }),

  labeledTimeSlots: Ember.computed("timeSlots.[]", "now", function () {
    const now = this.get("now");
    const startOfDay = moment().startOf("day");

    return this.get("timeSlots")
      .filter(function (timeSlot/*, index*/) {
        return (timeSlot.get("time").valueOf() / 1000 / 60) % 60 === 0;
      })
      .map((timeSlot) => {
        const value = startOfDay.clone().add(timeSlot.get("time").valueOf(), "milliseconds");
        const diff = now.diff(value);
        const ONE_HOUR = 60 * 60 * 1000;

        return {
          label: value.format(this.get("timeSlotLabelFormat")),
          isHidden: diff > 0 && diff < ONE_HOUR // hide label if its close to the now time marker
        };
      });
  }),

  timeSlotLabelListStyle: Ember.computed("timeSlotHeight", "labeledRatio", function () {
    var timeSlotHeight = this.get("timeSlotHeight");
    var labeledRatio = this.get("labeledRatio");
    return Ember.String.htmlSafe(`margin-top: -1em; line-height: ${timeSlotHeight * labeledRatio}px;`);
  }),

  labeledRatio: Ember.computed("timeSlots.length", "labeledTimeSlots.length", function () {
    return this.get("timeSlots.length") / this.get("labeledTimeSlots.length");
  }),

  timeSlotLabelStyle: Ember.computed("timeSlotHeight", "labeledRatio", function () {
    return Ember.String.htmlSafe(`height: ${this.get("labeledRatio") * this.get("timeSlotHeight")}px;`);
  }),
  init() {
    this._super(...arguments);

    const that = this;
    const timer = () => {
      if (!that.get("isTimerOn")) {
        return false;
      }

      that._timerId = Ember.run.later(function () {
        that.set("now", moment());
        timer();
      }, 60 * 1000);
    };

    this.set("isTimerOn", true);
    timer();
  },
  willDestroyElement() {
    this._super(...arguments);
    this.set("isTimerOn", false);
    if (this._timerId) {
      Ember.run.cancel(this._timerId);
    }
  },

  actions: {
    goTo: function (day) {
      if (this.attrs["onNavigateToDay"]) {
        this.attrs["onNavigateToDay"](day);
      }
    }
  }
});
