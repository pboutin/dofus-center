import Ember from 'ember';

export default Ember.Controller.extend({
    workbench: Ember.inject.service('workbench'),
    i18n: Ember.inject.service('i18n'),

    newProject: null,
    serializedProject: null,

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
        },
        delete(project) {
            let confirmation = this.get('i18n').t('projects.delete_confirmation');
            if (confirm(`${confirmation} : "${project.get('name')}"`)) {
                let workbench = this.get('workbench');
                workbench.get('projects').removeObject(project);
                workbench.save();
            }
        },
        export(project) {
            this.set('serializedProject', {
                name: project.get('name'),
                data: btoa(JSON.stringify(project.serialize()))
            });
        },
        closeSerializedProject() {
            this.set('serializedProject', null);
        },
        import() {
            let serializedData = prompt(this.get('i18n').t('projects.import_prompt'));

            if (serializedData) {
                let workbench = this.get('workbench');

                try {
                    let rawProject = JSON.parse(atob(serializedData));
                    workbench.pushRawProject(rawProject);
                    workbench.save();
                } catch (e) {
                    console.log('IMPORT ERROR : ', e);
                }
            }
        }
    }
});
