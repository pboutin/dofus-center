import Ember from 'ember';
import steps from '../ressources/ocre-quest';
import _ from 'lodash/lodash';

export default Ember.Controller.extend({
    steps: [],
    
    actions: {
        update(subProgress, index) {
            let userdata = this.get('model');
            let progress = userdata.get('ocreProgress');
            progress[index] = subProgress;
            userdata.set('ocreProgress', progress);
            userdata.save();
        }
    },

    prepareSteps() {
        let progress = this.get('model.ocreProgress');

        this.set('steps', _.map(steps, (items, index) => {
            return {
                items: items,
                progress: progress[index]
            };
        }));
    }
});
