import mongoose from 'mongoose'

var conn

if (!conn) {
  process.on('unhandledRejection', function(reason, promise) {
    console.log(promise);
  });
  const url = process.env.MONGO_URL || (__TEST__ ? 'mongodb://localhost/daipay_test' : 'mongodb://localhost/daipay')
  console.log(`connecting to ${url}`)
  mongoose.connect(url, { useNewUrlParser: true })
  mongoose.Promise = global.Promise
  conn = mongoose
}

export default conn

