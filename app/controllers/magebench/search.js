import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        select(item) {
            this.transitionToRoute('magebench.item', item);
        }
    }
});
