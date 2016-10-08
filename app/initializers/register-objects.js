import Item from '../objects/item';
import Quantifiable from '../objects/quantifiable';

export function initialize(app) {
    console.log('Init : Objects registration');

    app.register('object:item', Item, { singleton: false });
    app.register('object:quantifiable', Quantifiable, { singleton: false });
}

export default {
    name: 'register-objects',
    before: 'services-initialization',
    initialize
};
