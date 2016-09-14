import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    projects: Ember.A(),

    initialize() {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve) {
            if (localStorage.projects) {
                let rawProjects = JSON.parse(localStorage.projects);
                _.forEach(rawProjects, self.pushRawProject.bind(self));
            }
            resolve();
        });
    },

    pushRawProject(rawProject) {
        let project = Ember.getOwner(this).lookup('object:project');
        project.deserialize(rawProject);

        if ( ! this.getProject(project.get('id'))) {
            this.get('projects').pushObject(project);
        }
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
