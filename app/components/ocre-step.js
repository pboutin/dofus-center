import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Component.extend({
    progress: '',
    items: [],
    stepIndex: 0,
    onChange: () => {},

    parsedItems: [],

    actions: {
        update(item, delta) {
            let progress = this.get('progress');
            let newValue = parseInt(progress[item.index], 10) + delta;
            let updatedProgress = this._replaceDigit(progress, item.index, newValue);
            this.get('onChange')(updatedProgress, this.get('stepIndex'));
            this.set('progress', updatedProgress);
        }
    },

    stepDisplay: Ember.computed('stepIndex', function() {
        return this.get('stepIndex') + 1;
    }),

    didReceiveAttrs() {
        const progress = this.get('progress');
        const items = this.get('items');

        this.set('parsedItems', _.map(items, (item, index) => {
            return {
                name: item[0],
                note: item[1],
                index: index,
                value: parseInt(progress[index], 10)
            };
        }));
    },

    _replaceDigit(str, index, newValue) {
        return str.substr(0, index) + newValue.toString() + str.substr(index + 1);
    }
});
