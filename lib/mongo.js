// Generated by CoffeeScript 1.9.0
var MongoConnector, MongoDB, Serializable, _;

_ = require('lodash')._;

Serializable = require('./serializable');

MongoConnector = require('loopback-connector-mongodb');

MongoDB = (function() {
  'use strict';
  MongoDB.prototype.exclude = [/^_+.*$/, /^indexes+$/, /^migrations+$/];

  function MongoDB(_at_dataSource, _at_db) {
    this.dataSource = _at_dataSource;
    this.db = _at_db;
  }

  MongoDB.prototype.getCollection = function(name, callback) {
    return this.db.collections.apply(this, arguments);
  };

  MongoDB.prototype.discoverCollections = function(callback) {
    var trees;
    trees = {};
    return this.db.collections((function(_this) {
      return function(e, cols) {
        var collection, done, _i, _len, _results;
        done = _.after(cols.length, function() {
          return callback(null, trees);
        });
        _results = [];
        for (_i = 0, _len = cols.length; _i < _len; _i++) {
          collection = cols[_i];
          _results.push(_this.deriveSchema(collection, function(e, tree) {
            var o;
            if (e != null) {
              return callback.apply(_this, arguments);
            }
            _.extend(trees, (o = {})[collection.s.name.split().pop()] = tree);
            return done();
          }));
        }
        return _results;
      };
    })(this));
  };

  MongoDB.prototype.listCollections = function(callback) {
    return this.db.collections((function(_this) {
      return function(e, cols) {
        return callback.apply(_this, e != null ? [e] : [
          null, _.map(_.pluck(cols, 's'), function(v) {
            return v.name;
          })
        ]);
      };
    })(this));
  };

  MongoDB.prototype.deriveSchema = function(collection, callback) {
    var compare, handler, tree, types;
    if (!((callback != null) && typeof callback === 'function')) {
      throw 'callback required as argument[1]';
    }
    types = {};
    tree = {};
    compare = function(a, b) {
      if (a[1] < b[1]) {
        return 1;
      }
      if (a[1] > b[1]) {
        return -1;
      }
      return 0;
    };
    handler = (function(_this) {
      return function(e, col) {
        if (e != null) {
          return typeof callback === "function" ? callback(e, null) : void 0;
        }
        return col.find({}, {}, function(e, res) {
          if (e != null) {
            return typeof callback === "function" ? callback(e) : void 0;
          }
          return res.toArray(function(e, arr) {
            var branch, field, key, record, tPair, type, value, _i, _len;
            for (_i = 0, _len = arr.length; _i < _len; _i++) {
              record = arr[_i];
              branch = (new Serializable(record)).serialize();
              for (key in branch) {
                value = branch[key];
                if (types[key] == null) {
                  types[key] = {};
                }
                types[key][value] = types[key][value] != null ? types[key][value] + 1 : 1;
              }
            }
            for (field in types) {
              type = types[field];
              tPair = _.pairs(type);
              if (tPair.length > 1) {
                tPair.sort(compare);
                type = (tPair[0][1] / tPair[1][1]) * 100 > 400 ? tPair[0][0] : 'Mixed';
              } else {
                type = tPair[0][0];
              }
              tree[field] = type;
            }
            return typeof callback === "function" ? callback(null, tree) : void 0;
          });
        });
      };
    })(this);
    if (typeof collection === 'string') {
      return this.getCollection(collection, handler);
    }
    if (typeof collection === 'object') {
      return handler(null, collection);
    }
    return callback('collection parameter was invalid');
  };

  MongoDB.prototype.createCollection = function(name, json, opts, callback) {
    if (typeof opts === 'function') {
      callback = arguments[2];
      opts = null;
    }
    return this.dataSource.createCollection.apply(this, arguments);
  };

  MongoDB.prototype.buildCollection = function(name, json, opts, callback) {
    if (typeof opts === 'function') {
      callback = arguments[2];
      opts = null;
    }
    return this.dataSource.buildCollection.apply(this, arguments);
  };

  return MongoDB;

})();

exports.initialize = (function(_this) {
  return function(dataSource, callback) {
    return MongoConnector.initialize(dataSource, function(e, db) {
      if (e != null) {
        return callback.apply(_this, arguments);
      }
      _.extend(dataSource, {
        ApiHero: new MongoDB(dataSource, db)
      });
      return callback.apply(_this, [null, db]);
    });
  };
})(this);