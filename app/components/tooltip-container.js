import Ember from 'ember';

export default Ember.Component.extend({
    title: '',
    position: 'bottom',

    didInsertElement() {
        this.$().tooltip({
            placement: this.get('position'),
            title: this.get('title')
        });
    }
});
