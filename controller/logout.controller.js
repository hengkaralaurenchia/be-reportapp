const { response } = require("../helpers/response.formatter");

module.exports = {
    logout: async (req, res) => {
        try {
            // Logout hanya di frontend hapus token, backend tidak perlu simpan session
            return res.status(200).json(response(200, 'Logout berhasil'));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    }
}