import Ember from 'ember';
import Project from '../objects/project';

export default Ember.Controller.extend({
    workbench: Ember.inject.service('workbench'),

    newProject: null,

    actions: {
        create() {
            this.set('newProject', new Project());
        },
        save() {
            let newProject = this.get('newProject');
            let workbench = this.get('workbench');

            newProject.initId();
            workbench.get('projects').pushObject(newProject);
            workbench.save();
            
            this.set('newProject', null);
        }
    }
});
