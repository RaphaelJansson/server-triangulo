
const { Pool } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'

const pool = new Pool({
    connectionString: 'postgres://ffawhzuijsjckv:200cbf24087870f4dc18b026b03009a45fb3d50a55c01911ad0c5b8a3f99011c@ec2-174-129-194-188.compute-1.amazonaws.com:5432/d3iabl5nmotufc',
    // connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: 'production',
})

// const pool = new Pool({
//     user: "postgres",
//     host: "localhost",
//     database: "cora",
//     password: "admin",
//     port: 5432,
// });

module.exports = {
    store: async function (data) {
        await pool.query(`UPDATE users SET status = false`)
        for (const req in data) {
            var iduser = data[req].idUser
            var name = data[req].username.replace(/'/g, `''`)
            var email = data[req].email
            var companyName = data[req].companyname.replace(/'/g, `''`)
            try {
                user = await pool.query(`SELECT * FROM users where iduser = '${iduser}'`)
                if (user.rows.length === 0) {
                    await pool.query(`insert into users (iduser,username,email,companyName) values('${iduser}','${name}','${email}','${companyName}')`)
                } else {
                    await pool.query(`UPDATE users SET username = '${name}', email = '${email}', companyName = '${companyName}', status = true  WHERE iduser = '${iduser}'`)
                }
            } catch (e) {
                console.log(e);
            }
        }
    },

    // async list(req, res, next) {
    //     pool.query('SELECT * FROM customers')
    //         .then(function (data) {
    //             res.status(200).json({
    //                 status: 'sucess',
    //                 data: data,
    //                 menssage: 'retrivied list'
    //             })
    //         })
    //         .catch(function (err) {
    //             return next(err)
    //         })
    // },

    // lastcustomer: function (callback) {
    //     pool.query(`SELECT * FROM users WHERE id = (SELECT MAX(id) FROM users)`, function (err, result) {
    //         if (err) {
    //             console.log(err, null);
    //             return callback(err);
    //         } else {
    //             console.log(result);
    //             return callback(result.rows[0]);
    //         }
    //     })
    //     //listcustomer(callback);
    // },

    // async listItens(req, res, next) {
    //     pool.query('SELECT * FROM itens')
    //         .then(function (data) {
    //             res.status(200).json({
    //                 status: 'sucess',
    //                 data: data,
    //                 menssage: 'retrivied list'
    //             })
    //         })
    //         .catch(function (err) {
    //             return next(err)
    //         })
    // },

    storeItem: async function (data) {
        for (const key in data) {
            priceItem = parseFloat(data[key].salesItem.toString().replace(",", "."));
            quantity = parseInt(data[key].qtdItem);
            try {
                const item = await pool.query(`SELECT * FROM products where listid = '${data[key].idItem}'`)
                    var result = data[key].unitofmeasuredefault.split("By the ")
                    var unitofmeasuredefault = result[1]
                    var descriptionQuote = data[key].description.replace(/'/g, `''`)
                if (item.rows.length == 0) {
                    await pool.query(`INSERT INTO products(listid,name,unitofmeasure,valueuntiofmeasure,unitofmeasuredefault,price,quantity,category,description) 
                    VALUES('${data[key].idItem}'
                    ,'${data[key].nomeItem}',
                    '${data[key].unitofmeasure}',
                    '${data[key].valueuntiofmeasure}',
                    '${unitofmeasuredefault}',
                    ${priceItem}, 
                    ${quantity},
                    '${data[key].category}',
                    '${descriptionQuote}')`)
                } else {
                    await pool.query(`UPDATE products SET 
                    name = '${data[key].nomeItem}', 
                    unitofmeasure = '${data[key].unitofmeasure}', 
                    valueuntiofmeasure = '${data[key].valueuntiofmeasure}',
                    unitofmeasuredefault = '${unitofmeasuredefault}',
                    price = ${priceItem}, 
                    quantity = ${quantity}, 
                    category = '${data[key].category}', 
                    description ='${descriptionQuote}'  WHERE listid = '${data[key].idItem}'`)
                }
            } catch (e) {
                console.log('alguma coisa errada aqui');
                continue
            }
        }
    },

    /**
     * TODO:
     * Não esta adicionando/Modificando novos endereços
     * TODO:
     * Nãe esta excluindo endereços
     */
    storeAddress: async function (data) {
        for (const req in data) {
            try {
                user = await pool.query(`SELECT * FROM users where iduser = '${data[req].iduser}'`)
                address = await pool.query(`SELECT * FROM addresses where user_id = ${user.rows[0].id}`)
                if (address.rows.length === 0) {
                    for (const add in data) {
                        if (data[add].iduser === user.rows[0].iduser) {
                            await pool.query(`INSERT INTO addresses(user_id,addressname,address,city,state,postalcode,coutry,note) VALUES(${user.rows[0].id},'${data[add].name}','${data[add].endereco}','${data[add].city}', '${data[add].estado}','','','')`)
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
/**
 * TODO:
 * fazer logica do campo PO para enviar para o quickbooks
 *  */
    takeorders: async function (callback) {
        try {
            list = await pool.query(`SELECT * FROM orders where quickbooks = false order by id`)
            await pool.query(`UPDATE orders set transition = true where quickbooks = false`)
            arrayresult = []

            for (const key in list.rows) {
                customer = await pool.query(`SELECT username,id FROM users where id = ${list.rows[key].user_id}`)
                arrayproduct = []
                for (const keyp in list.rows[key].itens) {
                    products = Object()
                    products = {
                        listid: list.rows[key].itens[keyp].listid,
                        name: list.rows[key].itens[keyp].name,
                        price: list.rows[key].itens[keyp].price,
                        quantity: list.rows[key].itens[keyp].quantity
                    }
                    if (products.name == "Shipping Freight") { products.quantity = 1 }
                    arrayproduct.push(products)
                }
                address = await pool.query(`SELECT * FROM addresses where user_id = ${customer.rows[0].id} and addressname like '%${list.rows[key].address}%'`)
                arrayresult.push({
                    customer: customer.rows[0].username,
                    address: address.rows[0].address,
                    city: address.rows[0].city,
                    state: address.rows[0].state,
                    postalcode: address.rows[0].postalcode,
                    country: address.rows[0].coutry,
                    note: address.rows[0].note,
                    id: list.rows[key].id,
                    price: list.rows[key].price,
                    observation: list.rows[key].obs,
                    products: [arrayproduct]
                })
                //}
            }
            return callback(arrayresult);
        } catch (e) {
            console.log(e);
        }
    },

    salesordersadd: async function (refnumber) {
        try {
            const result = await pool.query(`SELECT id FROM orders where quickbooks = false and transition = true order by id LIMIT 1`)
            await pool.query(`UPDATE orders set transition = false where quickbooks = false`)
            await pool.query(`UPDATE orders set quickbooks = true,refnumber = ${refnumber} where id = ${result.rows[0].id}`)
        } catch (e) {
            console.log(e)
        }
    },

    salesordersupdate: async function (refnumber, obs) {
        try {
            await pool.query(`UPDATE orders set obs = '${obs}'where refnumber = ${refnumber}`)
        } catch (e) {
            console.log(e)
        }
    }
};



