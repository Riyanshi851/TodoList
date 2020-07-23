//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ =require("lodash");

const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://admin-riyanshi29:Test123@cluster0.dqv4c.mongodb.net/todoDB?retryWrites=true&w=majority");

const itemSchema=new mongoose.Schema({
  name: String
});

const Item =mongoose.model("Item", itemSchema);

const first=new Item({
  name:"Task 1"
});

const second=new Item({
  name:"Task 2"
});

const third=new Item({
  name:"Task 3"
});

const listSchema=new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List=mongoose.model("List", listSchema);


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length ===0){
      Item.insertMany([first,second,third], function(err){
        if (err){
          console.log(err);
        }
        else{
          console.log("Success");
        }
      });
      res.redirect("/");
    }
    res.render("list", {listTitle: day, newListItems: foundItems});
  });
  const day = date.getDate();



});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listName=req.body.listName;
  console.log(listName);
  const newTask=new Item({
    name: itemname
  });
  if (listName===date.getDate()){
      newTask.save();
      res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(newTask);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

  });

app.post("/delete", function(req,res){
  const removeItem=req.body.checkbox;
  const listName=req.body.listname;
  if (listName===date.getDay()){
    Item.findByIdAndRemove(removeItem, function(err){
      if (err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id : removeItem}}}, function(err, foundList){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
          res.redirect("/" + listName);
      }
    });

  }

});



app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
      //Create a new
      const list=new List({
        name: customListName,
        items:[first,second,third]
      });
      list.save();
      res.redirect("/"+ customListName);
      }
      else{
        //Show the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  const list = new List({
    name: customListName,
    items: [first,second,third]
  });
  list.save();
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
