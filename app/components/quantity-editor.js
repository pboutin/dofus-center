import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['quantity-editor'],

    workbench: Ember.inject.service('workbench'),

    quantity: 0,
    target: 0,
    editableQuantity: 0,
    onChange: function() {},

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

    init() {
        this.set('editableQuantity', this.get('quantity'));
        this._super(...arguments);
    },

    quantityObserver: Ember.observer('quantity', function() {
        this.set('editableQuantity', this.get('quantity'));
        this.get('onChange')();
    }),

    editableQuantityObserver: Ember.observer('editableQuantity', function() {
        let editableQuantity = this.get('editableQuantity');
        if ( ! isNaN(editableQuantity)) {
            this.set('quantity', parseInt(editableQuantity, 10));
        }
    }),

    missing: Ember.computed('quantity', 'target', function() {
        let missing = this.get('target') - this.get('quantity');
        return missing > 0 ? missing : 0;
    })
});
