import Ember from 'ember';

export default Ember.Component.extend({
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
        }
    },

    quantityObserver: Ember.observer('quantity', function() {
        this.get('workbench').save();
    })
});
