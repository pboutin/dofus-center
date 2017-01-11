import Ember from 'ember';

export default Ember.Route.extend({
    dofusData: Ember.inject.service('dofus-data'),

    model(params) {
        return this.get('dofusData').getItem(params.id);
    },
    setupController(controller, model) {
        controller.set('model', model);
        controller.set('effects', model.getEffectsList());
    }
});
