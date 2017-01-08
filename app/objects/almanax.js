import Ember from 'ember';

export default Ember.Object.extend({
    bonus: '',
    quest: '',
    questItem: null,
    day: '',

    deserialize(rawItem) {
        this.set('bonus', rawItem['bonus']);
        this.set('quest', rawItem['quest']);
        this.set('day', rawItem['day']);
        return this;
    },

    questQuantity: Ember.computed('quest', function() {
        return parseInt(this.get('quest').match(/\d+/), 10);
    }),

    isXpBonus: Ember.computed('bonus', function() {
        return /expérience|étoile/.test(this.get('bonus'));
    }),
    isDropBonus: Ember.computed('bonus', function() {
        return /butin|étoile/.test(this.get('bonus'));
    })
});
