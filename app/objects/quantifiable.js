import Ember from 'ember';

export default Ember.Object.extend({
    item: null,
    quantity: 0,
    target: 0,

    increaseTargetOf(quantity) {
        this.set('target', this.get('target') + quantity);
    },

    progressWidthStyle: Ember.computed('quantity', 'target', function() {
        let progress = (this.get('quantity') / this.get('target')) * 100;
        return Ember.String.htmlSafe(`width: ${progress}%`);
    }),

    isComplete: Ember.computed('quantity', 'target', function() {
        return this.get('quantity') >= this.get('target');
    })
});