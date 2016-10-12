import Ember from 'ember';

export default Ember.Component.extend({
    session: null,

    isGoogle: Ember.computed('session.provider', function() {
        return this.get('session.provider') === 'google.com';
    })
});
