const db = require('../util/database')
module.exports = class Product {
    constructor() {

    }
    static findAll() {
        return db.execute('SELECT * FROM momento.products;')
    }
    static findOneById(id) {
        return db.execute('SELECT * FROM momento.products WHERE id =?', [id])
    }
    static findOneByName(name) {
        return db.execute('SELECT * FROM momento.products WHERE product_name =?', [name])
    }
}