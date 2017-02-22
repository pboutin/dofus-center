import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Controller.extend({
    dofusData: Ember.inject.service('dofus-data'),

    isFiltered: false,
    isEditing: false,

    actions: {
        toggleFilter() {
            this.toggleProperty('isFiltered');
        },
        toggleQuantity(quantifiable) {
            if (this.get('isEditing')) {
                const target = quantifiable.get('target');
                const quantity = quantifiable.get('quantity');
                if (quantity >= 0 && quantity < target) {
                    quantifiable.set('quantity', target);
                } else {
                    quantifiable.set('quantity', 0);
                }
            }
        },
        addToItems(quantifiableItem) {
            let model = this.get('model');
            model.addItem(quantifiableItem.get('item'), quantifiableItem.get('target'));
            this._applyQuantitiesAndSave().then(() => {
                this.set('stocks', model.get('sortedStocks'));
            });
        },
        quantityUpdate() {
            Ember.run.debounce(this, '_applyQuantitiesAndSave', 5000);
        }
    },

    _applyQuantitiesAndSave() {
        const stocks = this.get('stocks');
        const model = this.get('model');
        const modelStocks = model.get('sortedStocks');

        _.each(this.get('stocks'), (quantifiableItem, index) => {
            modelStocks[index].set('quantity', quantifiableItem.get('quantity'));
        });
        this._hideCompletedItems();
        return model.save();
    },

    // TODO: move this logic into a component
    isFilteredObserver: Ember.observer('isFiltered', function() {
        if (this.get('isFiltered')) {
            this._hideCompletedItems();
        } else {
            this._showItems();
        }
    }),
    _hideCompletedItems() {
        if (this.get('isFiltered')) {
            const $items = Ember.$('._crafting-item');
            const $completedItems = Ember.$('._crafting-item[data-completed="true"]');
            $completedItems.hide();
            if ($items.length === $completedItems.length) {
                Ember.$('._crafting-finish').show();
            }
        }
    },
    _showItems() {
        Ember.$('._crafting-item').show();
        Ember.$('._crafting-finish').hide();
    }
    // end:TODO
});
