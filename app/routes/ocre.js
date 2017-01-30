import Ember from 'ember';
import steps from '../ressources/ocre-quest';
import _ from 'lodash/lodash';

export default Ember.Route.extend({
    model() {
        return this.store.query('userdata', {
            orderBy: 'userId',
            equalTo: this.get('session.uid')
        });
    },

    setupController(controller, model) {
        if (model.get('length')) {
            controller.set('model', model.get('firstObject'));
        } else {
            controller.set('model', this.get('store').createRecord('userdata', {
                userId: this.get('session.uid'),
                ocreProgress: this._initOcreProgress()
            }));
        }

        controller.prepareSteps();
    },

    _initOcreProgress() {
        return _.map(steps, step => _.repeat('0', step.length));
    }
});
