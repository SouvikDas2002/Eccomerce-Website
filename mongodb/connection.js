// mongodb connection
const client = require("mongodb").MongoClient;

const URL = process.env.Mongo_URL;
function connect(callback) {
  client
    .connect(URL)
    .then((database) => {
      let data = database.db("e-comm");
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