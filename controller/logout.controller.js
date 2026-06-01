const { response } = require("../helpers/response.formatter");

module.exports = {
    logout: async (req, res) => {
        try {
            // logout cuma di frontend hapus token, backend ga perlu nyimpen di session nya
            return res.status(200).json(response(200, 'Logout berhasil'));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    }
}