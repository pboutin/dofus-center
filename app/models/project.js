import Ember from 'ember';
import DS from 'ember-data';
import Quantifiable from '../objects/quantifiable';
import _ from 'lodash/lodash';

export default DS.Model.extend({
    userId: DS.attr('string'),
    name: DS.attr('string'),
    metadata: DS.attr('project-metadata', {
        defaultValue: function() {
            return {
                items: [],
                stocks: []
            };
        }
    }),
    timestamp: DS.attr('timestamp'),

    items: Ember.computed.alias('metadata.items'),
    stocks: Ember.computed.alias('metadata.stocks'),

    level: Ember.computed('items', function() {
        let levels = _.map(this.get('items'), function(quantifiable) {
            return quantifiable.get('item.level');
        });
        return levels.length ? _.max(levels): 0;
    }),

    sortedStocks: Ember.computed('stocks', function() {
        return _.sortBy(this.get('stocks'), function(quantifiable) {
            return quantifiable.get('target') * -1;
        });
    }),

    addItem(newItem, newItemQuantity) {
        newItemQuantity = typeof newItemQuantity === 'undefined' ? 1 : newItemQuantity;

        let items = this.get('items');

        let matchingQuantifiableItem = this._getQuantifiableItem(newItem.get('id'));

        if (matchingQuantifiableItem) {
            matchingQuantifiableItem.increaseTargetOf(newItemQuantity);
        } else {
            items.push(Quantifiable.create({
                item: newItem,
                target: newItemQuantity
            }));
            this.set('items', items);
        }

        this._recursiveRecipeAdjustFor(newItem, newItemQuantity);
    },

    _recursiveRecipeAdjustFor(item, quantity) {
        _.each(item.get('recipe'), (recipeItemTarget, recipeItemId) => {
            let quantifiableItemProject = this._getQuantifiableItem(recipeItemId);
            if (quantifiableItemProject) {
                const missing = recipeItemTarget * quantity;
                quantifiableItemProject.increaseTargetOf(missing);
                this._recursiveRecipeAdjustFor(quantifiableItemProject.get('item'), missing);
            }
        });
    },

    removeItem(item) {
        let items = this.get('metadata.items');
        this.set('metadata.items', _.filter(items, function(quantifiableItem) {
            return quantifiableItem.get('item.id') !== item.get('id');
        }));
    },

    _getQuantifiableItem(itemId) {
        return _.find(this.get('items'), function(quantifiableItem) {
            return itemId === quantifiableItem.get('item.id');
        }) || null;
    }
});
