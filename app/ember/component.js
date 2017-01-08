import Ember from 'ember';

export default Ember.Component.reopen({
    didInsertElement() {
        let componentName = this.toString().match(/@component:(.+?):/)[1];
        Ember.$(this.get('element')).addClass(componentName);

        this._super(...arguments);
    }
});
