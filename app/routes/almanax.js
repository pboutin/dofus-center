import Ember from 'ember';
import moment from 'moment';
import Almanax from '../objects/almanax';
import almanaxData from '../ressources/almanax-data';

export default Ember.Route.extend({
    dofusData: Ember.inject.service('dofus-data'),
    
    model() {
        const dofusData = this.get('dofusData');
        let currentDate = moment();
        let upperBoundDate = moment().add(60, 'days');
        let model = Ember.A();

        do {
            const rawDate = currentDate.format('YYYY-MM-DD');
            let almanax = Almanax.create(almanaxData[rawDate]);
            almanax.set('date', rawDate);
            almanax.set('questItem', dofusData.findItem(almanax.get('quest').replace(/^\d+ /, '')));
            model.pushObject(almanax);
        } while(currentDate.add(1, 'days').isBefore(upperBoundDate));
        
        return model;
    }
});
