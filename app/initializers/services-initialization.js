import Ember from 'ember';

export function initialize(app) {
    console.log('Init : Services initialization');
    app.deferReadiness();

    let container = app.__container__;
    container.lookup('service:dofus-data').initialize().then(function() {
        Ember.$('#loader').remove();
        app.advanceReadiness();
    });
}

export default {
    name: 'services-initialization',
    after: 'register-objects',
    initialize
};
