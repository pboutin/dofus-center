import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Controller.extend({
    dofusData: Ember.inject.service('dofus-data'),

    isFiltered: false,

    actions: {
        toggleFilter() {
            this.toggleProperty('isFiltered');
        },
        toggleQuantity(quantifiable) {
            const target = quantifiable.get('target');
            const quantity = quantifiable.get('quantity');
            if (quantity === 0) {
                quantifiable.set('quantity', target);
            } else {
                quantifiable.set('quantity', 0);
            }
        },
        addToItems(quantifiableItem) {
            let project = this.get('model');
            project.addItem(quantifiableItem.get('item'), quantifiableItem.get('target'));
            project.save();
        },
        save() {
            this.get('model').save();
        }
    },

    displayedStocks: Ember.computed('model.sortedStocks', 'isFiltered', function() {
        if (this.get('isFiltered')) {
            return _.filter(this.get('model.sortedStocks'), function(quantifiable) {
                return ! quantifiable.get('isComplete');
            });
        }
        return this.get('model.sortedStocks');
    })
});
