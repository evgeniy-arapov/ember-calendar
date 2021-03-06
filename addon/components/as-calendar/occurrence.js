import Ember from "ember";
import computedDuration from "ember-calendar/macros/computed-duration";

export default Ember.Component.extend({
  attributeBindings: ["_style:style"],
  classNameBindings: [":as-calendar-occurrence", "type"],
  tagName: "article",

  model: null,
  timeSlotDuration: null,
  timeSlotHeight: null,
  isMonthView: false,
  title: Ember.computed.oneWay("model.title"),
  content: Ember.computed.oneWay("model.content"),
  day: Ember.computed.oneWay("model.day"),
  type: Ember.computed.oneWay("model.content.type"),
  computedTimeSlotDuration: computedDuration("timeSlotDuration"),

  // titleStyle: Ember.computed('timeSlotHeight', function() {
  //   return Ember.String.htmlSafe(`line-height: ${this.get('timeSlotHeight')}px;`);
  // }),

  _duration: Ember.computed.oneWay("model.duration"),
  _startingTime: Ember.computed.oneWay("model.startingTime"),
  _dayStartingTime: Ember.computed.oneWay("day.startingTime"),

  _occupiedTimeSlots: Ember.computed(
    "isMonthView",
    "_duration",
    "computedTimeSlotDuration", function () {
      if (this.get("_duration")) {
        return this.get("isMonthView") ? 1 : this.get("_duration").as("ms") /
          this.get("computedTimeSlotDuration").as("ms");
      }
      else {
        return null;
      }
    }),

  _height: Ember.computed("_occupiedTimeSlots", function () {
    return this.get("timeSlotHeight") * this.get("_occupiedTimeSlots");
  }),

  _top: Ember.computed(
    "_startingTime",
    "_dayStartingTime",
    "computedTimeSlotDuration",
    "timeSlotHeight", function () {
      if (this.get("_startingTime") && this.get("_dayStartingTime")) {
        return (this.get("_startingTime").diff(this.get("_dayStartingTime")) /
          this.get("computedTimeSlotDuration").as("ms")) *
          this.get("timeSlotHeight");
      }
      else {
        return null;
      }
    }),

  _style: Ember.computed("_height", "_top", function () {
    return Ember.String.htmlSafe(`top: ${this.get("_top")}px;
            height: ${this.get("_height")}px;`);
  }),

  _stopPropagation: Ember.on("click", function (event) {
    event.stopPropagation();
  })
});
