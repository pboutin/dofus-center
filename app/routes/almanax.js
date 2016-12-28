import Ember from 'ember';
import ENV from 'dofus-workbench/config/environment';
import moment from 'moment';
import _ from 'lodash';

export default Ember.Route.extend({
    dofusData: Ember.inject.service('dofus-data'),
    
    model() {
        const dofusData = this.get('dofusData');
        return new Ember.RSVP.Promise(resolve => {
            Ember.$.getJSON(`${ENV.dofusDataRepository}/almanax-data.json`, rawData => {
                resolve(_.mapValues(rawData, (rawAlmanax, day) => {
                    rawAlmanax['day'] = day;
                    let almanax = Ember.getOwner(this).lookup('object:almanax').deserialize(rawAlmanax);
                    almanax.set('questItem', dofusData.findItem(almanax.get('quest').replace(/^\d+ /, '')));
                    return almanax;
                }));
            });
        });
    },

    setupController(controller, model) {
        controller.set('daysMap', model);
        controller.set('current', moment());
        
        controller.set('model', Ember.A());
        
        controller.generateEvents(7 * 4);
    }
});
