import Ember from 'ember';

export default Ember.Component.extend({
    url: '',

    actions: {
        share() {
            this.set('url', window.location.href);
        }
    }
});
