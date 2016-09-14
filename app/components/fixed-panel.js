import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['fixed-panel'],

    didInsertElement() {
        const $affix = this.$('div');
        $affix.affix({
            offset: {
                top: $affix.offset().top - 20
            }
        }).on('affix.bs.affix', function() {
            const $this = $(this);
            $this.width($this.parent().width());
        });
    }
});
