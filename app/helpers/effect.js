import Ember from 'ember';
import _ from 'lodash';

export function effect(params) {
    return _.get({
        'fo': 'Force',
        'ine': 'Intelligence',
        'agi': 'Agilité',
        'cha': 'Chance',
        'sa': 'Sagesse',
        'vi': 'Vitalité',
        'ini': 'Initiative',
        'pod': 'Pods',
        'pi_per': 'Puissance (pièges)',
        'prospe': 'Prospection',
        'pui': 'Puissance',
        're_cri': 'Résistance Critiques',
        're_eau': 'Résistance Eau',
        're_feu': 'Résistance Feu',
        're_neutre': 'Résistance Neutre',
        're_air': 'Résistance Air',
        're_terre': 'Résistance Terre',
        're_pou': 'Résistance Poussée',
        'do_air': 'Dommages Air',
        'do_cri': 'Dommages Critiques',
        'do_eau': 'Dommages Eau',
        'do_feu': 'Dommages Feu',
        'do_terre': 'Dommages Terre',
        'do_neutre': 'Dommages Neutre',
        'pi': 'Dommages Pièges',
        'do_pou': 'Dommages Poussée',
        'do_ren': 'Renvoie dommages',
        'do': 'Dommages',
        'fui': 'Fuite',
        'tac': 'Tacle',
        'ret_pa': 'Retrait PA',
        'ret_pme': 'Retrait PM',
        're_pa': 'Esquive PA',
        're_pme': 'Esquive PM',
        're_per_air': 'Résistance Air',
        're_per_eau': 'Résistance Eau',
        're_per_feu': 'Résistance Feu',
        're_per_neutre': 'Résistance Neutre',
        're_per_terre': 'Résistance Terre',
        'cri': 'Critique',
        'so': 'Soins',
        'invo': 'Invocations',
        'po': 'Portée',
        'ga_pa': 'PA',
        'ga_pme': 'PM'
    }, params[0], '');
}

export default Ember.Helper.helper(effect);
