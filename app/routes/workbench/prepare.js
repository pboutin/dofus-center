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
    }
});
