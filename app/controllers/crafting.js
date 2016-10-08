import Ember from 'ember';

export default Ember.Controller.extend({
    dofusData: Ember.inject.service('dofus-data'),

    actions: {
        addToItems(quantifiableItem) {
            let project = this.get('model');
            project.addItem(quantifiableItem.get('item'), quantifiableItem.get('target'));
            project.save();
        },
        save() {
            this.get('model').save();
        }
    }
});
