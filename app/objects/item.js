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
        let parsedRecipe = {};
        _.each(rawItem['recipe'], function(target, itemId) {
            parsedRecipe[itemId] = parseInt(target, 10);
        });
        
        this.set('id', rawItem['id']);
        this.set('name', rawItem['name']);
        this.set('level', parseInt(rawItem['level'], 10));
        this.set('type', rawItem['type']);
        this.set('recipe', parsedRecipe);
        this.set('link', rawItem['link']);
        this.set('image', rawItem['image']);
    },

    isCraftable: Ember.computed('recipe', function() {
        return _.keys(this.get('recipe')).length > 0;
    }),

    fakeFor(itemId) {
        this.set('id', itemId);
        this.set('name', _.trim(itemId.replace(/\d*\-/g, ' ')));
    }
});
