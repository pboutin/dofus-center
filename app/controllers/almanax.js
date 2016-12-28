import Ember from 'ember';

export default Ember.Controller.extend({
    daysMap: null,
    current: null,

    actions: {
        addDays(count) {
            this.generateEvents(count);
        }
    },

    generateEvents(count) {
        const daysMap = this.get('daysMap');
        let events = this.get('model');
        let current = this.get('current');

        while (count-- > 0) {
            events.pushObject({
                almanax: daysMap[current.format('MM-DD')],
                moment: current.clone()
            });
            current.add(1, 'd');
        }
    }
});
