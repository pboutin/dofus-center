import Ember from 'ember';

export function initialize(app) {
    app.deferReadiness();

    let container = app.__container__;
    container.lookup('service:dofus-data').initialize().then(function() {
        container.lookup('service:workbench').initialize().then(function() {
            Ember.$('#loader').remove();
            app.advanceReadiness();
        });
    });
}

export default {
    name: 'application',
    initialize
};
