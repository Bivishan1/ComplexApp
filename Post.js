








//for all copy pasting brad codes here. 
const postsCollection = require('../db').db().collection("posts")
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const userCollection = require('../db').db().collection('users');

let Post = function(data, userid) {
  this.data = data
  this.error = []
  this.userid = userid
}

Post.prototype.cleanUp = function() {
  if (typeof(this.data.title) != "string") {this.data.title = ""}
  if (typeof(this.data.body) != "string") {this.data.body = ""}

//   // get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userid)
  }
}

Post.prototype.validate = function() {
  if (this.data.title == "") {this.error.push("You must provide a title.")}
  if (this.data.body == "") {this.error.push("You must provide post content.")}
}

Post.prototype.create = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.error.length) {
      // save post into database
      postsCollection.insertOne(this.data).then(() => {
        resolve()
      }).catch(() => {
        this.error.push("Please try again later.")
        reject(this.error)
      })
    } else {
      reject(this.error)
    }
  })
}

//Trying code from online forums 
Post.findSingleById = function(id) {
    return new Promise(async function(resolve, reject) {
      if (typeof(id) != "string" || !ObjectID.isValid(id)) {
        reject()
        return
      }
      let posts = await postsCollection.aggregate([
        {$match: {_id: new ObjectID(id)}},
        {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
        
      ]).toArray()
      
  
      if (posts.length) {
        console.log(posts[0])
        resolve(posts[0])
      } else {
        reject()
      }
    })
  }
  
  module.exports = Post

//Basic code
Post.findSingleById = function(id) {
    return new Promise(async function(resolve, reject) {
      if (typeof(id) != "string" || !ObjectID.isValid(id)) {
        reject()
        return
      }
      let posts = await postsCollection.aggregate([
        {$match: {_id: new ObjectID(id)}},
        {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
        
      ]).toArray()

      //clean up author property in each post object
      posts = posts.map (function(post) {
        post.author = {
          username: post.author.username,
          avatar : new User(post.author,true).avatar
        }
        
        return post
      })

  
      if (posts.length) {
        console.log(posts[0])
        resolve(posts[0])
      } else {
        reject()
      }
    })
  }
  
  module.exports = Post








// Post.findSingleById = function(id) {
//   return new Promise(async function(resolve, reject) {
//     if (typeof(id) != "string" || !ObjectID.isValid(id)) {
//       reject()
//       return
//     }
//     let posts = await postsCollection.aggregate([
//       {$match: {_id: new ObjectID(id)}},
//       {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
//       {$project: {
//         title: 1,
//         body: 1,
//         createdDate: 1,
//         author: {$arrayElemAt: ["$authorDocument", 0]}
//       }}
//     ]).toArray()

//     // clean up author property in each post object
//     posts = posts.map(function(post) {
//       post.author = {
//         username: post.author.username,
//         avatar: new User(post.author, true).avatar
//       }

//       return post
//     })

//     if (posts.length) {
//       console.log(posts[0])
//       resolve(posts[0])
//     } else {
//       reject()
//     }
//   })
// }

// module.exports = Post