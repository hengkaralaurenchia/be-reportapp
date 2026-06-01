const multer = require("multer");
// path : agar bisa mengakses folder file project
const path = require("path")

// proses upload multer disimpan di middleware karena : 
// middleware : penghubung/tengah proses (route - middleware - controller)
// sebelumn file di akses controller, oleh middleware di proses dlu agar siap digunakan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // file yg diupload akan disimpan di folder project ini bagian uploads
    cb(null, path.join(__dirname, "../uploads")) //buat nama input nya
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname);
    // uniqueSuffix isinya nama file random, ext isinya .jpg jadi perlu digabung
    const name = file.fieldname + '-' + uniqueSuffix + ext; //kenapa fieldname
    // imaege-ashjsf.jpg
    cb(null, name)
  }
})

module.exports = multer({ storage: storage })