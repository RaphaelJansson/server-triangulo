var data2xml = require('data2xml');
var convertjson = require('xml-js');
var connect = require('../../database/connection')
var webconnector = require('./qbxml/responseWEB')


var convert = data2xml({
    xmlHeader: '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n'
});

// Public
module.exports = {

    fetchRequests: function (callback) {
        buildRequests(callback);
    },

    handleResponse: async function (response) {
        try {
            const json = JSON.parse(convertjson.xml2json(response, { compact: true }));
            if (!(json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs === undefined)) {
                await webconnector.responseItensInventoryQuery(json)
            } else if (json.QBXML.QBXMLMsgsRs.CustomerQueryRs != undefined) {
                await webconnector.responseCostumersQuery(json)
            } else if (json.QBXML.QBXMLMsgsRs.SalesOrderAddRs != undefined) {
                await webconnector.responseSalesOrdersAdd(json)
            } else if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs != undefined) {
                await webconnector.responseSalesOrdersQuery(json)
            }

        } catch (e) {
            console.log(e)
        }
    },
    didReceiveError: function (error) {
        console.log(error);
    }
};

function buildRequests(callback) {

    connect.takeorders((back) => {
        var requests = new Array();

        var Ordered = convert(
            'QBXML',
            {
                QBXMLMsgsRq: {
                    _attr: { onError: 'stopOnError' },
                    SalesOrderQueryRq: {
                        MaxReturned: 1000
                    }
                },
            }
        );
        requests.push(Ordered);

        if (back != null) {
            for (const order in back) {
                var textfinal = `
                <CustomerRef>
                    <FullName>${back[order].customer}</FullName>
                </CustomerRef>
                <ShipAddress>
                    <Addr1>${back[order].address}</Addr1>
                    <City >${back[order].city}</City> 
                    <State >${back[order].state}</State> 
                    <PostalCode >${back[order].postalcode}</PostalCode> 
                    <Country >${back[order].country}</Country> 
                    <Note >${back[order].note}</Note>
                </ShipAddress>
                <CustomerMsgRef>
                <FullName>1 - Order has been created</FullName>
                </CustomerMsgRef>`
                textproduct = ""
                for (product in back[order].products[0]) {
                    var text = `
                <SalesOrderLineAdd>
                    <ItemRef>
                        <ListID>${back[order].products[0][product].listid}</ListID>
                    </ItemRef>
                    <Quantity>${back[order].products[0][product].quantity}</Quantity>
                </SalesOrderLineAdd>`
                    var textproduct = textproduct + text
                }
                textfinal = textfinal + textproduct
                var CreateOrders = convert(
                    'QBXML',
                    {
                        QBXMLMsgsRq: {
                            _attr: { onError: 'stopOnError' },
                            SalesOrderAddRq: {
                                SalesOrderAdd: textfinal
                            }
                        },
                    }
                );
                CreateOrders = CreateOrders.replace(/&lt;/g, '<')
                CreateOrders = CreateOrders.replace(/&gt;/g, '>')
                requests.push(CreateOrders);
            }
        }

        var ItensInventory = convert(
            'QBXML',
            {
                QBXMLMsgsRq: {
                    _attr: { onError: 'stopOnError' },
                    ItemInventoryQueryRq: {
                        MaxReturned: 500,
                        OwnerID: 0
                    }
                },
            }
        );
        requests.push(ItensInventory);

        var Costumers = convert(
            'QBXML',
            {
                QBXMLMsgsRq: {
                    _attr: { onError: 'stopOnError' },
                    CustomerQueryRq: {
                        MaxReturned: 500,
                    }
                },
            }
        );
        requests.push(Costumers);

        return callback(null, requests);

    })
}
