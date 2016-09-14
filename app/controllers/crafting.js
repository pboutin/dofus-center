import Ember from 'ember';

export default Ember.Controller.extend({
    dofusData: Ember.inject.service('dofus-data'),
    workbench: Ember.inject.service('workbench'),

    actions: {
        sendToWorkbench(quantifiableItem) {
            this.get('model').addToWishlist(quantifiableItem.get('item'), quantifiableItem.get('target'));
            this.get('workbench').save();
            this.get('model').initRessourcesItems();
        }
    }
});
