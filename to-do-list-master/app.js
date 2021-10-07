//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1  = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit the + button to add an item"
});
const item3 = new Item({
  name: "<--- Hit this to delete an item"
});


const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {



Item.find({}, function(err,foundItems){

if(foundItems.length === 0)
{


  Item.insertMany(defaultItems, function(err){
    if(err)
    console.log(err);
    else
    console.log("successfully saved")
  });
  res.redirect("/");
}

  else
  res.render("list", {listTitle: "Today", newListItems: foundItems});
})



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
const listName = req.body.list;
const item = new Item({
  name : itemName
});


if(listName === "Today"){
  item.save();
  res.redirect("/");
}
else{

  List.findOne({name:listName}, function(err,found){
    found.items.push(item);
    found.save();

    res.redirect("/"+listName);

  })
  const list = new List({
    name: listName,

  });
  list.save();
}


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //      res.redirect("/");
  //}
});

app.post("/delete", function(req,res){
//  console.log(req.body.checkbox);
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today")
{
  Item.findByIdAndRemove(req.body.checkbox,function(err){
    if(err)
    console.log(err);
    else
    console.log("success");

    res.redirect("/");
});
}
else{
  List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemId}}},function(err,found){
    if(!err)
    res.redirect("/"+listName);
  });
}


});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:param",function(req,res){
  //_.capitalize('param');
const param=_.capitalize(req.params.param);

List.findOne({name: param},function(err,found){
  if(!err)
  {
    if(!found)
    {

      //create a new list
      const list = new List({
        name : param,
        items : defaultItems
      });
      list.save();
      res.redirect("/param");
    }
  //  console.log("doesn't exist!");
    else
    {
      //show an existing list
      res.render("list", {listTitle:found.name , newListItems: found.items})
    }
  //  console.log("exists!");
  }
})




})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
