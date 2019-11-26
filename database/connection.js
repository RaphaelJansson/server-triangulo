
const { Pool } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'
var moment = require('moment-timezone');

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
        for (const req in data) {
            var iduser = data[req].idUser
            var name = data[req].username.replace(/'/g, `''`)
            var email = data[req].email.toLowerCase()
            var companyName = data[req].companyname.replace(/'/g, `''`)
            var status = data[req].status
            try {
                user = await pool.query(`SELECT * FROM users where iduser = '${iduser}'`)
                if (user.rows.length === 0) {
                    await pool.query(`insert into users (iduser,username,email,companyName,status) values('${iduser}','${name}','${email}','${companyName}','${status}')`)
                } else {
                    await pool.query(`UPDATE users SET username = '${name}', email = '${email}', companyName = '${companyName}', status = '${status}'  WHERE iduser = '${iduser}'`)
                }
            } catch (e) {
                console.log(e);
            }
        }
    },

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
                    VALUES('${data[key].idItem}',
                    '${data[key].nomeItem}',
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
                //console.log('alguma coisa errada aqui');
                continue
            }
        }
    },

    storeAddress: async function (data) {
        for (const req in data) {
            try {
                user = await pool.query(`SELECT * FROM users where iduser = '${data[req].iduser}'`)
                address = await pool.query(`SELECT * FROM addresses where user_id = ${user.rows[0].id}`)
                if (address.rows.length === 0) {
                    try {
                        for (const add in data) {
                            if (data[add].iduser === user.rows[0].iduser) {
                                var addresses = {
                                    addr1: data[add].addr1,
                                    addr2: data[add].addr2,
                                    addr3: data[add].addr3,
                                    addr4: data[add].addr4,
                                    city: data[add].city,
                                    state: data[add].state,
                                    postalcode: data[add].postalcode
                                }
                                addresses = JSON.stringify(addresses)
                                await pool.query(`INSERT INTO addresses(user_id,addressname,address) VALUES(${user.rows[0].id},'${data[add].name}','${addresses}')`)
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                } else if (address.rows.length != 0) {
                    await pool.query(`delete from addresses where user_id = ${user.rows[0].id}`)
                    for (const add in data) {
                        if (data[add].iduser === user.rows[0].iduser) {
                            var addresses = {
                                addr1: data[add].addr1,
                                addr2: data[add].addr2,
                                addr3: data[add].addr3,
                                addr4: data[add].addr4,
                                city: data[add].city,
                                state: data[add].state,
                                postalcode: data[add].postalcode
                            }
                            addresses = JSON.stringify(addresses)
                            await pool.query(`INSERT INTO addresses(user_id,addressname,address) VALUES(${user.rows[0].id},'${data[add].name}','${addresses}')`)
                        }
                    }
                }
            } catch (e) {
                //console.log(e);
            }
        }
    },

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
                        quantity: list.rows[key].itens[keyp].qtd
                    }
                    if (products.name == "Shipping Freight") { products.quantity = 1 }
                    arrayproduct.push(products)
                }
                arrayresult.push({
                    customer: customer.rows[0].username,
                    memo: list.rows[key].id,
                    addr1: list.rows[key].address.addr1,
                    addr2: list.rows[key].address.addr2,
                    addr3: list.rows[key].address.addr3,
                    addr4: list.rows[key].address.addr4,
                    city: list.rows[key].address.city,
                    state: list.rows[key].address.state,
                    postalcode: list.rows[key].address.postalcode,
                    country: list.rows[key].address.country,
                    note: list.rows[key].address.note,
                    price: list.rows[key].price,
                    observation: list.rows[key].obs,
                    po: list.rows[key].po,
                    products: [arrayproduct]
                })
                //}
            }
            return callback(arrayresult);
        } catch (e) {
            //console.log(e);
        }
    },

    salesordersadd: async function (memo, refnumber) {
        try {
            await pool.query(`UPDATE orders set transition = false, quickbooks = true, refnumber = ${refnumber} where id = ${memo}`)
        } catch (e) {
            console.log(e)
        }
    },

    salesordersupdate: async function (order, itens, address) {
        const resultorder = await pool.query(`Select * from orders where refnumber = ${order.refnumber}`)
        if (resultorder.rows.length != 0) {
            var resultuser = await pool.query(`Select * from users where iduser = '${order.user}'`)

            var arrayproduct = []
            for (const keyi of itens) {
                    const resultitem = await pool.query(`Select * from products where listid = '${keyi.listid}'`)
                    if (resultitem.rows.length == 0) {
                        var product = {
                            id: keyi.listid,
                            name: keyi.name.replace(/'/g, `''`),
                            price: keyi.pricerule,
                            qtd: parseInt(keyi.qtd),
                            rule: ""
                        }
                        arrayproduct.push(product)
                    } else {
                        var product = {
                            id: resultitem.rows[0].id,
                            listid: keyi.listid,
                            name: resultitem.rows[0].name.replace(/'/g, `''`),
                            description: resultitem.rows[0].description.replace(/'/g, `''`),
                            price: keyi.pricerule,
                            quantity: resultitem.rows[0].quantity,
                            qtd: parseInt(keyi.qtd),
                            category: resultitem.rows[0].category,
                            unitofmeasuredefault: resultitem.rows[0].unitofmeasuredefault,
                            valueuntiofmeasure: resultitem.rows[0].valueuntiofmeasure,
                            unitofmeasure: resultitem.rows[0].unitofmeasure
                        }
                        arrayproduct.push(product)
                    }
            }
            var observation = order.obs.replace(/'/g, `''`)
            var addressjson = JSON.stringify(address)
            addressjson = addressjson.replace(/'/g, `''`)
            var products = JSON.stringify(arrayproduct)
            products = products.replace(/'/g, `''`)
            var status = order.invoiced == "true" || order.closed == "true" ?  false : true
            await pool.query(`UPDATE orders set obs = '${observation}', po = '${order.po}', address = '${addressjson}', price = '${order.price}', status = ${status}, itens= '${products}' where refnumber = ${order.refnumber}`)
        } else {
            var resultuser = await pool.query(`Select * from users where iduser = '${order.user}'`)
            var arrayproduct = []
            for (const keyi of itens) {
                    const resultitem = await pool.query(`Select * from products where listid = '${keyi.listid}'`)
                    if (resultitem.rows.length == 0) {
                        var product = {
                            id: keyi.listid,
                            name: keyi.name.replace(/'/g, `''`),
                            price: keyi.pricerule,
                            qtd: parseInt(keyi.qtd),

                        }
                        arrayproduct.push(product)
                    } else {
                        var product = {
                            id: resultitem.rows[0].id,
                            listid: keyi.listid,
                            name: resultitem.rows[0].name.replace(/'/g, `''`),
                            description: resultitem.rows[0].description.replace(/'/g, `''`),
                            price: (keyi.pricerule / resultitem.rows[0].valueuntiofmeasure).toFixed(2),
                            quantity: resultitem.rows[0].quantity,
                            qtd: parseInt(keyi.qtd),
                            category: resultitem.rows[0].category,
                            unitofmeasuredefault: resultitem.rows[0].unitofmeasuredefault,
                            valueuntiofmeasure: resultitem.rows[0].valueuntiofmeasure,
                            unitofmeasure: resultitem.rows[0].unitofmeasure
                        }
                        arrayproduct.push(product)
                    }

            }
            var observation = order.obs.replace(/'/g, `''`)
            var addressjson = JSON.stringify(address)
            addressjson = addressjson.replace(/'/g, `''`)
            var products = JSON.stringify(arrayproduct)
            products = products.replace(/'/g, `''`)
            var status = order.invoiced == "true" || order.closed == "true" ?  false : true
            await pool.query(`Insert into orders (user_id,address,po,quickbooks,price,itens,obs,refnumber,status,transition,created_at)
                 Values( ${resultuser.rows[0].id},'${addressjson}','${order.po}',true,'${order.price}','${products}','${observation}',${order.refnumber},${status},false,'${order.created}')`)
        }
    },

    settime: async function () {
        const lastrun = moment().tz("America/Campo_Grande").format();//moment().format()
        try {
            await pool.query(`UPDATE webtimes set lastrun = '${lastrun}'`)
        } catch (e) {

        }
    },

    gettime: async function (callback) {
        //insert into webtimes (lastrun,name) values('2000-11-01T15:59:50-03:00','webconector');
        //insert into webtimes (lastrun,name) values('2000-11-01T15:59:50-03:00','ordersdeleted');
        try {
            const time = await pool.query(`Select lastrun from webtimes where name = 'webconector'`)
            return callback(time)
        } catch (e) {
            // console.log(e)
        }
    },

    storeCustomerMsgQuery: async function (obs) {
        //insert into webmessages (message) values('1-Order has been created and under analysis');
        await pool.query(`Update webmessages set message = '${obs}'`)
    },

    takemessage: async function (callback) {
        const message = await pool.query(`Select message from webmessages`)
        return callback(message)
    },

    listDelOrders: async function (refnumber) {
        await pool.query(`Update orders set status = false where refnumber = ${refnumber}`)
    },

    onHandForSite: async function (listid, onHand) {
            await pool.query(`Update products set quantity = ${onHand} where listid = '${listid}'`)
    },

    onHandZero : async function () {
            await pool.query(`Update products set quantity = 0`)
    },
};



