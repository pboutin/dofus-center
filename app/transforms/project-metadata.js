import Ember from 'ember';
import DS from 'ember-data';
import Quantifiable from '../objects/quantifiable';
import _ from 'lodash/lodash';

export default DS.Transform.extend({
    dofusData: Ember.inject.service('dofusData'),

    deserialize(rawMetadata) {
        let dofusData = this.get('dofusData');
        let metadata = JSON.parse(rawMetadata);

        let items =  _.reduce(metadata.items, function(quantifiableList, target, itemId) {
            quantifiableList.push(Quantifiable.create({
                item: dofusData.getItem(itemId),
                target: target
            }));
            return quantifiableList;
        }, []);

        let stocksMap = _.reduce(items, function(quantifiableMap, quantifiableItem) {
            _.each(quantifiableItem.get('item.recipe'), function(resourceTarget, resourceId) {
                if ( ! _.has(metadata.items, resourceId)) {
                    if ( ! _.has(quantifiableMap, resourceId)) {
                        quantifiableMap[resourceId] = Quantifiable.create({
                            item: dofusData.getItem(resourceId),
                            quantity: _.get(metadata.stocks, resourceId, 0)
                        });
                    }
                    quantifiableMap[resourceId].increaseTargetOf(parseInt(resourceTarget, 10) * quantifiableItem.get('target'));
                }
            });
            return quantifiableMap;
        }, {});

        return {
            items: items,
            stocks: _.values(stocksMap)
        };
    },
    serialize(metadata) {
        let itemsMap = _.reduce(metadata.items, function(itemsMapBuffer, quantifiableItem) {
            itemsMapBuffer[quantifiableItem.get('item.id')] = quantifiableItem.get('target');
            return itemsMapBuffer;
        }, {});

        let stocksMap = _.reduce(metadata.stocks, function(stocksMapBuffer, quantifiableItem) {
            if (quantifiableItem.get('quantity') > 0) {
                stocksMapBuffer[quantifiableItem.get('item.id')] = quantifiableItem.get('quantity');
            }
            return stocksMapBuffer;
        }, {});

        return JSON.stringify({
            items: itemsMap,
            stocks: stocksMap
        });
    }
});
