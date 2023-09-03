const db = require('../util/database')
module.exports = class Product {
    constructor() {

    }
    static findAll() {
        return db.execute('SELECT * FROM gem.products;')
    }
    static findOneById(id) {
        return db.execute('SELECT * FROM gem.products WHERE id =?', [id])
    }
    static findOneByName(name) {
        return db.execute('SELECT * FROM gem.products WHERE product_name =?', [name])
    }
}