import Ember from 'ember';

export default Ember.Component.extend({
    value: '',

    actions: {
        clear() {
            this.set('value', '');
        }
    }
});
