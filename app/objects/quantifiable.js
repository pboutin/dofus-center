import Ember from 'ember';

export default Ember.Object.extend({
    item: null,
    quantity: 0,
    target: 0,

    increaseTargetOf(quantity) {
        this.set('target', this.get('target') + quantity);
    },

    isTargetGreaterThanOne: Ember.computed('target', function() {
        return this.get('target') > 1;
    }),

    progress: Ember.computed('quantity', 'target', function() {
        return this.get('quantity') / this.get('target');
    }),

    isCompleted: Ember.computed('quantity', 'target', function() {
        return this.get('quantity') >= this.get('target');
    })
});