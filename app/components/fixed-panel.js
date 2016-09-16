import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['fixed-panel'],

    offset: 0,

    didInsertElement() {
        const $affix = this.$('div');
        const offset = $affix.offset().top - 20;

        this.set('offset', offset);

        $affix.affix({
            offset: {
                top: offset
            }
        }).on('affix.bs.affix', function() {
            const $this = Ember.$(this);
            $this.width($this.parent().width());
        });

        this.$().on('DOMSubtreeModified', this._refreshAffix.bind(this));
        Ember.$(window).on('resize', this._refreshAffix.bind(this));
        this._refreshAffix();
    },

    willDestroyElement() {
        Ember.$(window).off('resize');
    },

    _refreshAffix() {
        const $affix = this.$('div');
        
        if (($affix.height() + this.get('offset')) > window.innerHeight) {
            $affix.addClass('affix-disabled');
        } else {
            $affix.removeClass('affix-disabled');
        }
    }
});
