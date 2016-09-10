import Ember from 'ember';

export default Ember.Route.extend({
    workbench: Ember.inject.service('workbench'),

    model(params) {
        let project = this.get('workbench').getProject(params.id);

        if (project) {
            project.initRessourcesItems();
            return project;
        }
        this.transitionTo('projects');
    }
});
