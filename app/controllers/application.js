import Ember from 'ember';
import analyticsSet from '../utils/analytics-set';

export default Ember.Controller.extend({
    queryParams: ['page'],
    page: null,
    isMonitored: true,

    actions: {
        signIn: function(provider) {
            this.get('session').open('firebase', { provider: provider}).then(function() {
                let requestedPage = this.get('page');
                this.set('page', null);
                analyticsSet('firebaseUserId', this.get('session.uid'));
                this.transitionToRoute(requestedPage || 'dashboard');
            }.bind(this));
        }
    }
});
