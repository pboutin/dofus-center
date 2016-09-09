import Ember from 'ember';

export default Ember.Controller.extend({
    dofusData: Ember.inject.service('dofus-data'),
    workbench: Ember.inject.service('workbench'),

    filteredItems: [],
    query: '',

    actions: {
        add(item) {
            this.get('model').addToWishlist(item);
            this.get('workbench').save();
        },
        remove(item) {
            this.get('model').removeFromWishlist(item);
            this.get('workbench').save();
        }
    },

    queryObserver: Ember.observer('query', function() {
        var self = this;
        Ember.run.debounce(this, function() {
            self.set('filteredItems', self.get('dofusData').getFilteredItemsFor(self.get('query')));
        }, 2000);
    })
});
