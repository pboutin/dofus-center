import Ember from 'ember';

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
    }
});