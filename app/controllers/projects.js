import Ember from 'ember';

export default Ember.Controller.extend({
    workbench: Ember.inject.service('workbench'),

    newProject: null,

    actions: {
        create() {
            this.set('newProject', Ember.getOwner(this).lookup('object:project'));
        },
        save() {
            let newProject = this.get('newProject');
            let workbench = this.get('workbench');

            newProject.initId();
            workbench.get('projects').pushObject(newProject);
            workbench.save();
            
            this.set('newProject', null);
        },
        cancel() {
            this.set('newProject', null);
        }
    }
});
