import Ember from 'ember';
import Project from '../objects/project';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    dofusData: Ember.inject.service('dofus-data'),

    projects: Ember.A(),

    initialize() {
        let projects = this.get('projects');
        let rawProjects = JSON.parse(localStorage.projects);
        let dofusData = this.get('dofusData');

        return new Ember.RSVP.Promise(function(resolve) {
            if (localStorage.projects) {
                _.forEach(rawProjects, function (rawProject) {
                    let project = new Project();
                    project.deserialize(rawProject, dofusData);
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
