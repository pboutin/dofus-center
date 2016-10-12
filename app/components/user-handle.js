import Ember from 'ember';

export default Ember.Component.extend({
    session: null,

    actions: {
        signOut: function() {
            this.get('session').close().then(function() {
                window.location.reload();
            });
        }
    },

    isGoogle: Ember.computed('session.provider', function() {
        return this.get('session.provider') === 'google.com';
    })
});
