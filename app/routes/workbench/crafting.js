import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        if ( ! this.get('session.isAuthenticated')) {
            return this.transitionTo('login', {
                queryParams: {
                    page: 'workbench'
                }
            });
        }
    },
    
    model(params) {
        return this.store.find('project', params.id);
    },

    setupController(controller, model) {
        const session = this.get('session');
        controller.set('isEditing', session.get('isAuthenticated') && session.get('uid') === model.get('userId'));

        this._super(...arguments);
    }
});
