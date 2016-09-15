import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Object.extend({
    dofusData: Ember.inject.service('dofus-data'),

    id: '',
    name: '',
    wishlist: {},
    stock: {},
    ressourcesItems: [],

    wishlistItems: Ember.computed('wishlist', function() {
        return _.values(this.get('wishlist'));
    }),

    initRessourcesItems() {
        let self = this;
        let wishlistItems = this.get('wishlistItems');
        let rawWishlist = this.get('wishlist');
        let dofusData = this.get('dofusData');
        let stock = this.get('stock');

        let ressourcesItems = _.values(_.reduce(wishlistItems, function(ressourcesMap, quantifiableItem) {
            _.mapKeys(quantifiableItem.get('item.recipe'), function(ressourceQuantity, ressourceItemId) {
                if ( ! _.has(rawWishlist, ressourceItemId)) {
                    if ( ! _.has(ressourcesMap, ressourceItemId)) {
                        let quantifiable = Ember.getOwner(self).lookup('object:quantifiable');
                        quantifiable.set('item', dofusData.getItem(ressourceItemId));
                        quantifiable.set('quantity', _.get(stock, ressourceItemId, 0));
                        ressourcesMap[ressourceItemId] = quantifiable;
                    }
                    ressourcesMap[ressourceItemId].increaseTargetOf(parseInt(ressourceQuantity, 10) * quantifiableItem.get('target'));
                }
            });
            return ressourcesMap;
        }, {}));

        ressourcesItems = _.sortBy(ressourcesItems, function(item) {
            return item.get('target') * -1;
        });
        this.set('ressourcesItems', ressourcesItems);
    },

    initId() {
        this.set('id', 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }));
    },

    addToWishlist(item, quantity) {
        quantity = quantity || 1;

        let itemId = item.get('id');
        let wishlist = this.get('wishlist');

        if ( ! _.has(wishlist, itemId)) {
            let quantifiable = Ember.getOwner(this).lookup('object:quantifiable');
            quantifiable.set('item', item);
            wishlist[itemId] = quantifiable;
        }

        wishlist[itemId].increaseTargetOf(quantity);
        this.notifyPropertyChange('wishlist');
    },

    removeFromWishlist(item) {
        let itemId = item.get('id');
        let wishlist = this.get('wishlist');

        if (_.has(wishlist, itemId)) {
            this.notifyPropertyChange('wishlist');
            delete wishlist[itemId];
        }
    },

    deserialize(rawProject) {
        let dofusData = this.get('dofusData');
        let self = this;
        
        this.set('id', rawProject.id);
        this.set('name', rawProject.name);
        this.set('wishlist', _.mapValues(rawProject.wishlist, function(targetQuantity, itemId) {
            let quantifiable = Ember.getOwner(self).lookup('object:quantifiable');
            quantifiable.set('item', dofusData.getItem(itemId));
            quantifiable.set('target', targetQuantity);
            return quantifiable;
        }));
        this.set('stock', rawProject.stock);
    },

    serialize() {
        let stock = this.get('stock');
        let ressourcesItems = this.get('ressourcesItems');

        if (ressourcesItems.length > 0) {
            stock = _.reduce(ressourcesItems, function(stockMap, ressourceItem) {
                if (ressourceItem.get('quantity') > 0) {
                    stockMap[ressourceItem.get('item.id')] = ressourceItem.get('quantity');
                }
                return stockMap;
            }, {});
        }

        this.set('stock', stock);

        return {
            id: this.get('id'),
            name: this.get('name'),
            wishlist: _.mapValues(this.get('wishlist'), function(quantifiable) {
                return quantifiable.get('target');
            }),
            stock: stock
        };
    }
});