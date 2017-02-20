import Ember from 'ember';
import ENV from 'dofus-workbench/config/environment';
import runes from '../ressources/item-runes';
import _ from 'lodash/lodash';

export default Ember.Object.extend({
    id: '',
    name: '',
    searchableName: '',
    level: 0,
    type: '',
    link: '',
    recipe: {},
    effects: [],

    title: Ember.computed('name', 'level', function() {
        let name = this.get('name');
        let level = this.get('level');
        return `${name} (${level})`;
    }),

    image: Ember.computed('id', function() {
        let itemIntId = this.get('id').replace(/-.+/, '');
        return `${ENV.dofusDataRepository}/images/${itemIntId}.png`;
    }),

    isCraftable: Ember.computed('recipe', function() {
        return _.keys(this.get('recipe')).length > 0;
    }),

    hasEffects: Ember.computed('effects', function() {
        const effects = this.get('effects');
        if (effects === null) {
            return false;
        }
        return ! _.every(effects, isNaN);
    }),

    getEffectsList() {
        let effects = this.get('effects');

        if (effects === null) {
            return [];
        }

        let parsedEffects = [];
        let miscEffects = [];

        while (effects.length) {
            let effect = effects.shift();
            let rune = _.get(runes, effect, null);

            if (rune) {
                const perfectRoll = parseInt(effects.shift(), 10);
                const over = Math.floor(101 / rune.weight.bonus[0] * rune.effects[0]);
                const isBonus = perfectRoll > 0;
                parsedEffects.push({
                    isStatic: false,
                    effect: effect,
                    value: perfectRoll,
                    isBonus: isBonus,
                    max: (over > perfectRoll) && isBonus ? over : null,
                    runes: _.map(['Base', 'Pa', 'Ra'], (runeType, index) => {
                        if (rune.effects[index]) {
                            return {
                                type: runeType,
                                effect: rune.effects[index],
                                weight: (isBonus ? rune.weight.bonus : rune.weight.malus)[index]
                            };
                        }
                        return null;
                    })
                });
            } else {
                miscEffects.push({
                    isStatic: true,
                    effect: effect
                });
            }
        }
        return _.union(parsedEffects, miscEffects);
    },

    fakeFor(itemId) {
        this.set('id', itemId);
        this.set('name', _.trim(itemId.replace(/\d*\-/g, ' ')));
    }
});
