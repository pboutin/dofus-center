"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('dofus-workbench/app', ['exports', 'ember', 'dofus-workbench/resolver', 'ember-load-initializers', 'dofus-workbench/config/environment'], function (exports, _ember, _dofusWorkbenchResolver, _emberLoadInitializers, _dofusWorkbenchConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _dofusWorkbenchConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _dofusWorkbenchConfigEnvironment['default'].podModulePrefix,
    Resolver: _dofusWorkbenchResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _dofusWorkbenchConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('dofus-workbench/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'dofus-workbench/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _dofusWorkbenchConfigEnvironment) {

  var name = _dofusWorkbenchConfigEnvironment['default'].APP.name;
  var version = _dofusWorkbenchConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('dofus-workbench/components/fixed-panel', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        classNames: ['fixed-panel'],

        didInsertElement: function didInsertElement() {
            var $affix = this.$('div');
            $affix.affix({
                offset: {
                    top: $affix.offset().top - 20
                }
            }).on('affix.bs.affix', function () {
                var $this = _ember['default'].$(this);
                $this.width($this.parent().width());
            });
        }
    });
});
define('dofus-workbench/components/quantity-editor', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        classNames: ['quantity-editor'],

        workbench: _ember['default'].inject.service('workbench'),

        quantity: 0,
        target: 0,
        editableQuantity: 0,

        actions: {
            incrementBy: function incrementBy(quantity) {
                var target = this.get('target');
                var currentQuantity = this.get('quantity');
                var updatedQuantity = currentQuantity + quantity;
                this.set('quantity', updatedQuantity > target ? target : updatedQuantity);
            },
            decrementBy: function decrementBy(quantity) {
                var currentQuantity = this.get('quantity');
                var updatedQuantity = currentQuantity - quantity;
                this.set('quantity', updatedQuantity < 0 ? 0 : updatedQuantity);
            },
            maximise: function maximise() {
                this.set('quantity', this.get('target'));
            },
            clear: function clear() {
                this.set('quantity', 0);
            }
        },

        init: function init() {
            this.set('editableQuantity', this.get('quantity'));
            this._super.apply(this, arguments);
        },

        quantityObserver: _ember['default'].observer('quantity', function () {
            this.set('editableQuantity', this.get('quantity'));
            this.get('workbench').save();
        }),

        editableQuantityObserver: _ember['default'].observer('editableQuantity', function () {
            var editableQuantity = this.get('editableQuantity');
            if (!isNaN(editableQuantity)) {
                this.set('quantity', parseInt(editableQuantity, 10));
            }
        }),

        missing: _ember['default'].computed('quantity', 'target', function () {
            var missing = this.get('target') - this.get('quantity');
            return missing > 0 ? missing : 0;
        })
    });
});
define('dofus-workbench/controllers/crafting', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        dofusData: _ember['default'].inject.service('dofus-data'),
        workbench: _ember['default'].inject.service('workbench'),

        actions: {
            sendToWorkbench: function sendToWorkbench(quantifiableItem) {
                this.get('model').addToWishlist(quantifiableItem.get('item'), quantifiableItem.get('target'));
                this.get('workbench').save();
                this.get('model').initRessourcesItems();
            }
        }
    });
});
define('dofus-workbench/controllers/prepare', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        dofusData: _ember['default'].inject.service('dofus-data'),
        workbench: _ember['default'].inject.service('workbench'),

        filteredItems: [],
        query: '',

        actions: {
            add: function add(item) {
                this.get('model').addToWishlist(item);
                this.get('workbench').save();
            },
            remove: function remove(item) {
                this.get('model').removeFromWishlist(item);
                this.get('workbench').save();
            }
        },

        queryObserver: _ember['default'].observer('query', function () {
            var self = this;
            _ember['default'].run.debounce(this, function () {
                self.set('filteredItems', self.get('dofusData').getFilteredItemsFor(self.get('query')));
            }, 2000);
        })
    });
});
define('dofus-workbench/controllers/projects', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        workbench: _ember['default'].inject.service('workbench'),
        i18n: _ember['default'].inject.service('i18n'),

        newProject: null,
        serializedProject: null,

        actions: {
            create: function create() {
                this.set('newProject', _ember['default'].getOwner(this).lookup('object:project'));
            },
            save: function save() {
                var newProject = this.get('newProject');
                var workbench = this.get('workbench');

                newProject.initId();
                workbench.get('projects').pushObject(newProject);
                workbench.save();

                this.set('newProject', null);
            },
            cancel: function cancel() {
                this.set('newProject', null);
            },
            'delete': function _delete(project) {
                var confirmation = this.get('i18n').t('projects.delete_confirmation');
                if (confirm(confirmation + ' : "' + project.get('name') + '"')) {
                    var workbench = this.get('workbench');
                    workbench.get('projects').removeObject(project);
                    workbench.save();
                }
            },
            'export': function _export(project) {
                this.set('serializedProject', {
                    name: project.get('name'),
                    data: btoa(JSON.stringify(project.serialize()))
                });
            },
            closeSerializedProject: function closeSerializedProject() {
                this.set('serializedProject', null);
            },
            'import': function _import() {
                var serializedData = prompt(this.get('i18n').t('projects.import_prompt'));

                if (serializedData) {
                    var workbench = this.get('workbench');

                    try {
                        var rawProject = JSON.parse(atob(serializedData));
                        workbench.pushRawProject(rawProject);
                        workbench.save();
                    } catch (e) {
                        console.log('IMPORT ERROR : ', e);
                    }
                }
            }
        }
    });
});
define('dofus-workbench/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('dofus-workbench/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('dofus-workbench/helpers/t', ['exports', 'ember-i18n/helper'], function (exports, _emberI18nHelper) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nHelper['default'];
    }
  });
});
define('dofus-workbench/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'dofus-workbench/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _dofusWorkbenchConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_dofusWorkbenchConfigEnvironment['default'].APP.name, _dofusWorkbenchConfigEnvironment['default'].APP.version)
  };
});
define('dofus-workbench/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('dofus-workbench/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('dofus-workbench/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.ArrayController.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('dofus-workbench/initializers/export-application-global', ['exports', 'ember', 'dofus-workbench/config/environment'], function (exports, _ember, _dofusWorkbenchConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_dofusWorkbenchConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var value = _dofusWorkbenchConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_dofusWorkbenchConfigEnvironment['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('dofus-workbench/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('dofus-workbench/initializers/register-objects', ['exports', 'dofus-workbench/objects/project', 'dofus-workbench/objects/item', 'dofus-workbench/objects/quantifiable'], function (exports, _dofusWorkbenchObjectsProject, _dofusWorkbenchObjectsItem, _dofusWorkbenchObjectsQuantifiable) {
    exports.initialize = initialize;

    function initialize(app) {
        console.log('Init : Objects registration');

        app.register('object:project', _dofusWorkbenchObjectsProject['default'], { singleton: false });
        app.register('object:item', _dofusWorkbenchObjectsItem['default'], { singleton: false });
        app.register('object:quantifiable', _dofusWorkbenchObjectsQuantifiable['default'], { singleton: false });
    }

    exports['default'] = {
        name: 'register-objects',
        before: 'services-initialization',
        initialize: initialize
    };
});
define('dofus-workbench/initializers/services-initialization', ['exports', 'ember'], function (exports, _ember) {
    exports.initialize = initialize;

    function initialize(app) {
        console.log('Init : Services initialization');
        app.deferReadiness();

        var container = app.__container__;
        container.lookup('service:dofus-data').initialize().then(function () {
            container.lookup('service:workbench').initialize().then(function () {
                _ember['default'].$('#loader').remove();
                app.advanceReadiness();
            });
        });
    }

    exports['default'] = {
        name: 'services-initialization',
        after: 'register-objects',
        initialize: initialize
    };
});
define('dofus-workbench/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: _ember['default'].K
  };
});
define('dofus-workbench/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define("dofus-workbench/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define("dofus-workbench/locales/fr/config", ["exports"], function (exports) {
  // Ember-I18n includes configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports["default"] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };
});
define('dofus-workbench/locales/fr/translations', ['exports'], function (exports) {
    exports['default'] = {
        'app': {
            'data_warning': "Tous vos projets sont seulement stockés dans la mémoire locale de votre navigateur. Si vous supprimez vos données de navigation pour ce site, vous supprimerez par le fait même vos projets.",
            'copyrights': "Cette application a été développée indépendement d'Ankama Studio par Pascal Boutin (Infahemsi de Many). L'ensemble des images et animations utilisées dans cette application sont l'oeuvre et la propriété d'Ankama Studio."
        },
        'projects': {
            'title': "Vos projets",
            'new': "Créer un nouveau projet",
            'save': "Sauvegarder",
            'cancel': "Cancel",
            'name': "Nom du projet",
            'import': "Importer un projet",
            'close': "Fermer",
            'open': "Ouvrir",
            'export': "Exporter",
            'delete': "Supprimer",
            'delete_confirmation': "Êtes-vous sûr de vouloir supprimer le projet",
            'import_prompt': "Veuillez coller le texte du projet."
        },
        'prepare': {
            'manage': "Gestion du projet",
            'add_items': "Ajouter à votre projet",
            'search': "Rechercher...",
            'empty_project': "Votre projet est présentement vide",
            'your_project': "Votre projet",
            'back_to_projects': "Retourner à la liste des projets",
            'go_to_workbench': "Passer à l'atelier",
            'remove': "Retirer"
        },
        'crafting': {
            'workbench_for': "Atelier pour",
            'back_to_project': "Retourner à la préparation du projet",
            'your_project': "Votre projet",
            'ressources': "Les ressources",
            'send_to_workbench': "Envoyer à l'atelier"
        }

    };
});
define('dofus-workbench/objects/item', ['exports', 'ember', 'lodash/lodash'], function (exports, _ember, _lodashLodash) {
    exports['default'] = _ember['default'].Object.extend({
        id: '',
        name: '',
        searchableName: '',
        level: 0,
        type: '',
        image: '',
        link: '',
        recipe: {},

        deserialize: function deserialize(rawItem) {
            this.set('id', rawItem['id']);
            this.set('name', rawItem['name']);
            this.set('level', parseInt(rawItem['level'], 10));
            this.set('type', rawItem['type']);
            this.set('recipe', rawItem['recipe']);
            this.set('link', rawItem['link']);
            this.set('image', rawItem['image']);
        },

        isCraftable: _ember['default'].computed('recipe', function () {
            return _lodashLodash['default'].keys(this.get('recipe')).length > 0;
        })
    });
});
define('dofus-workbench/objects/project', ['exports', 'ember', 'lodash/lodash'], function (exports, _ember, _lodashLodash) {
    exports['default'] = _ember['default'].Object.extend({
        dofusData: _ember['default'].inject.service('dofus-data'),

        id: '',
        name: '',
        wishlist: {},
        stock: {},
        ressourcesItems: [],

        wishlistItems: _ember['default'].computed('wishlist', function () {
            return _lodashLodash['default'].values(this.get('wishlist'));
        }),

        initRessourcesItems: function initRessourcesItems() {
            var self = this;
            var wishlistItems = this.get('wishlistItems');
            var rawWishlist = this.get('wishlist');
            var dofusData = this.get('dofusData');
            var stock = this.get('stock');

            var ressourcesItems = _lodashLodash['default'].values(_lodashLodash['default'].reduce(wishlistItems, function (ressourcesMap, quantifiableItem) {
                _lodashLodash['default'].mapKeys(quantifiableItem.get('item.recipe'), function (ressourceQuantity, ressourceItemId) {
                    if (!_lodashLodash['default'].has(rawWishlist, ressourceItemId)) {
                        if (!_lodashLodash['default'].has(ressourcesMap, ressourceItemId)) {
                            var quantifiable = _ember['default'].getOwner(self).lookup('object:quantifiable');
                            quantifiable.set('item', dofusData.getItem(ressourceItemId));
                            quantifiable.set('quantity', _lodashLodash['default'].get(stock, ressourceItemId, 0));
                            ressourcesMap[ressourceItemId] = quantifiable;
                        }
                        ressourcesMap[ressourceItemId].increaseTargetOf(parseInt(ressourceQuantity, 10) * quantifiableItem.get('target'));
                    }
                });
                return ressourcesMap;
            }, {}));

            ressourcesItems = _lodashLodash['default'].sortBy(ressourcesItems, function (item) {
                return item.get('target') * -1;
            });
            this.set('ressourcesItems', ressourcesItems);
        },

        initId: function initId() {
            this.set('id', 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            }));
        },

        addToWishlist: function addToWishlist(item, quantity) {
            quantity = quantity || 1;

            var itemId = item.get('id');
            var wishlist = this.get('wishlist');

            if (!_lodashLodash['default'].has(wishlist, itemId)) {
                var quantifiable = _ember['default'].getOwner(this).lookup('object:quantifiable');
                quantifiable.set('item', item);
                wishlist[itemId] = quantifiable;
            }

            wishlist[itemId].increaseTargetOf(quantity);
            this.notifyPropertyChange('wishlist');
        },

        removeFromWishlist: function removeFromWishlist(item) {
            var itemId = item.get('id');
            var wishlist = this.get('wishlist');

            if (_lodashLodash['default'].has(wishlist, itemId)) {
                this.notifyPropertyChange('wishlist');
                delete wishlist[itemId];
            }
        },

        deserialize: function deserialize(rawProject) {
            var dofusData = this.get('dofusData');
            var self = this;

            this.set('id', rawProject.id);
            this.set('name', rawProject.name);
            this.set('wishlist', _lodashLodash['default'].mapValues(rawProject.wishlist, function (targetQuantity, itemId) {
                var quantifiable = _ember['default'].getOwner(self).lookup('object:quantifiable');
                quantifiable.set('item', dofusData.getItem(itemId));
                quantifiable.set('target', targetQuantity);
                return quantifiable;
            }));
            this.set('stock', rawProject.stock);
        },

        serialize: function serialize() {
            var stock = this.get('stock');
            var ressourcesItems = this.get('ressourcesItems');

            if (ressourcesItems.length > 0) {
                stock = _lodashLodash['default'].reduce(ressourcesItems, function (stockMap, ressourceItem) {
                    if (ressourceItem.get('quantity') > 0) {
                        stockMap[ressourceItem.get('item.id')] = ressourceItem.get('quantity');
                    }
                    return stockMap;
                }, {});
            }

            return {
                id: this.get('id'),
                name: this.get('name'),
                wishlist: _lodashLodash['default'].mapValues(this.get('wishlist'), function (quantifiable) {
                    return quantifiable.get('target');
                }),
                stock: stock
            };
        }
    });
});
define('dofus-workbench/objects/quantifiable', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Object.extend({
        item: null,
        quantity: 0,
        target: 0,

        increaseTargetOf: function increaseTargetOf(quantity) {
            this.set('target', this.get('target') + quantity);
        },

        progressWidthStyle: _ember['default'].computed('quantity', 'target', function () {
            var progress = this.get('quantity') / this.get('target') * 100;
            return _ember['default'].String.htmlSafe('width: ' + progress + '%');
        }),

        isComplete: _ember['default'].computed('quantity', 'target', function () {
            return this.get('quantity') >= this.get('target');
        })
    });
});
define('dofus-workbench/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('dofus-workbench/router', ['exports', 'ember', 'dofus-workbench/config/environment'], function (exports, _ember, _dofusWorkbenchConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _dofusWorkbenchConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('projects', { path: '/' });
    this.route('prepare', { path: '/prepare/:id' });
    this.route('crafting', { path: '/crafting/:id' });
  });

  exports['default'] = Router;
});
define('dofus-workbench/routes/crafting', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
        workbench: _ember['default'].inject.service('workbench'),

        model: function model(params) {
            var project = this.get('workbench').getProject(params.id);

            if (project) {
                project.initRessourcesItems();
                return project;
            }
            this.transitionTo('projects');
        }
    });
});
define('dofus-workbench/routes/prepare', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
        workbench: _ember['default'].inject.service('workbench'),

        model: function model(params) {
            var project = this.get('workbench').getProject(params.id);

            if (project) {
                return project;
            }
            this.transitionTo('projects');
        }
    });
});
define('dofus-workbench/routes/projects', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('dofus-workbench/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('dofus-workbench/services/dofus-data', ['exports', 'ember', 'dofus-workbench/config/environment', 'lodash/lodash'], function (exports, _ember, _dofusWorkbenchConfigEnvironment, _lodashLodash) {
    exports['default'] = _ember['default'].Service.extend({
        itemMap: {},

        initialize: function initialize() {
            var self = this;
            var itemMap = {};

            return new _ember['default'].RSVP.Promise(function (resolve) {
                _ember['default'].$.getJSON(_dofusWorkbenchConfigEnvironment['default'].dofusDataRepository + '/dofus-data.json', function (data) {
                    var baseUrl = data['metadata']['baseUrl'];

                    _lodashLodash['default'].mapKeys(data['data'], function (rawItem, itemId) {
                        rawItem['id'] = itemId;
                        rawItem['link'] = baseUrl + rawItem['link'];
                        rawItem['image'] = _dofusWorkbenchConfigEnvironment['default'].dofusDataRepository + '/images/' + itemId + '.png';
                        var item = _ember['default'].getOwner(self).lookup('object:item');
                        item.deserialize(rawItem);
                        item.set('searchableName', self._sanitize(item.get('name')));
                        itemMap[itemId] = item;
                    });

                    self.set('itemMap', itemMap);
                    console.log('Processed dofus-data');
                    resolve();
                });
            });
        },

        getItem: function getItem(itemId) {
            return _lodashLodash['default'].get(this.get('itemMap'), itemId);
        },

        getFilteredItemsFor: function getFilteredItemsFor(query) {
            var result = [];
            query = this._sanitize(query);

            _lodashLodash['default'].mapValues(this.get('itemMap'), function (item) {
                if (item.get('searchableName').indexOf(query) >= 0) {
                    result.push(item);
                }
            });
            return result;
        },

        _sanitize: function _sanitize(input) {
            input = _lodashLodash['default'].deburr(input.toLowerCase());
            input = _lodashLodash['default'].trim(input);
            return input.replace(/[^a-z\d:]/ig, []);
        }
    });
});
define('dofus-workbench/services/i18n', ['exports', 'ember-i18n/services/i18n'], function (exports, _emberI18nServicesI18n) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nServicesI18n['default'];
    }
  });
});
define('dofus-workbench/services/workbench', ['exports', 'ember', 'lodash/lodash'], function (exports, _ember, _lodashLodash) {
    exports['default'] = _ember['default'].Service.extend({
        projects: _ember['default'].A(),

        initialize: function initialize() {
            var self = this;

            return new _ember['default'].RSVP.Promise(function (resolve) {
                if (localStorage.projects) {
                    var rawProjects = JSON.parse(localStorage.projects);
                    _lodashLodash['default'].forEach(rawProjects, self.pushRawProject.bind(self));
                }
                resolve();
            });
        },

        pushRawProject: function pushRawProject(rawProject) {
            var project = _ember['default'].getOwner(this).lookup('object:project');
            project.deserialize(rawProject);

            if (!this.getProject(project.get('id'))) {
                this.get('projects').pushObject(project);
            }
        },

        getProject: function getProject(id) {
            return _lodashLodash['default'].find(this.get('projects').toArray(), function (project) {
                return project.get('id') === id;
            });
        },

        save: function save() {
            var rawProjects = _lodashLodash['default'].invoke(this.get('projects'), 'serialize');
            localStorage.projects = JSON.stringify(rawProjects);
        }
    });
});
define("dofus-workbench/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.5.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 9
          }
        },
        "moduleName": "dofus-workbench/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "alert alert-warning text-center");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("hr");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("footer");
        dom.setAttribute(el1, "class", "container text-center");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [6, 1]), 0, 0);
        return morphs;
      },
      statements: [["inline", "t", ["app.data_warning"], [], ["loc", [null, [2, 4], [2, 28]]]], ["content", "outlet", ["loc", [null, [5, 0], [5, 10]]]], ["inline", "t", ["app.copyrights"], [], ["loc", [null, [9, 7], [9, 29]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("dofus-workbench/templates/components/fixed-panel", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": false,
        "revision": "Ember@2.5.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "dofus-workbench/templates/components/fixed-panel.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 0, 0);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [1, 5], [1, 14]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("dofus-workbench/templates/components/quantity-editor", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 4
            }
          },
          "moduleName": "dofus-workbench/templates/components/quantity-editor.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("sup");
          dom.setAttribute(el1, "class", "text-warning");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["content", "missing", ["loc", [null, [4, 34], [4, 45]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
        },
        "revision": "Ember@2.5.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 20,
            "column": 0
          }
        },
        "moduleName": "dofus-workbench/templates/components/quantity-editor.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "details");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" / ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "btn-group-vertical");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-default btn-xs");
        var el3 = dom.createTextNode("+1");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-default btn-xs");
        var el3 = dom.createTextNode("-1");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "btn-group-vertical");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-default btn-xs");
        var el3 = dom.createTextNode("+10");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-default btn-xs");
        var el3 = dom.createTextNode("-10");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "btn-group-vertical");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-default btn-xs");
        var el3 = dom.createTextNode("max");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "class", "btn btn-default btn-xs");
        var el3 = dom.createTextNode("min");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(fragment, [2]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element1, [3]);
        var element4 = dom.childAt(fragment, [4]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element4, [3]);
        var element7 = dom.childAt(fragment, [6]);
        var element8 = dom.childAt(element7, [1]);
        var element9 = dom.childAt(element7, [3]);
        var morphs = new Array(9);
        morphs[0] = dom.createMorphAt(element0, 1, 1);
        morphs[1] = dom.createMorphAt(element0, 3, 3);
        morphs[2] = dom.createMorphAt(element0, 5, 5);
        morphs[3] = dom.createElementMorph(element2);
        morphs[4] = dom.createElementMorph(element3);
        morphs[5] = dom.createElementMorph(element5);
        morphs[6] = dom.createElementMorph(element6);
        morphs[7] = dom.createElementMorph(element8);
        morphs[8] = dom.createElementMorph(element9);
        return morphs;
      },
      statements: [["inline", "input", [], ["value", ["subexpr", "@mut", [["get", "editableQuantity", ["loc", [null, [2, 18], [2, 34]]]]], [], []], "type", "number", "class", "form-control"], ["loc", [null, [2, 4], [2, 71]]]], ["content", "target", ["loc", [null, [2, 74], [2, 84]]]], ["block", "if", [["get", "missing", ["loc", [null, [3, 10], [3, 17]]]]], [], 0, null, ["loc", [null, [3, 4], [5, 11]]]], ["element", "action", ["incrementBy", 1], [], ["loc", [null, [9, 43], [9, 69]]]], ["element", "action", ["decrementBy", 1], [], ["loc", [null, [10, 43], [10, 69]]]], ["element", "action", ["incrementBy", 10], [], ["loc", [null, [13, 43], [13, 70]]]], ["element", "action", ["decrementBy", 10], [], ["loc", [null, [14, 43], [14, 70]]]], ["element", "action", ["maximise"], [], ["loc", [null, [17, 43], [17, 64]]]], ["element", "action", ["clear"], [], ["loc", [null, [18, 43], [18, 61]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("dofus-workbench/templates/crafting", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 6,
              "column": 4
            }
          },
          "moduleName": "dofus-workbench/templates/crafting.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "t", ["crafting.back_to_project"], [], ["loc", [null, [5, 8], [5, 40]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 14,
                "column": 20
              },
              "end": {
                "line": 22,
                "column": 20
              }
            },
            "moduleName": "dofus-workbench/templates/crafting.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "list-group-item");
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "badge");
            var el3 = dom.createTextNode("\n                        × ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n                    ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("img");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element4 = dom.childAt(fragment, [1]);
            var element5 = dom.childAt(element4, [3]);
            var morphs = new Array(3);
            morphs[0] = dom.createMorphAt(dom.childAt(element4, [1]), 1, 1);
            morphs[1] = dom.createAttrMorph(element5, 'src');
            morphs[2] = dom.createMorphAt(element4, 5, 5);
            return morphs;
          },
          statements: [["content", "quantifiableItem.target", ["loc", [null, [17, 32], [17, 59]]]], ["attribute", "src", ["get", "quantifiableItem.item.image", ["loc", [null, [19, 39], [19, 66]]]]], ["content", "quantifiableItem.item.name", ["loc", [null, [20, 28], [20, 58]]]]],
          locals: ["quantifiableItem"],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 22,
                "column": 20
              },
              "end": {
                "line": 26,
                "column": 20
              }
            },
            "moduleName": "dofus-workbench/templates/crafting.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "list-group-item list-group-item-warning");
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
            return morphs;
          },
          statements: [["inline", "t", ["prepare.empty_project"], [], ["loc", [null, [24, 28], [24, 57]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 12
            },
            "end": {
              "line": 28,
              "column": 12
            }
          },
          "moduleName": "dofus-workbench/templates/crafting.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1, "class", "list-group icons-list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 1, 1);
          return morphs;
        },
        statements: [["inline", "t", ["crafting.your_project"], [], ["loc", [null, [11, 20], [11, 49]]]], ["block", "each", [["get", "model.wishlistItems", ["loc", [null, [14, 28], [14, 47]]]]], [], 0, 1, ["loc", [null, [14, 20], [26, 29]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 38,
                "column": 24
              },
              "end": {
                "line": 42,
                "column": 24
              }
            },
            "moduleName": "dofus-workbench/templates/crafting.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1, "class", "btn btn-warning btn-craft btn-xs");
            var el2 = dom.createTextNode("\n                                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createElementMorph(element0);
            morphs[1] = dom.createMorphAt(element0, 1, 1);
            return morphs;
          },
          statements: [["element", "action", ["sendToWorkbench", ["get", "quantifiableItem", ["loc", [null, [39, 104], [39, 120]]]]], [], ["loc", [null, [39, 77], [39, 122]]]], ["inline", "t", ["crafting.send_to_workbench"], [], ["loc", [null, [40, 32], [40, 66]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 34,
              "column": 16
            },
            "end": {
              "line": 52,
              "column": 16
            }
          },
          "moduleName": "dofus-workbench/templates/crafting.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "progress");
          var el3 = dom.createTextNode("\n                            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          var el4 = dom.createTextNode("\n                                ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4, "class", "sr-only");
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("%");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var element2 = dom.childAt(element1, [1]);
          var element3 = dom.childAt(element1, [9, 1]);
          var morphs = new Array(8);
          morphs[0] = dom.createAttrMorph(element1, 'class');
          morphs[1] = dom.createAttrMorph(element2, 'src');
          morphs[2] = dom.createMorphAt(element1, 3, 3);
          morphs[3] = dom.createMorphAt(element1, 5, 5);
          morphs[4] = dom.createMorphAt(element1, 7, 7);
          morphs[5] = dom.createAttrMorph(element3, 'class');
          morphs[6] = dom.createAttrMorph(element3, 'style');
          morphs[7] = dom.createMorphAt(dom.childAt(element3, [1]), 0, 0);
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["list-group-item ", ["subexpr", "if", [["get", "quantifiableItem.item.isCraftable", ["loc", [null, [35, 52], [35, 85]]]], "list-group-item-craftable"], [], ["loc", [null, [35, 47], [35, 115]]]]]]], ["attribute", "src", ["get", "quantifiableItem.item.image", ["loc", [null, [36, 35], [36, 62]]]]], ["content", "quantifiableItem.item.name", ["loc", [null, [37, 24], [37, 54]]]], ["block", "if", [["get", "quantifiableItem.item.isCraftable", ["loc", [null, [38, 30], [38, 63]]]]], [], 0, null, ["loc", [null, [38, 24], [42, 31]]]], ["inline", "quantity-editor", [], ["quantity", ["subexpr", "@mut", [["get", "quantifiableItem.quantity", ["loc", [null, [43, 51], [43, 76]]]]], [], []], "target", ["subexpr", "@mut", [["get", "quantifiableItem.target", ["loc", [null, [43, 84], [43, 107]]]]], [], []]], ["loc", [null, [43, 24], [43, 109]]]], ["attribute", "class", ["concat", ["progress-bar ", ["subexpr", "if", [["get", "quantifiableItem.isComplete", ["loc", [null, [46, 58], [46, 85]]]], "progress-bar-success", "progress-bar-warning"], [], ["loc", [null, [46, 53], [46, 133]]]]]]], ["attribute", "style", ["get", "quantifiableItem.progressWidthStyle", ["loc", [null, [47, 41], [47, 76]]]]], ["content", "quantifiableItem.progress", ["loc", [null, [48, 54], [48, 83]]]]],
        locals: ["quantifiableItem"],
        templates: [child0]
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 52,
              "column": 16
            },
            "end": {
              "line": 56,
              "column": 16
            }
          },
          "moduleName": "dofus-workbench/templates/crafting.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "list-group-item list-group-item-warning");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          return morphs;
        },
        statements: [["inline", "t", ["prepare.empty_project"], [], ["loc", [null, [54, 24], [54, 53]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.5.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 63,
            "column": 0
          }
        },
        "moduleName": "dofus-workbench/templates/crafting.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-4");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-8");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4, "class", "list-group list-group-lg icons-list-group");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element6 = dom.childAt(fragment, [0]);
        var element7 = dom.childAt(element6, [1]);
        var element8 = dom.childAt(element6, [5]);
        var element9 = dom.childAt(element8, [3]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(element7, 0, 0);
        morphs[1] = dom.createMorphAt(element7, 2, 2);
        morphs[2] = dom.createMorphAt(element6, 3, 3);
        morphs[3] = dom.createMorphAt(dom.childAt(element8, [1]), 1, 1);
        morphs[4] = dom.createMorphAt(dom.childAt(element9, [1]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(element9, [3]), 1, 1);
        morphs[6] = dom.createMorphAt(element6, 7, 7);
        return morphs;
      },
      statements: [["inline", "t", ["crafting.workbench_for"], [], ["loc", [null, [2, 8], [2, 38]]]], ["content", "model.name", ["loc", [null, [2, 39], [2, 53]]]], ["block", "link-to", ["prepare", ["get", "model.id", ["loc", [null, [4, 25], [4, 33]]]]], ["class", "btn btn-info"], 0, null, ["loc", [null, [4, 4], [6, 16]]]], ["block", "fixed-panel", [], [], 1, null, ["loc", [null, [10, 12], [28, 28]]]], ["inline", "t", ["crafting.ressources"], [], ["loc", [null, [31, 16], [31, 43]]]], ["block", "each", [["get", "model.ressourcesItems", ["loc", [null, [34, 24], [34, 45]]]]], [], 2, 3, ["loc", [null, [34, 16], [56, 25]]]], ["content", "outlet", ["loc", [null, [61, 4], [61, 14]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("dofus-workbench/templates/prepare", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 6,
              "column": 4
            }
          },
          "moduleName": "dofus-workbench/templates/prepare.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "t", ["prepare.back_to_projects"], [], ["loc", [null, [5, 8], [5, 40]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 16
            },
            "end": {
              "line": 29,
              "column": 16
            }
          },
          "moduleName": "dofus-workbench/templates/prepare.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "badge");
          var el3 = dom.createTextNode("\n                            lvl ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "badge");
          var el3 = dom.createTextNode("\n                            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [1]);
          var element4 = dom.childAt(element3, [5]);
          var morphs = new Array(6);
          morphs[0] = dom.createAttrMorph(element3, 'class');
          morphs[1] = dom.createElementMorph(element3);
          morphs[2] = dom.createMorphAt(dom.childAt(element3, [1]), 1, 1);
          morphs[3] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
          morphs[4] = dom.createAttrMorph(element4, 'src');
          morphs[5] = dom.createMorphAt(element3, 7, 7);
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["list-group-item ", ["subexpr", "unless", [["get", "item.isCraftable", ["loc", [null, [18, 60], [18, 76]]]], "list-group-item-dimmed"], [], ["loc", [null, [18, 51], [18, 103]]]]]]], ["element", "action", ["add", ["get", "item", ["loc", [null, [18, 120], [18, 124]]]]], [], ["loc", [null, [18, 105], [18, 126]]]], ["content", "item.level", ["loc", [null, [20, 32], [20, 46]]]], ["content", "item.type", ["loc", [null, [23, 28], [23, 41]]]], ["attribute", "src", ["get", "item.image", ["loc", [null, [26, 35], [26, 45]]]]], ["content", "item.name", ["loc", [null, [27, 24], [27, 37]]]]],
        locals: ["item"],
        templates: []
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 37,
                "column": 20
              },
              "end": {
                "line": 48,
                "column": 20
              }
            },
            "moduleName": "dofus-workbench/templates/prepare.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "list-group-item");
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2, "class", "badge");
            var el3 = dom.createTextNode("\n                                × ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n                            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("img");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "class", "btn btn-danger btn-xs btn-remove");
            var el3 = dom.createTextNode("\n                                ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n                            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [3]);
            var element2 = dom.childAt(element0, [7]);
            var morphs = new Array(5);
            morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
            morphs[1] = dom.createAttrMorph(element1, 'src');
            morphs[2] = dom.createMorphAt(element0, 5, 5);
            morphs[3] = dom.createElementMorph(element2);
            morphs[4] = dom.createMorphAt(element2, 1, 1);
            return morphs;
          },
          statements: [["content", "quantifiableItem.target", ["loc", [null, [40, 40], [40, 67]]]], ["attribute", "src", ["get", "quantifiableItem.item.image", ["loc", [null, [42, 39], [42, 66]]]]], ["content", "quantifiableItem.item.name", ["loc", [null, [43, 28], [43, 58]]]], ["element", "action", ["remove", ["get", "quantifiableItem.item", ["loc", [null, [44, 95], [44, 116]]]]], [], ["loc", [null, [44, 77], [44, 118]]]], ["inline", "t", ["prepare.remove"], [], ["loc", [null, [45, 32], [45, 54]]]]],
          locals: ["quantifiableItem"],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 48,
                "column": 20
              },
              "end": {
                "line": 52,
                "column": 20
              }
            },
            "moduleName": "dofus-workbench/templates/prepare.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "list-group-item list-group-item-warning");
            var el2 = dom.createTextNode("\n                            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
            return morphs;
          },
          statements: [["inline", "t", ["prepare.empty_project"], [], ["loc", [null, [50, 28], [50, 57]]]]],
          locals: [],
          templates: []
        };
      })();
      var child2 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 55,
                "column": 16
              },
              "end": {
                "line": 57,
                "column": 16
              }
            },
            "moduleName": "dofus-workbench/templates/prepare.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "t", ["prepare.go_to_workbench"], [], ["loc", [null, [56, 20], [56, 51]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 33,
              "column": 12
            },
            "end": {
              "line": 58,
              "column": 12
            }
          },
          "moduleName": "dofus-workbench/templates/prepare.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1, "class", "list-group icons-list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("hr");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 1, 1);
          morphs[2] = dom.createMorphAt(fragment, 7, 7, contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["inline", "t", ["prepare.your_project"], [], ["loc", [null, [34, 20], [34, 48]]]], ["block", "each", [["get", "model.wishlistItems", ["loc", [null, [37, 28], [37, 47]]]]], [], 0, 1, ["loc", [null, [37, 20], [52, 29]]]], ["block", "link-to", ["crafting", ["get", "model.id", ["loc", [null, [55, 38], [55, 46]]]]], ["class", "btn btn-success btn-block"], 2, null, ["loc", [null, [55, 16], [57, 28]]]]],
        locals: [],
        templates: [child0, child1, child2]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.5.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 64,
            "column": 0
          }
        },
        "moduleName": "dofus-workbench/templates/prepare.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-6");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "form-group");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "list-group icons-list-group");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-lg-6");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element5 = dom.childAt(fragment, [0]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element5, [5]);
        var element8 = dom.childAt(element7, [1]);
        var morphs = new Array(8);
        morphs[0] = dom.createMorphAt(element6, 0, 0);
        morphs[1] = dom.createMorphAt(element6, 2, 2);
        morphs[2] = dom.createMorphAt(element5, 3, 3);
        morphs[3] = dom.createMorphAt(dom.childAt(element8, [1]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(element8, [3]), 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element8, [5]), 1, 1);
        morphs[6] = dom.createMorphAt(dom.childAt(element7, [3]), 1, 1);
        morphs[7] = dom.createMorphAt(element5, 7, 7);
        return morphs;
      },
      statements: [["inline", "t", ["prepare.manage"], [], ["loc", [null, [2, 8], [2, 30]]]], ["content", "model.name", ["loc", [null, [2, 31], [2, 45]]]], ["block", "link-to", ["projects"], ["class", "btn btn-info"], 0, null, ["loc", [null, [4, 4], [6, 16]]]], ["inline", "t", ["prepare.add_items"], [], ["loc", [null, [10, 16], [10, 41]]]], ["inline", "input", [], ["value", ["subexpr", "@mut", [["get", "query", ["loc", [null, [13, 30], [13, 35]]]]], [], []], "placeholder", ["subexpr", "t", ["prepare.search"], [], ["loc", [null, [13, 48], [13, 68]]]], "class", "form-control"], ["loc", [null, [13, 16], [13, 91]]]], ["block", "each", [["get", "filteredItems", ["loc", [null, [17, 24], [17, 37]]]]], [], 1, null, ["loc", [null, [17, 16], [29, 25]]]], ["block", "fixed-panel", [], [], 2, null, ["loc", [null, [33, 12], [58, 28]]]], ["content", "outlet", ["loc", [null, [61, 4], [61, 14]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("dofus-workbench/templates/projects", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 11,
              "column": 4
            }
          },
          "moduleName": "dofus-workbench/templates/projects.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "class", "btn btn-primary");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "class", "btn btn-info");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element10 = dom.childAt(fragment, [1]);
          var element11 = dom.childAt(fragment, [3]);
          var morphs = new Array(4);
          morphs[0] = dom.createElementMorph(element10);
          morphs[1] = dom.createMorphAt(element10, 1, 1);
          morphs[2] = dom.createElementMorph(element11);
          morphs[3] = dom.createMorphAt(element11, 1, 1);
          return morphs;
        },
        statements: [["element", "action", ["create"], [], ["loc", [null, [5, 16], [5, 35]]]], ["inline", "t", ["projects.new"], [], ["loc", [null, [6, 12], [6, 32]]]], ["element", "action", ["import"], [], ["loc", [null, [8, 37], [8, 56]]]], ["inline", "t", ["projects.import"], [], ["loc", [null, [9, 12], [9, 35]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 4
            },
            "end": {
              "line": 25,
              "column": 4
            }
          },
          "moduleName": "dofus-workbench/templates/projects.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "form-inline");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "form-group");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2, "class", "btn btn-success btn-sm");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2, "class", "btn btn-default btn-sm");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element7 = dom.childAt(fragment, [1]);
          var element8 = dom.childAt(element7, [3]);
          var element9 = dom.childAt(element7, [5]);
          var morphs = new Array(5);
          morphs[0] = dom.createMorphAt(dom.childAt(element7, [1]), 1, 1);
          morphs[1] = dom.createElementMorph(element8);
          morphs[2] = dom.createMorphAt(element8, 1, 1);
          morphs[3] = dom.createElementMorph(element9);
          morphs[4] = dom.createMorphAt(element9, 1, 1);
          return morphs;
        },
        statements: [["inline", "input", [], ["value", ["subexpr", "@mut", [["get", "newProject.name", ["loc", [null, [14, 30], [14, 45]]]]], [], []], "placeholder", ["subexpr", "t", ["projects.name"], [], ["loc", [null, [15, 32], [15, 51]]]], "class", "form-control"], ["loc", [null, [14, 16], [16, 42]]]], ["element", "action", ["save"], [], ["loc", [null, [18, 20], [18, 37]]]], ["inline", "t", ["projects.save"], [], ["loc", [null, [19, 16], [19, 37]]]], ["element", "action", ["cancel"], [], ["loc", [null, [21, 20], [21, 39]]]], ["inline", "t", ["projects.cancel"], [], ["loc", [null, [22, 16], [22, 39]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 30,
              "column": 0
            },
            "end": {
              "line": 41,
              "column": 0
            }
          },
          "moduleName": "dofus-workbench/templates/projects.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "container");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h3");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "form-group");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("textarea");
          dom.setAttribute(el3, "rows", "10");
          dom.setAttribute(el3, "class", "form-control");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2, "class", "btn btn-info btn-sm");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("hr");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element5 = dom.childAt(fragment, [1]);
          var element6 = dom.childAt(element5, [5]);
          var morphs = new Array(4);
          morphs[0] = dom.createMorphAt(dom.childAt(element5, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(dom.childAt(element5, [3, 1]), 0, 0);
          morphs[2] = dom.createElementMorph(element6);
          morphs[3] = dom.createMorphAt(element6, 1, 1);
          return morphs;
        },
        statements: [["content", "serializedProject.name", ["loc", [null, [32, 12], [32, 38]]]], ["content", "serializedProject.data", ["loc", [null, [34, 53], [34, 79]]]], ["element", "action", ["closeSerializedProject"], [], ["loc", [null, [36, 44], [36, 79]]]], ["inline", "t", ["projects.close"], [], ["loc", [null, [37, 12], [37, 34]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 48,
                "column": 16
              },
              "end": {
                "line": 50,
                "column": 16
              }
            },
            "moduleName": "dofus-workbench/templates/projects.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "t", ["projects.open"], [], ["loc", [null, [49, 20], [49, 41]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.5.1",
            "loc": {
              "source": null,
              "start": {
                "line": 59,
                "column": 16
              },
              "end": {
                "line": 63,
                "column": 16
              }
            },
            "moduleName": "dofus-workbench/templates/projects.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1, "class", "image-item");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element0, 'src');
            morphs[1] = dom.createAttrMorph(element0, 'alt');
            return morphs;
          },
          statements: [["attribute", "src", ["get", "wishlistItemQuantifiable.item.image", ["loc", [null, [61, 31], [61, 66]]]]], ["attribute", "alt", ["get", "wishlistItemQuantifiable.item.name", ["loc", [null, [62, 39], [62, 73]]]]]],
          locals: ["wishlistItemQuantifiable"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.5.1",
          "loc": {
            "source": null,
            "start": {
              "line": 43,
              "column": 0
            },
            "end": {
              "line": 67,
              "column": 0
            }
          },
          "moduleName": "dofus-workbench/templates/projects.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "project");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "container");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "content");
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("h3");
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("                ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("button");
          dom.setAttribute(el4, "class", "btn btn-sm btn-info");
          var el5 = dom.createTextNode("\n                    ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("button");
          dom.setAttribute(el4, "class", "btn btn-sm btn-danger");
          var el5 = dom.createTextNode("\n                    ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "thumbnails");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1, 1]);
          var element2 = dom.childAt(element1, [1]);
          var element3 = dom.childAt(element2, [5]);
          var element4 = dom.childAt(element2, [7]);
          var morphs = new Array(7);
          morphs[0] = dom.createMorphAt(dom.childAt(element2, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(element2, 3, 3);
          morphs[2] = dom.createElementMorph(element3);
          morphs[3] = dom.createMorphAt(element3, 1, 1);
          morphs[4] = dom.createElementMorph(element4);
          morphs[5] = dom.createMorphAt(element4, 1, 1);
          morphs[6] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
          return morphs;
        },
        statements: [["content", "project.name", ["loc", [null, [47, 20], [47, 36]]]], ["block", "link-to", ["prepare", ["get", "project.id", ["loc", [null, [48, 37], [48, 47]]]]], ["class", "btn btn-sm btn-primary"], 0, null, ["loc", [null, [48, 16], [50, 28]]]], ["element", "action", ["export", ["get", "project", ["loc", [null, [51, 70], [51, 77]]]]], [], ["loc", [null, [51, 52], [51, 79]]]], ["inline", "t", ["projects.export"], [], ["loc", [null, [52, 20], [52, 43]]]], ["element", "action", ["delete", ["get", "project", ["loc", [null, [54, 72], [54, 79]]]]], [], ["loc", [null, [54, 54], [54, 81]]]], ["inline", "t", ["projects.delete"], [], ["loc", [null, [55, 20], [55, 43]]]], ["block", "each", [["get", "project.wishlistItems", ["loc", [null, [59, 24], [59, 45]]]]], [], 1, null, ["loc", [null, [59, 16], [63, 25]]]]],
        locals: ["project"],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.5.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 69,
            "column": 10
          }
        },
        "moduleName": "dofus-workbench/templates/projects.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("hr");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element12 = dom.childAt(fragment, [0]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(element12, [1]), 0, 0);
        morphs[1] = dom.createMorphAt(element12, 3, 3);
        morphs[2] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[3] = dom.createMorphAt(fragment, 6, 6, contextualElement);
        morphs[4] = dom.createMorphAt(fragment, 8, 8, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["inline", "t", ["projects.title"], [], ["loc", [null, [2, 8], [2, 30]]]], ["block", "unless", [["get", "newProject", ["loc", [null, [4, 14], [4, 24]]]]], [], 0, 1, ["loc", [null, [4, 4], [25, 15]]]], ["block", "if", [["get", "serializedProject", ["loc", [null, [30, 6], [30, 23]]]]], [], 2, null, ["loc", [null, [30, 0], [41, 7]]]], ["block", "each", [["get", "workbench.projects", ["loc", [null, [43, 8], [43, 26]]]]], [], 3, null, ["loc", [null, [43, 0], [67, 9]]]], ["content", "outlet", ["loc", [null, [69, 0], [69, 10]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define('dofus-workbench/utils/i18n/compile-template', ['exports', 'ember-i18n/utils/i18n/compile-template'], function (exports, _emberI18nUtilsI18nCompileTemplate) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nUtilsI18nCompileTemplate['default'];
    }
  });
});
define('dofus-workbench/utils/i18n/missing-message', ['exports', 'ember-i18n/utils/i18n/missing-message'], function (exports, _emberI18nUtilsI18nMissingMessage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nUtilsI18nMissingMessage['default'];
    }
  });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('dofus-workbench/config/environment', ['ember'], function(Ember) {
  var prefix = 'dofus-workbench';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("dofus-workbench/app")["default"].create({"name":"dofus-workbench","version":"0.0.0+36e4f624"});
}

/* jshint ignore:end */
//# sourceMappingURL=dofus-workbench.map