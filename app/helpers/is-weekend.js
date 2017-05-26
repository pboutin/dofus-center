import Ember from 'ember';
import moment from 'moment';

export function isWeekend(params) {
    let date = params[0];
    return ([0,6].indexOf(moment(date).day()) > -1);
}

export default Ember.Helper.helper(isWeekend);
