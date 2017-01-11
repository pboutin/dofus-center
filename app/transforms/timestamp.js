import DS from 'ember-data';
import moment from 'moment';

export default DS.Transform.extend({
    deserialize(timestamp) {
        if (timestamp) {
            return moment.unix(timestamp);
        }
        return moment();
    },

    serialize() {
        return moment().unix();
    }
});
