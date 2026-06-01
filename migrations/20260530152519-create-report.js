'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fix_image: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('pending', 'processed', 'done'),
        defaultValue: 'pending',
        allowNull: false
      },
      estimated_completion: {
        type: Sequelize.DATE
      },
      completed_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Foreign Key
    await queryInterface.addConstraint("Reports", { // addConstraint buat nambahin atribut baru
      fields: ['user_id'], // column FK nya
      type: 'foreign key',
      name: 'fk_reports_user_id',
      references: { //cari PK ada dimana
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE', //jika PK dihapus, data FK ikut terhapus
      onUpdate: 'CASCADE', //jika PK (id) di ubah , id FK ikut terubah
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reports');
  }
};