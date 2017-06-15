import moment from "moment";
import Ember from "ember";

var TimeSlot = Ember.Object.extend({
  duration: null,
  time: null,
  timeZone: null,
  isActive: false,

  endingTime: Ember.computed("time", "duration", function () {
    return moment.duration(this.get("time")).add(this.get("duration"));
  }),

  day: Ember.computed("timeZone", function () {
    return moment().tz(this.get("timeZone")).startOf("day");
  }),

  value: Ember.computed("day", "time", function () {
    return moment(this.get("day")).add(this.get("time"));
  }),

  endingValue: Ember.computed("day", "endingTime", function () {
    return moment(this.get("day")).add(this.get("endingTime"));
  }),

  isInRange: function (startingTime, endingTime) {
    var value = this.get("value");
    var day = this.get("day");

    return value >= moment(day).add(startingTime) &&
      this.get("endingValue") <= moment(day).add(endingTime);
  },

  next: function () {
    var duration = this.get("duration");
    var momentTime = this.get("momentTime").clone().add(duration);

    return TimeSlot.create({
      timeZone: this.get("timeZone"),
      time: moment.duration(this.get("time")).add(duration),
      momentTime: momentTime,
      timeLabel: momentTime.format("HH:mm"),
      duration: duration
    });
  }
});

TimeSlot.reopenClass({
  buildDay: function (options) {
    var timeSlots = Ember.A();
    var durationStart = options.showAllHours ? moment.duration(0) : options.startingTime;
    var durationEnd = options.showAllHours ? moment.duration(1, "day") : options.endingTime;
    var startOfDay = moment().startOf("day").add(durationStart);

    var currentTimeSlot = this.create({
      timeZone: options.timeZone,
      time: durationStart,
      momentTime: startOfDay.clone().add(options.duration),
      timeLabel: startOfDay.clone().add(options.duration).format("HH:mm"),
      duration: options.duration,
      isActive: durationStart && options.startingTime ? durationStart.valueOf() === options.startingTime.valueOf() : false
    });

    while (currentTimeSlot.isInRange(
      durationStart,
      durationEnd
    )) {
      timeSlots.pushObject(currentTimeSlot);
      currentTimeSlot = currentTimeSlot.next();
      currentTimeSlot.isActive = currentTimeSlot.isInRange(
        options.startingTime,
        options.endingTime
      );
      if (currentTimeSlot.isActive && options.break) {
        currentTimeSlot.isActive = !currentTimeSlot.isInRange(
          options.break.breakStartingTime,
          options.break.breakEndingTime
        );
      }
    }

    return timeSlots;
  }
});

export default TimeSlot;
