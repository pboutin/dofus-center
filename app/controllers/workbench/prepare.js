import Ember from 'ember';

export default Ember.Controller.extend({
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
    }
});
