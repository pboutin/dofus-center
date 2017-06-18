import Ember from 'ember';
import analyticsEvent from '../utils/analytics-event';

export default Ember.Route.extend({
    activate() {
        analyticsEvent('feature', 'magebench', 'Magebench');
    }
});
