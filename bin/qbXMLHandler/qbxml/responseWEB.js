
var connect = require('../../../database/connection')


module.exports = {
    responseItensInventoryQuery: async function (json) {
            var arrayitem = []
            for (const key in json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet) {
                try {
                var itens = Object()
                if (!(json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].Sublevel._text === "0")) {
                    itens.idItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].ListID._text;
                    itens.category = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].ParentRef.FullName._text;
                    itens.nomeItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].Name._text;
                    itens.salesItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].SalesPrice._text;
                    itens.qtdItem = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].QuantityOnHand._text;
                    itens.unitofmeasuredefault = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].UnitOfMeasureSetRef.FullName._text;
                    QuantityOnHand = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].QuantityOnHand._text;
                    QuantityOnSalesOrder = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].QuantityOnSalesOrder._text;
                    itens.description = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].PurchaseDesc._text;
                    itens.qtdItem = QuantityOnHand - QuantityOnSalesOrder
                    try {
                        itens.unitofmeasure = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].DataExtRet[0].DataExtValue._text;
                        itens.valueuntiofmeasure = json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs.ItemInventoryRet[key].DataExtRet[1].DataExtValue._text;
                    }catch (e){
                        arrayitem.push(itens)
                        continue
                    }
                    arrayitem.push(itens)
                }
            } catch (e) {
                console.log(e)
                console.log(`Deu Bosta no produto ${key}`)
                continue
            }
        }
        await connect.storeItem(arrayitem)
    },

    /**
     * FIXME:
     * O quickbooks 18 não retorna shiptoaddress, somento o primeiro.
     */
    responseCostumersQuery: async function (json) {
        var arrayusers = []
        var arrayaddress = []
        for (const key in json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet) {
            try{
            var users = Object()
            users.idUser = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ListID._text;
            users.username = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].Name._text;
            users.email = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].Email._text;
            users.companyname = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].CompanyName._text;
            arrayusers.push(users)
            if (json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress != undefined){
                //if (json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.Addr1 == undefined) {
                    //for (const keya in json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress) {
                        var address = Object()
                        address.iduser = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ListID._text;
                        address.endereco = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.Addr1._text;
                        address.city = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.City._text;
                        address.name = "Ship to 1"//json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress[keya].Name._text;
                        //address.estado = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.State._text;
                        arrayaddress.push(address)
            }
                    //}
                /** } else {
                    var address = Object()
                    address.iduser = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ListID._text;
                    address.endereco = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.Addr1._text;
                    address.city = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.City._text;
                    address.name = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.Name._text;
                    address.estado = json.QBXML.QBXMLMsgsRs.CustomerQueryRs.CustomerRet[key].ShipAddress.State._text;
                    arrayaddress.push(address)
                }*/
            } catch (e) {
                console.log(e)
                continue
            }

        }
        await connect.store(arrayusers)
        await connect.storeAddress(arrayaddress)
    },

    responseSalesOrdersAdd: async function (json) {
        refnumber = json.QBXML.QBXMLMsgsRs.SalesOrderAddRs.SalesOrderRet.RefNumber._text;
        await connect.salesordersadd(refnumber)
    },

    responseSalesOrdersQuery: async function (json) {
        for (const key in json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet) {
            refnumber = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet[key].RefNumber._text;
            obs = json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs.SalesOrderRet[key].CustomerMsgRef.FullName._text;
            await connect.salesordersupdate(refnumber, obs)
        }
    }
}