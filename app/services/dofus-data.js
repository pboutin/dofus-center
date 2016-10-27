import Ember from 'ember';
import ENV from 'dofus-workbench/config/environment';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    itemMap: {},

    initialize() {
        let self = this;
        let itemMap = {};
        
        return new Ember.RSVP.Promise(function(resolve) {
            Ember.$.getJSON(`${ENV.dofusDataRepository}/dofus-data.json`, function(data) {
                _.mapKeys(data, function(rawItem, itemId) {
                    rawItem['id'] = itemId;
                    rawItem['image'] = `${ENV.dofusDataRepository}/images/${itemId}.png`;
                    let item = Ember.getOwner(self).lookup('object:item');
                    item.deserialize(rawItem);
                    item.set('searchableName', self._sanitize(item.get('name')));
                    itemMap[itemId] = item;
                });

                self.set('itemMap', itemMap);
                console.log('Processed dofus-data');
                resolve();
            });
        });
    },

    getItem(itemId) {
        let item = _.get(this.get('itemMap'), itemId, null);
        if (item === null) {
            item = Ember.getOwner(this).lookup('object:item');
            item.fakeFor(itemId);
        }
        return item;
    },

    getFilteredItemsFor(query) {
        var result = [];
        query = this._sanitize(query);

        _.mapValues(this.get('itemMap'), function(item) {
            if (item.get('searchableName').indexOf(query) >= 0 && item.get('isCraftable')) {
                result.push(item);
            }
        });
        return result;
    },

    _sanitize(input) {
        input = _.deburr(input.toLowerCase());
        input = _.trim(input);
        return input.replace(/[^a-z\d:]/ig, []);
    }
});