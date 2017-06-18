import Ember from 'ember';
import steps from '../ressources/ocre-quest';
import _ from 'lodash/lodash';
import analyticsEvent from '../utils/analytics-event';

export default Ember.Route.extend({
    activate() {
        analyticsEvent('feature', 'ocre', 'Ocre');
    },

    beforeModel() {
        if ( ! this.get('session.isAuthenticated')) {
            return this.transitionTo('login', {
                queryParams: {
                    page: 'ocre'
                }
            });
        }
    },

    model() {
        return this.store.query('ocre', {
            orderBy: 'userId',
            equalTo: this.get('session.uid')
        });
    },

    setupController(controller, model) {
        if (model.get('length')) {
            model = model.get('firstObject');
        } else {
            model = this._initProgressFor(this.get('store').createRecord('ocre', {
                userId: this.get('session.uid'),
                target: 1
            }));
        }
        controller.set('model', model);
    },

    _initProgressFor(ocre) {
        _.each(steps, (stepItems, index) => {
            ocre.set(`step${index + 1}`, _.repeat(0, stepItems.length));
        });
        return ocre;
    }
});
