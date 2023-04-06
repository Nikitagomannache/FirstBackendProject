const bigPromise = require("../middlewares/bigPromise");

// exports.home=(req,res)=>{
//     res.status(200).json({
//         success:true,
//         greeting:'Hello from api'
//     })
// }
// exports.homeDummy=(req,res)=>{
//     res.status(200).json({
//         success:true,
//         greeting:'Hello Dummy api'
//     })
// }

//With try and catch
// exports.homeDummy=async(req,res)=>{
//     //const db =await something()
//     try{
//         res.status(200).json({
//             success:true,
//             greeting:'Hello Dummy api'
//         })
//     }catch(error){
//         console.error();
//     }
// }

//with bigpromise
exports.home = bigPromise(async (req, res) => {
  //const db =await something()
  res.status(200).json({
    success: true,
    greeting: "Hello from api",
  });
});

exports.homeDummy = bigPromise(async (req, res) => {
  //const db =await something()
  res.status(200).json({
    success: true,
    greeting: "Hello Dummy api",
  });
});
