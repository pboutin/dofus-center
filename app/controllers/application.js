import Ember from 'ember';
import ENV from 'dofus-center/config/environment';

export default Ember.Controller.extend({
    queryParams: ['page'],
    page: null,

    actions: {
        signIn: function(provider) {
            this.get('session').open('firebase', { provider: provider}).then(function() {
                let requestedPage = this.get('page');
                this.set('page', null);
                this.transitionToRoute(requestedPage || 'dashboard');
            }.bind(this));
        }
    },

    dataIssuesUrl: Ember.computed(function() {
        let title = 'Dofus Item : ';
        return `${ENV.dofusDataIssuesUrl}/new?title=${title}`;
    }),
    workbenchIssuesUrl: Ember.computed(function() {
        return `${ENV.dofusDataIssuesUrl}/new`;
    })
});
