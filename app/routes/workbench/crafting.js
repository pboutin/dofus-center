import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        return this.store.find('project', params.id);
    },

    setupController(controller, model) {
        const session = this.get('session');
        controller.set('isEditing', session.get('isAuthenticated') && session.get('uid') === model.get('userId'));

        this._super(...arguments);
    }
});
