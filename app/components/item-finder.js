import Ember from 'ember';

export default Ember.Component.extend({
    dofusData: Ember.inject.service('dofus-data'),

    mode: null,
    filteredItems: [],
    query: '',

    onSelect: () => {},

    actions: {
        select(item) {
            this.get('onSelect')(item);
        }
    },

    queryObserver: Ember.observer('query', function() {
        Ember.run.debounce(this, () => {
            this.set('filteredItems', this.get('dofusData').getFilteredItemsFor(this.get('query'), this.get('mode')));
        }, 2000);
    })
});
