import Ember from 'ember';
import _ from 'lodash/lodash';
import steps from '../ressources/ocre-quest';
import sanitize from '../utils/string-sanitize';

export default Ember.Component.extend({
    progress: '',
    stepIndex: 0,
    target: 0,
    isFiltered: false,
    textFilter: '',
    onChange: () => {},

    actions: {
        update(item, delta) {
            let progress = this.get('progress');
            progress = progress.split('');
            progress[item.index] = item.value + delta;
            progress = progress.join('');

            this.get('onChange')(progress, this.get('stepIndex'));
        }
    },

    progressBars: Ember.computed('parsedItems', 'target', function() {
        const parsedItems = this.get('parsedItems');

        return _.times(this.get('target'), (index) => {
            return _.filter(parsedItems, parsedItem => parsedItem.value > index).length / parsedItems.length;
        });
    }),

    minimum: Ember.computed('progress', function() {
        const progress = this.get('progress');
        return Math.min(..._.map(progress.split(''), number => parseInt(number, 10)));
    }),

    hasVisibleItems: Ember.computed('parsedItems', function() {
        return _.some(this.get('parsedItems'), parsedItem => parsedItem.isVisible);
    }),

    parsedItems: Ember.computed('progress', 'isFiltered', 'textFilter', function() {
        const progress = this.get('progress');
        const items = steps[this.get('stepIndex') - 1];
        const target = this.get('target');
        const isFiltered = this.get('isFiltered');
        const textFilter = sanitize(this.get('textFilter'));

        return _.map(items, (item, index) => {
            const value = parseInt(progress[index], 10);
            const isCompleted = value >= target;
            const name = item[0];

            return {
                name: name,
                note: item[1],
                index: index,
                cantAdd: value >= 9,
                cantRemove: value <= 0,
                value: value,
                isCompleted: isCompleted,
                isStarted: value < target && value > 0,
                isVisible: textFilter ? sanitize(name).indexOf(textFilter) > -1 : ! (isFiltered && isCompleted)
            };
        });
    })
});
