//try catch and async-await || use promise async await ****use any of the two

module.exports = (fun) => (req, res, next) =>
  Promise.resolve(fun(req, res, next)).catch(next);


