const express = require("express");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const mongoose = require("mongoose");
const async = require("hbs/lib/async");

// the post schema
const postSchema = mongoose.Schema({
  img: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return (
          value.match(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*\.(jpeg|jpg|gif|png)$)/
          ) !== null
        );
      },
      message: () => {
        return "The URL is not valid";
      },
    },
  },
  title: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 35,
  },
  body: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 225,
  },
});

// the post model
const Post = mongoose.model("Post", postSchema);

// connection to mongodb
mongoose.connect("mongodb://localhost/my-db");

// create the express app
const app = express();

// tell express about the body parser
app.use(bodyParser.urlencoded({ extended: true }));
// tell express app about the public folder
app.use(express.static("public"));
// tell express about the render engine
app.set("view engine", "hbs");
// tell express about where our templates are
app.set("views", `${__dirname}/views`);
// tell handlebars about the partials folder
hbs.registerPartials(`${__dirname}/views/partials`);
// concatenation function for handlebars. Doesn't exists in hbs by default, and must be manually added.
hbs.registerHelper("concat", function () {
  let outStr = "";
  for (let arg in arguments) {
    if (typeof arguments[arg] != "object") {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

// empty array to hold the posts
const posts = [];

// a simple express route
app.get("/", (req, res) => {
  res.render("home");
});

// add post route
app.get("/addPost", (req, res) => {
  res.render("addPost", { title: "Add post" });
});

// posts route
app.get("/posts", async (req, res) => {
  // getting the posts
  const posts = await getPosts();
  // sending the posts page
  res.render("posts", { title: "Posts", posts });
});

// route for submitting a post
app.post("/submitPost", async (req, res) => {
  // getting the post info from the form
  const post = req.body;
  // put it inside of mongoDB
  const result = await addPost(post);
  if (result.errors) {
    res.render("addPost", { title: "Add post", errors: result.errors });
  } else {
    res.render("addPost", { title: "Add post", data: result.data });
  }
  // redirects you to the addPost page.
  /* res.redirect("/addPost"); */
});

// route to update a post
app.post("/submitUpdatePost/:id", async (req, res) => {
  // get the data from the form
  const post = req.body;
  // get the id from the url
  const id = req.params.id;
  // get the post from mongodb
  const postFromDb = await Post.findById(id);
  // update the post fields
  postFromDb.img = post.img;
  postFromDb.title = post.title;
  postFromDb.body = post.body.trim();
  // save the post to mongodb
  await postFromDb.save();
  res.redirect("/posts");
});

// route for deleting a specific post using it's id
app.post("/deletePost/:id", async (req, res) => {
  // get the id from the route
  const id = req.params.id;
  // delete the post
  await deletePost(id);
  res.redirect("/posts");
});

app.post("/editPost/:id", async (req, res) => {
  // get the id from the route
  const id = req.params.id;
  // find the post in mongoDB
  const post = await Post.findById(id);
  res.render("editPost", { id, post });
});

// function to add a post to mongoDB
async function addPost(post) {
  const result = {};
  try {
    result.data = await Post.create(post);
  } catch (error) {
    result.errors = Object.values(error.errors).map((value) => value.message);
  }
  return result;
}

// function to get posts from mongoDB
async function getPosts() {
  try {
    const posts = await Post.find();
    return posts;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// function for deleting a post
async function deletePost(id) {
  try {
    await Post.findByIdAndDelete(id);
  } catch (error) {
    console.log(error);
  }
}

// listening to requestes
app.listen(5005);
