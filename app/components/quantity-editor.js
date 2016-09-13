import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['quantity-editor'],

    workbench: Ember.inject.service('workbench'),

    quantity: 0,
    target: 0,

    actions: {
        incrementBy(quantity) {
            let target = this.get('target');
            let currentQuantity = this.get('quantity');
            let updatedQuantity = currentQuantity + quantity;
            this.set('quantity', updatedQuantity > target ? target : updatedQuantity);
        },
        decrementBy(quantity) {
            let currentQuantity = this.get('quantity');
            let updatedQuantity = currentQuantity - quantity;
            this.set('quantity', updatedQuantity < 0 ? 0 : updatedQuantity);
        },
        maximise() {
            this.set('quantity', this.get('target'));
        },
        clear() {
            this.set('quantity', 0);
        }
    },

    quantityObserver: Ember.observer('quantity', function() {
        this.get('workbench').save();
    }),

    missing: Ember.computed('quantity', 'target', function() {
        let missing = this.get('target') - this.get('quantity');
        return missing > 0 ? missing : 0;
    })
});
