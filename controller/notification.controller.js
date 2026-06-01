const { Notification, Report, User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    // Ambil semua notifikasi user yang login
    getNotifications: async (req, res) => {
        try {
            const notifications = await Notification.findAll({
                where: { user_id: req.userId },
                include: [
                    {
                        model: Report,
                        attributes: ['id', 'type', 'status']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(response(200, 'success', notifications));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    // Tandai notifikasi sudah dibaca
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const notification = await Notification.findByPk(id);

            if (!notification) {
                return res.status(404).json(response(404, 'Notifikasi tidak ditemukan'));
            }

            await notification.update({ is_read: true });
            return res.status(200).json(response(200, 'Notifikasi ditandai sudah dibaca', notification));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    // Tandai semua notifikasi sudah dibaca
    markAllAsRead: async (req, res) => {
        try {
            await Notification.update(
                { is_read: true },
                { where: { user_id: req.userId } }
            );
            return res.status(200).json(response(200, 'Semua notifikasi ditandai sudah dibaca'));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    // Hapus notifikasi per ID
    deleteNotification: async (req, res) => {
        try {
            const { id } = req.params;
            const notification = await Notification.findByPk(id);

            if (!notification) {
                return res.status(404).json(response(404, 'Notifikasi tidak ditemukan'));
            }

            if (notification.user_id !== req.userId) {
                return res.status(403).json(response(403, 'Tidak memiliki akses'));
            }

            await notification.destroy();
            return res.status(200).json(response(200, 'Notifikasi berhasil dihapus'));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    // Hapus semua notifikasi user
    deleteAllNotifications: async (req, res) => {
        try {
            await Notification.destroy({
                where: { user_id: req.userId }
            });
            return res.status(200).json(response(200, 'Semua notifikasi berhasil dihapus'));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    }
};