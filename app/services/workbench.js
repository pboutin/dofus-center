import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    projects: Ember.A(),

    initialize() {
        let projects = this.get('projects');
        let self = this;

        return new Ember.RSVP.Promise(function(resolve) {
            if (localStorage.projects) {
                let rawProjects = JSON.parse(localStorage.projects);
                _.forEach(rawProjects, function (rawProject) {
                    let project = Ember.getOwner(self).lookup('object:project');
                    project.deserialize(rawProject);
                    projects.pushObject(project);
                });
            }
            resolve();
        });
    },

    getProject(id) {
        return _.find(this.get('projects').toArray(), function(project) {
            return project.get('id') === id;
        });
    },

    save() {
        var rawProjects = _.invoke(this.get('projects'), 'serialize');
        localStorage.projects = JSON.stringify(rawProjects);
    }
});
