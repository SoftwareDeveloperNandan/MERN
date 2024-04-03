import multer from 'multer'

//cb: cb bole to callback function
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      console.log("Kya hai file mae>>>", file);
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ 
    storage
})

export {storage, upload}