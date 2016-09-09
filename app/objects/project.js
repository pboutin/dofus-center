import Ember from 'ember';
import Quantifiable from '../objects/quantifiable';
import _ from 'lodash/lodash';

export default Ember.Object.extend({
    id: '',
    name: '',
    wishlist: {},
    stock: {},

    wishlistItems: Ember.computed('wishlist', function() {
        return _.values(this.get('wishlist'));
    }),

    initId() {
        this.set('id', 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }));
    },

    addToWishlist(item) {
        let itemId = item.get('id');
        let wishlist = this.get('wishlist');

        if ( ! _.has(wishlist, itemId)) {
            wishlist[itemId] = new Quantifiable({
                item: item
            });
        }

        wishlist[itemId].increaseTargetOf(1);
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

    deserialize(rawProject, dofusData) {
        this.set('id', rawProject.id);
        this.set('name', rawProject.name);
        this.set('wishlist', _.mapValues(rawProject.wishlist, function(targetQuantity, itemId) {
            return new Quantifiable({
                item: dofusData.getItem(itemId),
                target: targetQuantity
            });
        }));
    },

    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            wishlist: _.mapValues(this.get('wishlist'), function(quantifiable) {
                return quantifiable.get('target');
            }),
            stock: this.get('stock')
        };
    }
});