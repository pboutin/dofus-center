import Ember from 'ember';
import steps from '../ressources/ocre-quest';
import sanitize from '../utils/string-sanitize';

export default Ember.Object.extend({
    stepIndex: 0,
    itemIndex: 0,
    value: 0,
    target: 0,

    name: Ember.computed('stepIndex', 'itemIndex', function() {
        return steps[this.get('stepIndex') - 1][this.get('itemIndex')][0];
    }),
    sanitizedName: Ember.computed('name', function() {
        return sanitize(this.get('name'));
    }),
    note: Ember.computed('stepIndex', 'itemIndex', function() {
        return steps[this.get('stepIndex') - 1][this.get('itemIndex')][1];
    }),
    cantAdd: Ember.computed('value', function() {
        return this.get('value') >= 9;
    }),
    cantRemove: Ember.computed('value', function() {
        return this.get('value') <= 0;
    }),
    isCompleted: Ember.computed('value', 'target', function() {
        return this.get('value') >= this.get('target');
    }),
    isStarted: Ember.computed('value', 'target', function() {
        return this.get('value') < this.get('target') && this.get('value') > 0;
    })
});