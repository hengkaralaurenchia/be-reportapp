const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const { User } = require("../models");
const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { auth_secret } = require('../config/base.config');

module.exports = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const schema = {
                email: { type: 'email' },
                password: { type: 'string' }
            }

            const validate = v.validate({ email, password }, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'Error validasi', validate));
            }

            //cari user berdasarkan email
            const user = await User.findOne({ where: { email } }); //dimana emailnya
            if (!user) {
                return res.status(400).json(response(400, 'User not found'));
            }

            //verifikasi password
            const verified = passwordHash.verify(password, user.password);
            if (!verified) {
                return res.status(400).json(response(400, 'Invalid password'));
            }

            //buat token
            const token = jwt.sign({ userId: user.id, email: user.email, name: user.name, role: user.role }, auth_secret, {
                expiresIn: '1h'
            });

            const data = {
                data: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: token
            }
            return res.status(200).json(response(200, 'Berhasil login!', data));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    },

    register: async (req, res) => {
        console.log("req.body:", req.body);
        try {
            const { name, email, password } = req.body;

            // validasi
            if (!name || !email || !password) {
                return res.status(400).json(response(400, 'Semua field wajib diisi'));
            }

            // cek email sudah terdaftar
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json(response(400, 'Email sudah terdaftar'));
            }

            // hash password
            const hashedPassword = passwordHash.generate(password);

            // buat user baru yg default rolenya usr
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'user'
            });

            return res.status(201).json(response(201, 'Register berhasil', {
                id: user.id,
                name: user.name,
                email: user.email
            }));
        } catch (error) {
            return res.status(500).json(response(500, 'Server error', error.message));
        }
    }
}