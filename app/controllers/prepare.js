import Ember from 'ember';

export default Ember.Controller.extend({
    dofusData: Ember.inject.service('dofus-data'),

    filteredItems: [],
    query: '',

    actions: {
        add(item) {
            let project = this.get('model');
            project.addItem(item);
            project.save();
        },
        remove(quantifiable) {
            let project = this.get('model');
            project.removeItem(quantifiable.get('item'));
            project.save();
        }
    },

    queryObserver: Ember.observer('query', function() {
        var self = this;
        Ember.run.debounce(this, function() {
            self.set('filteredItems', self.get('dofusData').getFilteredItemsFor(self.get('query')));
        }, 2000);
    })
});
