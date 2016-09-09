import Ember from 'ember';

export default Ember.Object.extend({
    item: null,
    quantity: 0,
    target: 0,

    increaseTargetOf(quantity) {
        this.set('target', this.get('target') + quantity);
    }
});