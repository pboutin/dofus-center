import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        signOut: function() {
            let self = this;
            this.get('session').close().then(function() {
                self.transitionToRoute('login');
            });
        }
    }
});
