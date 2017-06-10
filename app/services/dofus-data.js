import Ember from 'ember';
import _ from 'lodash/lodash';
import sanitize from '../utils/string-sanitize';
import Item from '../objects/item';
import dofusData from '../ressources/dofus-data';

export default Ember.Service.extend({
    itemsMap: {},

    loadDofusData() {
        let self = this;
        let itemsMap = {};

        return new Ember.RSVP.Promise(function(resolve) {
            _.mapKeys(dofusData, function(rawItem, itemId) {
                rawItem['id'] = itemId;
                let item = Item.create({
                    id: rawItem['id'],
                    name: rawItem['name'],
                    level: parseInt(rawItem['level'], 10),
                    type: rawItem['type'],
                    recipe: _.mapValues(rawItem['recipe'], rawTarget => parseInt(rawTarget, 10)),
                    effects: rawItem['effects'],
                    link: rawItem['link']
                });

                item.set('searchableName', sanitize(item.get('name')));
                itemsMap[itemId] = item;
            });

            self.set('itemsMap', itemsMap);
            console.log('Processed dofus-data');
            resolve();
        });
    },

    getItem(itemId) {
        let item = _.get(this.get('itemsMap'), itemId, null);

        if (item) {
            return item;
        }

        const digitsId = itemId.match(/^\d+/)[0];
        item = _.find(this.get('itemsMap'), item => {
            return item.id.indexOf(digitsId) === 0;
        });
        return item || Item.create().fakeFor(itemId);
    },

    findItem(itemName) {
        let foundItem = _.find(this.get('itemsMap'), item => {
            return item.get('name') === itemName;
        });
        return foundItem || null;
    },

    getFilteredItemsFor(query, mode) {
        return _.filter(this.get('itemsMap'), item => {
            let isValid = item.get('searchableName').indexOf(sanitize(query)) >= 0;

            if (mode === 'craft') {
                isValid &= item.get('isCraftable');
            } else if (mode === 'effect') {
                isValid &= item.get('hasEffects');
            }
            return isValid;
        });
    }
});