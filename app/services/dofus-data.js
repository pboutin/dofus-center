import Ember from 'ember';
import ENV from 'dofus-workbench/config/environment';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    itemsMap: {},

    initialize() {
        let self = this;
        let itemsMap = {};
        
        return new Ember.RSVP.Promise(function(resolve) {
            Ember.$.getJSON(`${ENV.dofusDataRepository}/dofus-data.json`, function(data) {
                _.mapKeys(data, function(rawItem, itemId) {
                    rawItem['id'] = itemId;
                    let item = Ember.getOwner(self).lookup('object:item');
                    item.deserialize(rawItem);
                    item.set('searchableName', self._sanitize(item.get('name')));
                    itemsMap[itemId] = item;
                });

                self.set('itemsMap', itemsMap);
                console.log('Processed dofus-data');
                resolve();
            });
        });
    },

    getItem(itemId) {
        let item = _.get(this.get('itemsMap'), itemId, null);
        if (item === null) {
            item = Ember.getOwner(this).lookup('object:item');
            item.fakeFor(itemId);
        }
        return item;
    },

    findItem(itemName) {
        let foundItem = _.find(this.get('itemsMap'), item => {
            return item.get('name') == itemName;
        });
        return foundItem || null;
    },

    getFilteredItemsFor(query, mode) {
        return _.filter(this.get('itemsMap'), item => {
            let isValid = item.get('searchableName').indexOf(this._sanitize(query)) >= 0;

            if (mode === 'craft') {
                isValid &= item.get('isCraftable');
            }
            return isValid;
        });
    },

    _sanitize(input) {
        input = _.deburr(input.toLowerCase());
        input = _.trim(input);
        return input.replace(/[^a-z\d:]/ig, []);
    }
});