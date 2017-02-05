import Ember from 'ember';

export function percentWidth(params/*, hash*/) {
    let value = params[0] * 100;
    return Ember.String.htmlSafe(`width: ${value}%`);
}

export default Ember.Helper.helper(percentWidth);
