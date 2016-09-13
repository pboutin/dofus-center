import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Object.extend({
    id: '',
    name: '',
    searchableName: '',
    level: 0,
    type: '',
    image: '',
    link: '',
    recipe: {},

    deserialize(rawItem) {
        this.set('id', rawItem['id']);
        this.set('name', rawItem['name']);
        this.set('level', parseInt(rawItem['level'], 10));
        this.set('type', rawItem['type']);
        this.set('recipe', rawItem['recipe']);
        this.set('link', rawItem['link']);
        this.set('image', rawItem['image']);
    },

    isCraftable: Ember.computed('recipe', function() {
        return _.keys(this.get('recipe')).length > 0;
    })
});