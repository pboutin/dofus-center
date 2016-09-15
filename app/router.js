import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('projects', {path: '/'});
  this.route('prepare', {path: '/prepare/:id'});
  this.route('crafting', {path: '/crafting/:id'});
});

Router.reopen({
  location: 'hash'
});

export default Router;
