import Ember from 'ember';
import _ from 'lodash';

export default Ember.Component.extend({
    dofusData: Ember.inject.service('dofus-data'),

    mode: null,
    filteredItems: [],
    query: '',
    isLoading: false,
    hasSearched: false,

    onSelect: () => {},

    actions: {
        select(item) {
            this.get('onSelect')(item);
        }
    },

    queryObserver: Ember.observer('query', function() {
        Ember.run.debounce(this, () => {
            this.set('isLoading', true);
            this.set('hasSearched', true);
            const query = this.get('query');
            if (/dofusfashionista/.test(query)) {
                this._processFashionistaBuild(query).then(items => {
                    this.set('filteredItems', items);
                    this.set('isLoading', false);
                });
            } else {
                const correspondingItems = this.get('dofusData').getFilteredItemsFor(this.get('query'), this.get('mode'));
                this.set('filteredItems', correspondingItems);
                this.set('isLoading', false);
            }
        }, 2000);
    }),

    _processFashionistaBuild(url) {
        return new Ember.RSVP.Promise(resolveWith => {
            Ember.$.ajax({
                type: 'GET',
                url: `https://crossorigin.me/${url}`
            }).done(html => {
                const $page = Ember.$(html);
                const dofusData = this.get('dofusData');
                resolveWith(_.map($page.find('.item-external-link'), $item => {
                    const itemId = $item.href.match(/equipements\/(\d+.+$)/)[1];
                    return dofusData.getItem(itemId);
                }));
            });
        });
    }
});
