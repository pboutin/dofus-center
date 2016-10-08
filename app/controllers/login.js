import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        signIn: function(provider) {
            this.get('session').open('firebase', { provider: provider}).then(function(data) {
                console.log('Logged in with : ', data);
                this.transitionToRoute('projects');
            }.bind(this));
        },
        signOut: function() {
            this.get('session').close();
        }
    }
});
