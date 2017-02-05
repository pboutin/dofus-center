import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('dashboard', {path: '/'});
  this.route('login');
  this.route('workbench', function() {
    this.route('projects', {path: '/'});
    this.route('prepare', {path: 'prepare/:id'});
    this.route('crafting', {path: 'crafting/:id'});
  });
  this.route('almanax');
  this.route('magebench', function() {
      this.route('search', {path: '/'});
      this.route('item', {path: ':id'});
  });
  this.route('ocre');
});

Router.reopen({
  location: 'hash'
});

export default Router;
