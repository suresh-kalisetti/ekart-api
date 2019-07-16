var mongojs = require("mongojs");
var db = mongojs("localhost:27017/ekart", ["products", "users"]);
var ObjectId = require("mongodb").ObjectID;

exports.CheckEmail = function(email, callback) {
  db.users.find({ email }, function(err, result) {
    if (err) {
      throw err;
    }
    callback(result);
  });
};

exports.CreateUser = function(name, email, password, callback) {
  db.users.insert({ name, email, password, addresses: [], cart: [] }, function(
    err,
    inserted
  ) {
    if (err) {
      throw err;
    }
    callback(inserted);
  });
};

exports.AuthenticateUser = function(email, password, callback) {
  db.users.find(
    { email: email, password: password },
    { _id: 0, password: 0 },
    function(err, result) {
      if (err) {
        throw err;
      }
      callback(result);
    }
  );
};

exports.UpdateProfile = function(email, data, callback) {
  db.users.update({ email: email }, { $set: data }, function(err, result) {
    if (err) {
      throw err;
    }
    callback();
  });
};

exports.GetMaxAddressId = function(email, callback) {
  db.users.find({ email: email }, { _id: 0, addresses: 1 }, function(
    err,
    result
  ) {
    if (err) {
      throw err;
    }
    var maxid = 0;
    result[0].addresses.forEach(address => {
      if (maxid < address.id) {
        maxid = address.id;
      }
    });
    callback(maxid + 1);
  });
};

exports.GetAddresses = function(email, callback) {
  db.users.find({ email: email }, { _id: 0, addresses: 1 }, function(
    err,
    result
  ) {
    if (err) {
      throw err;
    }
    callback(result);
  });
};

exports.AddNewAddress = function(email, address, callback) {
  db.users.update({ email: email }, { $push: { addresses: address } }, function(
    err,
    result
  ) {
    if (err) {
      throw err;
    }
    exports.GetAddresses(email, function(result) {
      callback(result);
    });
  });
};

exports.UpdateExistingAddress = function(email, address, callback) {
  db.users.update(
    { email: email, "addresses.id": address.id },
    { $set: { "addresses.$": address } },
    function(err, result) {
      if (err) {
        throw err;
      }
      exports.GetAddresses(email, function(result) {
        callback(result);
      });
    }
  );
};

exports.DeleteAddress = function(email, id, callback) {
  db.users.update(
    { email: email },
    { $pull: { addresses: { id: id } } },
    function(err, result) {
      if (err) {
        throw err;
      }
      exports.GetAddresses(email, function(result) {
        callback(result);
      });
    }
  );
};

exports.FetchProducts = function(callback) {
  db.products.find({}, { _id: 1, displayName: 1, image: 1 }, function(
    err,
    result
  ) {
    if (err) {
      throw err;
    }
    callback(result);
  });
};

exports.FetchProductDetails = function(_id, callback) {
  db.products.find({ _id: ObjectId(_id) }, function(err, result) {
    if (err) {
      throw err;
    }
    callback(result[0]);
  });
};

exports.GetUpdatedCart = function(email, callback) {
  db.users.find({ email: email }, { _id: 0, cart: 1 }, function(err, result) {
    if (err) {
      throw err;
    }
    callback(result);
  });
};

exports.AddToCart = function(email, item, callback) {
  db.users.find(
    { email: email, "cart._id": item._id },
    { _id: 0, "cart.$": 1 },
    function(err, result) {
      if (err) {
        throw err;
      }
      if (result.length == 0) {
        //Add new item
        db.users.update({ email: email }, { $push: { cart: item } }, function(
          err,
          result
        ) {
          exports.GetUpdatedCart(email, function(result) {
            callback(result);
          });
        });
      } else {
        //update existing item
        var oldquantity = Number(result[0].cart[0].quantity);
        item.quantity = oldquantity + Number(item.quantity);
        db.users.update(
          { email: email, "cart._id": item._id },
          { $set: { "cart.$": item } },
          function(err, result) {
            if (err) {
              throw err;
            }
            exports.GetUpdatedCart(email, function(result) {
              callback(result);
            });
          }
        );
      }
    }
  );
};

exports.SaveCart = function(email, cart, callback) {
  db.users.update({ email: email }, { $set: { cart: cart } }, function(
    err,
    result
  ) {
    if (err) {
      throw err;
    }
    callback();
  });
};

exports.RemoveItem = function(email, _id, callback) {
  db.users.update({ email: email }, { $pull: { cart: { _id: _id } } }, function(
    err,
    result
  ) {
    if (err) {
      throw err;
    }
    exports.GetUpdatedCart(email, function(result) {
      callback(result);
    });
  });
};
