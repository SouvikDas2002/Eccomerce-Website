// mongodb connection
const client = require("mongodb").MongoClient;

const URL = "mongodb://127.0.0.1:27017";
function connect(callback) {
  client
    .connect(URL)
    .then((database) => {
      let data = database.db("e-comm");
      console.log("Connect database");
      callback(data);
    })
    .catch((err) => {
      console.log(err);
      callback(null);
    });
}
module.exports = function getData(callback){
  connect(callback);
};

// mongodb connection
// const client = require("mongodb").MongoClient;
// let data;
// const URL = "mongodb://127.0.0.1:27017";
// function connect(callback) {
//   client
//     .connect(URL)
//     .then((database) => {
//        data = database.db("e-comm");
//       console.log("Connect database");
//       callback(data);
//     })
//     .catch((err) => {
//       console.log(err);
//       callback(null);
//     });
// }
// function getData(){
//   return data;
// }
// module.exports = {connect,getData};