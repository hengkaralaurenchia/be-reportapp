'use strict';
const passwordHash = require('password-hash');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Users', [
            {
                name: 'Admin',
                email: 'admin@gmail.com',
                password: passwordHash.generate('12345678'),
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Users', null, {});
    }
};