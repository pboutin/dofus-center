import Ember from 'ember';
import analyticsSet from '../utils/analytics-set';

export default Ember.Route.extend({
    beforeModel: function() {
        return this.get('session').fetch().catch(function() {});
    },
    setupController() {
        if (this.get('session.uid')) {
            analyticsSet('firebaseUserId', this.get('session.uid'));
        }
    }
});
