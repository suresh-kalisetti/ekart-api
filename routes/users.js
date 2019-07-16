var express = require("express");
var router = express.Router();
var db = require("../public/javascripts/DbModule");

router.post("/register", function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  db.CheckEmail(email, function(result) {
    if (result.length > 0) {
      res.send({ success: false, error: "Email already exists!" });
    } else {
      db.CreateUser(name, email, password, function(inserted) {
        if (inserted) {
          res.send({ success: true });
        } else {
          res.send({
            success: false,
            error: "something went wrong, please try again!"
          });
        }
      });
    }
  });
});

router.post("/login", function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  db.AuthenticateUser(email, password, function(result) {
    if (result.length > 0) {
      res.send({ success: true, data: result[0] });
    } else {
      res.send({
        success: false,
        error: "Invalid credentials, please try again!"
      });
    }
  });
});

router.post("/updateprofile", function(req, res) {
  var email = req.body.email;
  db.UpdateProfile(email, req.body, function(result) {
    res.send({ success: true });
  });
});

router.post("/updateaddress", function(req, res) {
  var email = req.body.data.email;
  var address = req.body.data.address;
  if (address.id == 0) {
    //new address
    db.GetMaxAddressId(email, function(nextid) {
      address.id = nextid;
      db.AddNewAddress(email, address, function(result) {
        res.send({ success: true, result });
      });
    });
  } else {
    //update old address
    db.UpdateExistingAddress(email, address, function(result) {
      res.send({ success: true, result });
    });
  }
});

router.post("/deleteaddress", function(req, res) {
  var email = req.body.email;
  var id = req.body.id;
  db.DeleteAddress(email, id, function(result) {
    res.send({ success: true, result });
  });
});

module.exports = router;
