import Ember from 'ember';
import sanitize from '../utils/string-sanitize';
import _ from 'lodash/lodash';

export default Ember.Component.extend({
    selector: '',
    textFilter: '',

    magicSelector: Ember.computed('textFilter', 'selector', function() {
        const textFilter = sanitize(this.get('textFilter'));

        if (textFilter === '') {
            return '';
        }

        return _.map(this.get('selector').split(','), subSelector => {
             return `${_.trim(subSelector)}:not([data-filter*="${textFilter}"])`;
        }).join(', ');
    })
});
