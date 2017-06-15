import Ember from 'ember';
import moment from "moment";
import computedMoment from 'ember-calendar/macros/computed-moment';
import computedDuration from 'ember-calendar/macros/computed-duration';
import Calendar from './calendar';
import OccurrenceProxy from './occurrence-proxy';

export default Calendar.extend({
  component: null,
  timeZone: Ember.computed.oneWay('component.timeZone'),
  startingTime: computedMoment('component.startingDate'),
  dayStartingTime: computedDuration('component.dayStartingTime'),
  dayEndingTime: computedDuration('component.dayEndingTime'),
  timeSlotDuration: computedDuration('component.timeSlotDuration'),
  type: Ember.computed.oneWay('component.type'),
  schedules: Ember.computed("component.schedules", function () {
    if(this.get("component.schedules")) {
      return Ember.A(this.get("component.schedules").map(schedule => {
        return {
          weekDay: schedule.weekDay,
          dayStartingTime: moment.duration(schedule.dayStartingTime),
          dayEndingTime: moment.duration(schedule.dayEndingTime),
        };
      }));
    }
    else {
      return null;
    }
  }),

  defaultOccurrenceTitle: Ember.computed.oneWay(
    'component.defaultOccurrenceTitle'
  ),

  defaultOccurrenceDuration: computedDuration(
    'component.defaultOccurrenceDuration'
  ),

  defaultOccurrenceType: computedDuration(
    'component.defaultOccurrenceType'
  ),

  occurrences: Ember.computed('component.occurrences.[]', function() {
    return this.get('component.occurrences').map((occurrence) => {
      return OccurrenceProxy.create({ calendar: this, content: occurrence });
    });
  })
});
