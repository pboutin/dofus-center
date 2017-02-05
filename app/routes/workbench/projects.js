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
    
    model() {
        return this.store.query('project', {
            orderBy: 'userId',
            equalTo: this.get('session.uid')
        });
    }
});
