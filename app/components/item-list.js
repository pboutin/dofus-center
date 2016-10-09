import Ember from 'ember';

export default Ember.Component.extend({
    items: [],
    onRemove: null,

    actions: {
        remove(quantifiable) {
            this.get('onRemove')(quantifiable);
        }
    }
});
