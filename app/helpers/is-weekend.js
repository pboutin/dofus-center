import Ember from 'ember';

export function isWeekend(params/*, hash*/) {
    let moment = params[0];
    return ([0,6].indexOf(moment.day()) > -1);
}

export default Ember.Helper.helper(isWeekend);
