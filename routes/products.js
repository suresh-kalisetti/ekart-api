var express = require("express");
var router = express.Router();
var db = require("../public/javascripts/DbModule");

router.get("/", function(req, res) {
  db.FetchProducts(function(result) {
    res.send(result);
  });
});

router.get("/:id", function(req, res) {
  var id = req.params.id;
  db.FetchProductDetails(id, function(result) {
    res.send(result);
  });
});

router.post("/addtocart", function(req, res) {
  var email = req.body.email;
  var item = req.body.item;
  db.AddToCart(email, item, function(result) {
    res.send(result);
  });
});

router.post("/savecart", function(req, res) {
  var email = req.body.email;
  var cart = req.body.item;
  db.SaveCart(email, cart, function() {
    res.send({ success: true });
  });
});

router.post("/removeitem", function(req, res) {
  var email = req.body.email;
  var _id = req.body._id;
  db.RemoveItem(email, _id, function(result) {
    res.send(result);
  });
});

module.exports = router;
