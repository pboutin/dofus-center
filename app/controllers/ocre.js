import Ember from 'ember';

export default Ember.Controller.extend({
    steps: [],

    isFiltered: true,
    textFilter: '',
    textFilterQuery: '',
    
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
            this.toggleProperty('isFiltered');
        }
    },

    textFilterQueryObserver: Ember.observer('textFilterQuery', function() {
        Ember.run.debounce(this, function() {
            this.set('textFilter', this.get('textFilterQuery'));
        }, 1000);
    }),

    cantIncrementTarget: Ember.computed('model.target', function() {
        return this.get('model.target') >= 9;
    }),
    cantDecrementTarget: Ember.computed('model.target', function() {
        return this.get('model.target') <= 1;
    })
});
