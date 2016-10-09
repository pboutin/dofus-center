import Ember from 'ember';
import DS from 'ember-data';
import Quantifiable from '../objects/quantifiable';
import _ from 'lodash/lodash';

export default DS.Model.extend({
    userId: DS.attr('string'),
    name: DS.attr('string'),
    metadata: DS.attr('metadata', {
        defaultValue: function() {
            return {
                items: [],
                stocks: []
            };
        }
    }),

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

    addItem(item, quantity) {
        quantity = typeof quantity === 'undefined' ? 1 : quantity;

        let items = this.get('metadata.items');

        let matchingQuantifiableItem = _.find(items, function(quantifiableItem) {
            return item.get('id') === quantifiableItem.get('item.id');
        });

        if (matchingQuantifiableItem) {
            matchingQuantifiableItem.increaseTargetOf(quantity);
        } else {
            items.push(new Quantifiable({
                item: item,
                target: quantity
            }));
            this.set('metadata.items', items);
        }
    },

    removeItem(item) {
        let items = this.get('metadata.items');
        this.set('metadata.items', _.filter(items, function(quantifiableItem) {
            return quantifiableItem.get('item.id') !== item.get('id');
        }));
    }
});
