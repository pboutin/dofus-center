import Ember from 'ember';
import ENV from 'dofus-workbench/config/environment';
import Item from '../objects/item';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    itemMap: {},

    initialize() {
        let self = this;
        let itemMap = {};
        
        return new Ember.RSVP.Promise(function(resolve) {
            Ember.$.getJSON(`${ENV.dofusDataRepository}/dofus-data.json`, function(data) {
                let baseUrl = data['metadata']['baseUrl'];

                _.mapKeys(data['data'], function(rawItem, itemId) {
                    let item = new Item();
                    item.set('id', itemId);
                    item.set('name', rawItem['name']);
                    item.set('searchableName', self._sanitize(rawItem['name']));
                    item.set('level', parseInt(rawItem['level'], 10));
                    item.set('type', rawItem['type']);
                    item.set('link', baseUrl + rawItem['link']);

                    item.set('image', `${ENV.dofusDataRepository}/images/${itemId}.png`);

                    itemMap[itemId] = item;
                });

                self.set('itemMap', itemMap);
                console.log('Processed dofus-data');
                resolve();
            });
        });
    },

    getItem(itemId) {
        return _.get(this.get('itemMap'), itemId);
    },

    getFilteredItemsFor(query) {
        var result = [];
        query = this._sanitize(query);

        _.mapValues(this.get('itemMap'), function(item) {
            if (item.get('searchableName').indexOf(query) > 0) {
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