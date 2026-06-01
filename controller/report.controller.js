const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Report, Notification, User } = require("../models");
const { Op } = require("sequelize");
const fs = require('fs'); //file system, melakukan segala sesuatu yang berhubungan dengan lokasi file
const path = require('path');

module.exports = {
    createReport: async (req, res) => {
        try {
            //ambil data
            const { type, location, description } = req.body;

            const user_id = req.userId;

            //schema validasi data
            const schema = {
                type: { type: "string", min: 2 },
                location: { type: "string", min: 3 },
                description: { type: "string", min: 10 }
            };

            //menyiapkan sumber data
            const data = {
                type: type,
                location: location,
                description: description,
            };

            //cek validasi
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'Error validasi', validate));
            }

            //validasi buat file
            if (!req.file) {
                return res.status(400).json(response(400, 'Foto laporan tidak boleh kosong'))
            }

            //proses create report
            const report = await Report.create({
                user_id: user_id,
                type: data.type,
                location: data.location,
                description: data.description,
                image: req.file.filename,
                status: "pending",
            });

            return res.status(201).json(response(201, 'Laporan berhasil dibuat', report));

        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    getReport: async (req, res) => {
        try {
            const { status, sortBy, order } = req.query;

            const reports = await Report.findAll({
                where: status ? { status } : {},
                order: sortBy ? [[sortBy, order]] : [],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            return res.status(200).json(response(200, 'success', reports));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    getReportById: async (req, res) => {
        try {
            const { id } = req.params;

            const report = await Report.findByPk(id);

            if (!report) {
                return res.status(404).json(response(404, 'Laporan tidak ditemukan'));
            }

            return res.status(200).json(response(200, 'success', report));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    updateReport: async (req, res) => {
        try {
            const { id } = req.params;
            const { type, location, description } = req.body;

            //validasi data
            const schema = {
                type: { type: "string", min: 2 },
                location: { type: "string", min: 3 },
                description: { type: "string", min: 10 },
            }

            const data = { type, location, description };
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'Error validasi', validate));
            }

            //ambil data sebelumnya
            const report = await Report.findByPk(id);
            //jika ga ada kembalikan error
            if (!report) {
                return res.status(404).json(response(404, 'Data not found'));
            }

            if (req.file) {
                //pakai getDataValue buat ambil nilai asli image dari database
                const imageName = report.getDataValue('image');

                //cari image ke folder uploads
                const oldFilePath = path.join(__dirname, '../uploads', imageName);
                //jika ada filenya, hapus
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            // update data: jika ada file baru, pakai filename baru, jika tidak pakai nama file lama dari database, pakai getDataValue supaya ambil nilai asli dari DB, bukan getter yg udah jadi URL
            const updateProcess = await Report.update({
                type: type,
                location: location,
                description: description,
                image: (req.file ? req.file.filename : report.getDataValue('image'))
            }, {
                where: { id: id }
            });

            //ambil data baru yang udah di update
            const updatedReport = await Report.findByPk(id);
            return res.status(200).json(response(200, 'Laporan berhasil diupdate', updatedReport));

        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    deleteReport: async (req, res) => {
        try {
            const { id } = req.params;

            // ambil data report untuk diambil gambar dan dihapus
            const report = await Report.findByPk(id);

            if (!report) {
                return res.status(404).json(response(404, "Data not found"));
            }

            // hapus file foto laporan pas klaporan di apus : user
            const imageName = report.getDataValue('image');
            if (imageName) {
                const filePath = path.join(__dirname, '../uploads', imageName);
                if (fs.existsSync(filePath)) {
                    //hapus file
                    fs.unlinkSync(filePath);
                }
            }

            // hapus file foto perbaikan pas laporan di apus : admin
            const fixImageName = report.getDataValue('fix_image');
            if (fixImageName) {
                const fixFilePath = path.join(__dirname, '../uploads', fixImageName);
                if (fs.existsSync(fixFilePath)) {
                    fs.unlinkSync(fixFilePath);
                }
            }

            // delete data di database
            const deleteProcess = await Report.destroy({
                where: { id: id }
            });

            return res.status(200).json(response(200, "deleted"));

        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, estimated_completion } = req.body;

            const validStatus = ['pending', 'processed', 'done'];
            if (!validStatus.includes(status)) {
                return res.status(400).json(response(400, 'Status tidak valid'));
            }

            const report = await Report.findByPk(id);
            if (!report) {
                return res.status(404).json(response(404, 'Laporan tidak ditemukan'));
            }

            let updateData = { status };
            if (estimated_completion) {
                updateData.estimated_completion = estimated_completion;
            }
            if (status === 'done') {
                updateData.completed_at = new Date();
            }

            await report.update(updateData);

            // notif ke user
            let notifMessage = '';
            if (status === 'processed') {
                notifMessage = `Laporan "${report.type}" sedang diproses. Estimasi selesai: ${estimated_completion || 'belum ditentukan'}`;
            } else if (status === 'done') {
                notifMessage = `Laporan "${report.type}" telah selesai.`;
            }

            if (notifMessage) {
                await Notification.create({
                    user_id: report.user_id,
                    report_id: report.id,
                    message: notifMessage,
                    is_read: false
                });
            }

            return res.status(200).json(response(200, 'Status berhasil diupdate', report));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    uploadFixPhoto: async (req, res) => {
        try {
            const { id } = req.params;

            const report = await Report.findByPk(id);
            if (!report) {
                return res.status(404).json(response(404, 'Laporan tidak ditemukan'));
            }

            if (!req.file) {
                return res.status(400).json(response(400, 'Foto perbaikan tidak boleh kosong'));
            }

            const oldFixImage = report.getDataValue('fix_image');
            if (oldFixImage) {
                const oldFilePath = path.join(__dirname, '../uploads', oldFixImage);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            await report.update({
                fix_image: req.file.filename,
                status: 'done',
                completed_at: new Date()
            });

            // notif ke user
            await Notification.create({
                user_id: report.user_id,
                report_id: report.id,
                message: `Laporan "${report.type}" telah selesai. Foto perbaikan sudah diupload.`,
                is_read: false
            });

            const updatedReport = await Report.findByPk(id);
            return res.status(200).json(response(200, 'Foto perbaikan berhasil diupload', updatedReport));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    }
}