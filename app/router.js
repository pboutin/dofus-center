import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('dashboard', {path: '/'});
  this.route('login');
  this.route('workbench', function() {
    this.route('projects');
    this.route('prepare', {path: 'prepare/:id'});
    this.route('crafting', {path: 'crafting/:id'});
    this.route('view', {path: 'view/:id'});
  });
});

Router.reopen({
  location: 'hash'
});

export default Router;
