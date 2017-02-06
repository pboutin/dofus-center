import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['search-input'],
    value: '',

    actions: {
        clear() {
            this.set('value', '');
        }
    }
});
