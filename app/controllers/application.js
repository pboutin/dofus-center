import Ember from 'ember';
import ENV from 'dofus-workbench/config/environment';

export default Ember.Controller.extend({
    dataIssuesUrl: Ember.computed(function() {
        let title = 'Dofus Item : ';
        return `${ENV.dofusDataIssuesUrl}/new?title=${title}`;
    }),
    workbenchIssuesUrl: Ember.computed(function() {
        return `${ENV.dofusDataIssuesUrl}/new`;
    })
});
