
var connect = require('../../../database/connection')
var email = require('../../../config/email')
/**
 * TODO:
 * Terminar enderecos
 */

module.exports = {
    responseItensInventoryQuery: async function (json) {
        var arrayitem = []
        if (json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet != undefined) {
            if (json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.length != undefined) {
                for (const key in json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet) {
                    try {
                        var itens = Object()
                        if (!(json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].Sublevel._text === "0")) {
                            itens.idItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].ListID._text;
                            itens.category = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].ParentRef.FullName._text;
                            itens.nomeItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].Name._text;
                            itens.salesItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].SalesPrice._text;
                            itens.unitofmeasuredefault = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].UnitOfMeasureSetRef.FullName._text;
                            // QuantityOnHand = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].QuantityOnHand._text;
                            // QuantityOnSalesOrder = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].QuantityOnSalesOrder._text;
                            // QuantityOnOrder = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].QuantityOnOrder._text;
                            itens.description = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].PurchaseDesc._text;
                            itens.qtdItem = "0"
                            // const result = parseInt(QuantityOnOrder) + (parseInt(QuantityOnHand) - parseInt(QuantityOnSalesOrder))
                            // if (result > parseInt(QuantityOnHand)) {
                            //     itens.qtdItem = QuantityOnHand
                            // } else {
                            //     itens.qtdItem = result.toString()
                            // }

                            try {
                                itens.unitofmeasure = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].DataExtRet[0].DataExtValue._text;
                                itens.valueuntiofmeasure = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].DataExtRet[1].DataExtValue._text;
                                if (itens.valueuntiofmeasure != "0") {
                                    itens.salesItem = itens.salesItem / itens.valueuntiofmeasure
                                }else{
                                    itens.valueuntiofmeasure = "1"
                                }
                            } catch (e) {
                                itens.valueuntiofmeasure = "1"
                                arrayitem.push(itens)
                                continue
                            }
                            arrayitem.push(itens)
                        }
                    } catch (e) {
                        //console.log(e)
                        continue
                    }

                }
                await connect.storeItem(arrayitem)
            } else {
                var itens = Object()
                if (!(json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.Sublevel._text === "0")) {
                    itens.idItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.ListID._text;
                    itens.category = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.ParentRef.FullName._text;
                    itens.nomeItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.Name._text;
                    itens.salesItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.SalesPrice._text;
                    itens.unitofmeasuredefault = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.UnitOfMeasureSetRef.FullName._text;
                    // QuantityOnHand = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.QuantityOnHand._text;
                    // QuantityOnSalesOrder = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.QuantityOnSalesOrder._text;
                    itens.description = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.PurchaseDesc._text;
                    itens.qtdItem = "0"
                    // const result = parseInt(QuantityOnOrder) + (parseInt(QuantityOnHand) - parseInt(QuantityOnSalesOrder))
                    // if (result > parseInt(QuantityOnHand)) {
                    //     itens.qtdItem = QuantityOnHand
                    // } else {
                    //     itens.qtdItem = result.toString()
                    // }

                    try {
                        itens.unitofmeasure = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.DataExtRet[0].DataExtValue._text;
                        itens.valueuntiofmeasure = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet.DataExtRet[1].DataExtValue._text;
                        if (itens.valueuntiofmeasure != "0") {
                            itens.salesItem = itens.salesItem / itens.valueuntiofmeasure
                        }else{
                            itens.valueuntiofmeasure = "1"
                        }
                    } catch (e) {
                        itens.valueuntiofmeasure = "1"
                        arrayitem.push(itens)
                    }
                    arrayitem.push(itens)
                }
                await connect.storeItem(arrayitem)
            }
        }

    },

    responseCostumersQuery: async function (json) {
        var arrayusers = []
        var arrayaddress = []
        if (json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet != undefined) {
            if (json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet.length != undefined) {
                for (const key of json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet) {
                    try {
                        var users = Object()
                        users.idUser = key.ListID._text;
                        users.username = key.Name._text;
                        users.email = key.Email._text;
                        users.companyname = key.CompanyName._text;
                        users.status = key.IsActive._text;
                        arrayusers.push(users)
                    } catch (e) {
                        continue
                    }
                    if (key.ShipToAddress != undefined) {
                        if (key.ShipToAddress.length != undefined) {
                            for (const keya in key.ShipToAddress) {
                                try {
                                    var address = Object()
                                    address.iduser = key.ListID._text;
                                    address.name = key.ShipToAddress[keya].Name._text;
                                    address.addr1 = key.ShipToAddress[keya].Addr1._text;
                                    address.city = ''
                                    address.postalcode = ''
                                    address.state = ''
                                    address.addr3 = ''
                                    address.addr4 = ''
                                    address.addr2 = ''
                                    if (key.ShipToAddress[keya].City != undefined) {
                                        address.city = key.ShipToAddress[keya].City._text
                                    }
                                    if (key.ShipToAddress[keya].PostalCode != undefined) {
                                        address.postalcode = key.ShipToAddress[keya].PostalCode._text
                                    }
                                    if (key.ShipToAddress[keya].State != undefined) {
                                        address.state = key.ShipToAddress[keya].State._text
                                    }
                                    address.addr2 = key.ShipToAddress[keya].Addr2._text
                                    address.addr3 = key.ShipToAddress[keya].Addr3._text
                                    address.addr4 = key.ShipToAddress[keya].Addr4._text
                                    arrayaddress.push(address)
                                } catch (e) {
                                    arrayaddress.push(address)
                                    continue
                                }
                            }
                        } else {
                            try {
                                var address = Object()
                                address.iduser = key.ListID._text;
                                address.name = key.ShipToAddress.Name._text;
                                address.addr1 = key.ShipAddress.Addr1._text;
                                address.city = ''
                                address.postalcode = ''
                                address.state = ''
                                address.addr3 = ''
                                address.addr4 = ''
                                address.addr2 = ''
                                if (key.ShipAddress.City != undefined) {
                                    address.city = key.ShipAddress.City._text
                                }
                                if (key.ShipAddress.State != undefined) {
                                    address.state = key.ShipAddress.State._text
                                }
                                if (key.ShipAddress.PostalCode != undefined) {
                                    address.postalcode = key.ShipAddress.PostalCode._text
                                }
                                address.endereco = key.ShipAddress.Addr2._text
                                address.endereco = key.ShipAddress.Addr3._text
                                address.endereco = key.ShipAddress.Addr4._text
                                arrayaddress.push(address)
                            } catch (e) {
                                arrayaddress.push(address)
                            }
                        }
                    }
                }
            } else {
                var key = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet
                var users = Object()
                users.idUser = key.ListID._text;
                users.username = key.Name._text;
                users.email = key.Email._text;
                users.companyname = key.CompanyName._text;
                users.status = key.IsActive._text;
                arrayusers.push(users)
                if (key.ShipToAddress != undefined) {
                    if (key.ShipToAddress.length != undefined) {
                        for (const keya in key.ShipToAddress) {
                            try {
                                var address = Object()
                                address.iduser = key.ListID._text;
                                address.name = key.ShipToAddress[keya].Name._text;
                                address.addr1 = key.ShipToAddress[keya].Addr1._text;
                                address.city = ''
                                address.postalcode = ''
                                address.state = ''
                                address.addr3 = ''
                                address.addr4 = ''
                                address.addr2 = ''
                                if (key.ShipToAddress[keya].City != undefined) {
                                    address.city = key.ShipToAddress[keya].City._text
                                }
                                if (key.ShipToAddress[keya].PostalCode != undefined) {
                                    address.postalcode = key.ShipToAddress[keya].PostalCode._text
                                }
                                if (key.ShipToAddress[keya].State != undefined) {
                                    address.state = key.ShipToAddress[keya].State._text
                                }
                                address.addr2 = key.ShipToAddress[keya].Addr2._text
                                address.addr3 = key.ShipToAddress[keya].Addr3._text
                                address.addr4 = key.ShipToAddress[keya].Addr4._text
                                arrayaddress.push(address)
                            } catch (e) {
                                arrayaddress.push(address)
                                continue
                            }
                        }
                    } else {
                        try {
                            var address = Object()
                            address.iduser = key.ListID._text;
                            address.name = key.ShipToAddress.Name._text;
                            address.endereco = key.ShipAddress.Addr1._text;
                            address.city = ''
                            address.postalcode = ''
                            address.state = ''
                            address.addr3 = ''
                            address.addr4 = ''
                            address.addr2 = ''
                            if (key.ShipAddress.City != undefined) {
                                address.city = key.ShipAddress.City._text
                            }
                            if (key.ShipAddress.State != undefined) {
                                address.state = key.ShipAddress.State._text
                            }
                            if (key.ShipAddress.PostalCode != undefined) {
                                address.postalcode = key.ShipAddress.PostalCode._text
                            }
                            address.endereco = key.ShipAddress.Addr2._text
                            address.endereco = key.ShipAddress.Addr3._text
                            address.endereco = key.ShipAddress.Addr4._text
                            arrayaddress.push(address)
                        } catch (e) {
                            arrayaddress.push(address)
                        }
                    }
                }
            }
        }

        await connect.store(arrayusers)
        await connect.storeAddress(arrayaddress)
    },

    /**
     * FIXME:
     *  /email.neworder(refnumber,customer)
     */
    responseSalesOrdersAdd: async function (json) {
        memo = json.QBXML.QBXMLMsgsRs.SalesOrderAddRs.SalesOrderRet.Memo._text;
        refnumber = json.QBXML.QBXMLMsgsRs.SalesOrderAddRs.SalesOrderRet.RefNumber._text;
        customer = json.QBXML.QBXMLMsgsRs.SalesOrderAddRs.SalesOrderRet.CustomerRef.FullName._text;
        //email.neworder(refnumber,customer)
        await connect.salesordersadd(memo, refnumber)
    },

    responseSalesOrdersQuery: async function (json) {
        if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet != undefined) {
            if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.length != undefined) {

                for (const key of json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet) {

                    var order = Object()
                    order.user = key.CustomerRef.ListID._text;
                    order.created = key.TimeCreated._text;
                    order.closed = key.IsManuallyClosed._text;
                    order.invoiced = key.IsFullyInvoiced._text;
                    order.po = ""
                    if (key.PONumber != undefined) { order.po = key.PONumber._text; }
                    order.obs = ""
                    if (key.CustomerMsgRef != undefined) { order.obs = key.CustomerMsgRef.FullName._text; }
                    order.refnumber = key.RefNumber._text;
                    order.price = key.TotalAmount._text;
                    var address = Object()
                    address.city = ''
                    address.postalcode = ''
                    address.state = ''
                    address.addr3 = ''
                    address.addr4 = ''
                    address.addr2 = ''
                    try {
                        if (key.ShipAddress.City != undefined) {
                            address.city = key.ShipAddress.City._text;
                        }
                        if (key.ShipAddress.PostalCode != undefined) {
                            address.postalcode = key.ShipAddress.PostalCode._text
                        }
                        if (key.ShipAddress.State != undefined) {
                            address.state = key.ShipAddress.State._text;
                        }
                        address.addr1 = key.ShipAddress.Addr1._text;
                        address.addr2 = key.ShipAddress.Addr2._text;
                        address.addr3 = key.ShipAddress.Addr3._text;
                        address.addr4 = key.ShipAddress.Addr4._text;
                    } catch (error) {
                    }
                    try {
                        var arrayitens = []
                        if (key.SalesOrderLineRet.length != undefined) {
                            for (const keyi of key.SalesOrderLineRet) {
                                if (keyi.ItemRef != undefined) {
                                    var item = Object()
                                    item.name = keyi.ItemRef.FullName._text
                                    item.listid = keyi.ItemRef.ListID._text
                                    item.qtd = ""
                                    if (keyi.Quantity != undefined) {
                                        item.qtd = keyi.Quantity._text
                                    }
                                    item.pricerule = keyi.Rate._text
                                    arrayitens.push(item)
                                }
                            }
                        } else {
                            if (key.SalesOrderLineRet.ItemRef != undefined) {
                                var item = Object()
                                item.name = key.SalesOrderLineRet.ItemRef.FullName._text
                                item.listid = key.SalesOrderLineRet.ItemRef.ListID._text
                                item.qtd = ""
                                if (key.SalesOrderLineRet.Quantity != undefined) {
                                    item.qtd = key.SalesOrderLineRet.Quantity._text
                                }
                                item.pricerule = key.SalesOrderLineRet.Rate._text
                                arrayitens.push(item)
                            }
                        }
                        await connect.salesordersupdate(order, arrayitens, address)
                    } catch (e) {
                        continue
                    }
                }
            } else {
                var order = Object()
                order.user = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.CustomerRef.ListID._text;
                order.created = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.TimeCreated._text;
                order.closed = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.IsManuallyClosed._text;
                order.invoiced = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.IsFullyInvoiced._text;
                order.po = ""
                if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.PONumber != undefined) {
                    order.po = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.PONumber._text;
                }
                order.obs = ""
                if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.CustomerMsgRef != undefined) {
                    order.obs = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.CustomerMsgRef.FullName._text;
                }
                order.refnumber = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.RefNumber._text;
                order.price = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.TotalAmount._text;

                var arrayitens = []
                if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet.length != undefined) {
                    for (const keyi of json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet) {
                        if (keyi.ItemRef != undefined) {
                            var item = Object()
                            item.name = keyi.ItemRef.FullName._text
                            item.listid = keyi.ItemRef.ListID._text
                            item.qtd = ""
                            if (keyi.Quantity != undefined) {
                                item.qtd = keyi.Quantity._text
                            }
                            item.pricerule = keyi.Rate._text
                            arrayitens.push(item)
                        }
                    }
                } else {
                    if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet.ItemRef != undefined) {
                        var item = Object()
                        item.name = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet.ItemRef.FullName._text
                        item.listid = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet.ItemRef.ListID._text
                        item.qtd = ""
                        if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet.Quantity != undefined) {
                            item.qtd = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet.Quantity._text
                        }
                        item.pricerule = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.SalesOrderLineRet.Rate._text
                        arrayitens.push(item)
                    }
                }
                var address = Object()
                address.city = ''
                address.postalcode = ''
                address.state = ''
                address.addr3 = ''
                address.addr4 = ''
                address.addr2 = ''
                try {
                    if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.City != undefined) {
                        address.city = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.City._text;
                    }
                    if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.PostalCode != undefined) {
                        address.postalcode = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.PostalCode._text
                    }
                    if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.State != undefined) {
                        address.state = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.State._text
                    }
                    address.addr1 = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.Addr1._text;
                    address.addr2 = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.Addr2._text;
                    address.addr3 = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.Addr3._text;
                    address.addr4 = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet.ShipAddress.Addr4._text;
                    await connect.salesordersupdate(order, arrayitens, address)
                } catch (error) {
                    await connect.salesordersupdate(order, arrayitens, address)
                }
            }
        }
    },

    responseCustomerMsgQuery: async function (json) {
        if (json.QBXML.QBXMLMsgsRs.CustomerMsgQueryRs.CustomerMsgRet.length != undefined) {
            for (const key in json.QBXML.QBXMLMsgsRs.CustomerMsgQueryRs.CustomerMsgRet) {
                const obs = json.QBXML.QBXMLMsgsRs.CustomerMsgQueryRs.CustomerMsgRet[key].Name._text.substring(0, 2)
                if (obs == "1-") {
                    await connect.storeCustomerMsgQuery(json.QBXML.QBXMLMsgsRs.CustomerMsgQueryRs.CustomerMsgRet[key].Name._text)
                    break;
                }
            }
        } else {
            const obs = json.QBXML.QBXMLMsgsRs.CustomerMsgQueryRs.CustomerMsgRet.Name._text.substring(0, 2)
            if (obs == "1-") {
                await connect.storeCustomerMsgQuery(json.QBXML.QBXMLMsgsRs.CustomerMsgQueryRs.CustomerMsgRet.Name._text)
            }
        }
    },

    responseListDelOrders: async function (json) {
        if (json.QBXML.QBXMLMsgsRs.TxnDeletedQueryRs.TxnDeletedRet != undefined) {
            if (json.QBXML.QBXMLMsgsRs.TxnDeletedQueryRs.TxnDeletedRet.length != undefined) {
                for (const key of json.QBXML.QBXMLMsgsRs.TxnDeletedQueryRs.TxnDeletedRet) {
                    const refnumber = key.RefNumber._text;
                    await connect.listDelOrders(refnumber)
                }
            } else {
                const refnumber = json.QBXML.QBXMLMsgsRs.TxnDeletedQueryRs.TxnDeletedRet.RefNumber._text;
                await connect.listDelOrders(refnumber)
            }

        }

    },

    responseItensSitesInventoryQuery: async function (json) {
        await connect.onHandZero()
        if (json.QBXML.QBXMLMsgsRs.ItemSitesQueryRs.ItemSitesRet != undefined) {
            for (const key of json.QBXML.QBXMLMsgsRs.ItemSitesQueryRs.ItemSitesRet) {
                const listid = key.ItemInventoryRef.ListID._text
                const onhand = parseInt(key.QuantityOnHand._text)
                const onsalesorder = parseInt(key.QuantityOnSalesOrders._text)
                const result = onhand - onsalesorder
                await connect.onHandForSite(listid, result)
            }
        }

    }
}