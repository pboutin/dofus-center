import Ember from 'ember';

export default Ember.Controller.extend({
    steps: [],

    textFilter: '',
    _isFiltered: true,

    actions: {
        updateTarget(delta) {
            let ocre = this.get('model');
            ocre.set('target', ocre.get('target') + delta);
            ocre.save();
        },
        updateStep(progress, stepIndex) {
            let ocre = this.get('model');
            ocre.set(`step${stepIndex}`, progress);
            ocre.save();

            Ember.run.debounce(ocre, function() {
                this.save();
            }, 2000);
        },
        toggleFilter() {
            this.toggleProperty('_isFiltered');
        }
    },

    isFiltered: Ember.computed('textFilter', '_isFiltered', function() {
        return this.get('_isFiltered') && this.get('textFilter') === '';
    }),
    cantIncrementTarget: Ember.computed('model.target', function() {
        return this.get('model.target') >= 9;
    }),
    cantDecrementTarget: Ember.computed('model.target', function() {
        return this.get('model.target') <= 1;
    })
});
