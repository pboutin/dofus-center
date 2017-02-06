import _ from 'lodash/lodash';

export default function(input) {
    input = _.deburr(input.toLowerCase());
    input = _.trim(input);
    return input.replace(/[^a-z\d:]/ig, []);
}
