import Ember from 'ember';
import _ from 'lodash/lodash';
import steps from '../ressources/ocre-quest';
import OcreItem from '../objects/ocre-item';

export default Ember.Component.extend({
    progress: '',
    stepIndex: 0,
    target: 0,
    isFiltered: false,
    onChange: () => {},

    parsedItems: null,
    progressBars: null,

    actions: {
        update(item, delta) {
            let updatedValue = item.get('value') + delta;

            let progress = this.get('progress');
            progress = progress.split('');
            progress[item.get('itemIndex')] = updatedValue;
            progress = progress.join('');
            item.set('value', updatedValue);

            this._updateProgressBars();
            this.get('onChange')(progress, this.get('stepIndex'));
            Ember.run.debounce(this, '_hideCompletedItems', 5000);
        },
        updateAll(delta) {
            const updatedProgress =_.reduce(this.get('parsedItems'), (progress, item) => {
                const oldValue = item.get('value');
                const updatedValue = oldValue + delta;
                if (updatedValue <= 9 && updatedValue >= 0) {
                    item.set('value', updatedValue);
                    return progress + updatedValue;
                }
                return progress + oldValue;
            }, '');

            this._updateProgressBars();
            this.get('onChange')(updatedProgress, this.get('stepIndex'));
            Ember.run.debounce(this, '_hideCompletedItems', 5000);
        }
    },

    didReceiveAttrs() {
        if (this.get('parsedItems')) {
            return;
        }

        this.set('parsedItems', _.map(steps[this.get('stepIndex') - 1], (item, index) => {
            return OcreItem.create({
                stepIndex: this.get('stepIndex'),
                itemIndex: index,
                value: parseInt(this.get('progress')[index], 10),
                target: this.get('target')
            });
        }));
        this._updateProgressBars();
    },

    isFilteredObserver: Ember.observer('isFiltered', function() {
        if (this.get('isFiltered')) {
            this._hideCompletedItems();
        } else {
            this._showItems();
        }
    }),
    _hideCompletedItems() {
        const $items = this.$('._ocre-item');
        const $completedItems = this.$('._ocre-item[data-completed="true"]');
        $completedItems.hide();
        if ($items.length === $completedItems.length) {
            this.$().hide();
        }
    },
    _showItems() {
        this.$('._ocre-item').show();
        this.$().show();
    },

    _updateProgressBars() {
        const parsedItems = this.get('parsedItems');
        this.set('progressBars', _.times(this.get('target'), index => {
            return _.filter(parsedItems, parsedItem => parsedItem.get('value') > index).length / parsedItems.length;
        }));
    },

    targetObserver: Ember.observer('target', function() {
        const target = this.get('target');
        _.each(this.get('parsedItems'), parsedItem => {
            parsedItem.set('target', target);
        });
        this._updateProgressBars();
    }),

    minimum: Ember.computed('progress', function() {
        const progress = this.get('progress');
        return Math.min(..._.map(progress.split(''), number => parseInt(number, 10)));
    }),

    sanitizedSummary: Ember.computed('parsedItems', function() {
        return _.map(this.get('parsedItems'), parsedItem => parsedItem.sanitizedName).join('-');
    }),

    cantGloballyAdd: Ember.computed('progress', function() {
        return /^9+$/.test(this.get('progress'));
    }),

    cantGloballyRemove: Ember.computed('progress', function() {
        return /^0+$/.test(this.get('progress'));
    })
});
