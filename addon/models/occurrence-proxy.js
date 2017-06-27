import Ember from 'ember';
import moment from 'moment';
import computedMoment from 'ember-calendar/macros/computed-moment';
import Day from './day';

let OccurrenceProxy = Ember.Object.extend(Ember.Copyable, {
  calendar: null,
  content: null,
  endingTime: computedMoment('content.endsAt'),
  startingTime: computedMoment('content.startsAt'),
  title: Ember.computed.oneWay('content.title'),
  type: Ember.computed.oneWay('content.type'),

  duration: Ember.computed('startingTime', 'endingTime', function() {
    if(this.get('endingTime') && this.get('startingTime')) {
      return moment.duration(
        this.get('endingTime').diff(this.get('startingTime'))
      );
    }
    else {
      return null;
    }
  }),

  day: Ember.computed('startingTime', 'calendar', 'calendar.startDate', function() {
    if (this.get('startingTime')) {
      return Day.create({
        calendar: this.get('calendar'),
        offset: this.get('startingTime').diff(this.get('calendar.startDate'), 'days')
      });
    }
    else {
      return null;
    }
  }),

  copy: function() {
    return OccurrenceProxy.create({
      calendar: this.get('calendar'),

      content: Ember.Object.create({
        startsAt: this.get('content.startsAt'),
        endsAt: this.get('content.endsAt'),
        title: this.get('content.title'),
        type: this.get('content.type'),
      })
    });
  }
});

export default OccurrenceProxy;
