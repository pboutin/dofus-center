import Ember from 'ember';

export default Ember.Controller.extend({
    i18n: Ember.inject.service('i18n'),

    newProject: null,

    actions: {
        create() {
            this.set('newProject', this.get('store').createRecord('project', {
                userId: this.get('session.uid')
            }));
        },
        save() {
            let newProject = this.get('newProject');
            newProject.save().then(function(savedProject) {
                this.set('newProject', null);
                this.transitionToRoute('prepare', savedProject.get('id'));
            }.bind(this));
        },
        cancel() {
            this.set('newProject', null);
        },
        delete(project) {
            let confirmation = this.get('i18n').t('projects.delete_confirmation');
            if (confirm(`${confirmation} : "${project.get('name')}"`)) {
                project.destroyRecord();
            }
        }
    }
});
