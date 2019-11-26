var data2xml = require('data2xml');
var convertjson = require('xml-js');
var connect = require('../../database/connection')
var webconnector = require('./qbxml/responseWEB')
var moment = require('moment-timezone');



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
            /**
             * FIXME:
             * mudar forma de popular tabela categoria
             * estava com problema no listid do parentref
             * fiz um console no servidor e todos tem o listid do pararentref
             * 
             * ver porque dava erro.
             */
            if (!(json.QBXML.QBXMLMsgsRs.ItemInventoryQueryRs === undefined)) {
                await webconnector.responseItensInventoryQuery(json)
                await connect.settime()
            } else if (json.QBXML.QBXMLMsgsRs.CustomerQueryRs != undefined) {
                await webconnector.responseCostumersQuery(json)
            } else if (json.QBXML.QBXMLMsgsRs.SalesOrderAddRs != undefined) {
                await webconnector.responseSalesOrdersAdd(json)
            } else if (json.QBXML.QBXMLMsgsRs.SalesOrderQueryRs != undefined) {
                await webconnector.responseSalesOrdersQuery(json)
            } else if (json.QBXML.QBXMLMsgsRs.CustomerMsgQueryRs != undefined) {
                await webconnector.responseCustomerMsgQuery(json)
            } else if (json.QBXML.QBXMLMsgsRs.TxnDeletedQueryRs != undefined) {
                await webconnector.responseListDelOrders(json)
            } else if (json.QBXML.QBXMLMsgsRs.ItemSitesQueryRs != undefined) {
                await webconnector.responseItensSitesInventoryQuery(json)
            }

        } catch (e) {
            //console.log(e)
        }
    },
    didReceiveError: function (error) {
        //console.log(error);
    }
};

function buildRequests(callback) {

    connect.takeorders((back) => {
        connect.takemessage((backmessage) => {
            connect.gettime((backtime) => {
                var requests = new Array();

                //Busca todos as ordens alteradas/criadas depois da ultima chamada do web connector
                var Ordered = convert(
                    'QBXML',
                    {
                        QBXMLMsgsRq: {
                            _attr: { onError: 'stopOnError' },
                            SalesOrderQueryRq: {
                                MaxReturned: 1000,
                                ModifiedDateRangeFilter: {
                                    FromModifiedDate: backtime.rows[0].lastrun,
                                },
                                IncludeLineItems: true
                            }
                        },
                    }
                );
                requests.push(Ordered);

                //Cria ordens que estão no banco de dados para o quickbooks
                if (back != null) {
                    for (const order in back) {
                        var textfinal = `
                <CustomerRef>
                    <FullName>${back[order].customer}</FullName>
                </CustomerRef>
                <ShipAddress>
                    <Addr1>${back[order].addr1.replace(/[\/\\'"ç]/g, '')}</Addr1>
                    <Addr2>${back[order].addr2.replace(/[\/\\'"ç]/g, '')}</Addr2>
                    <Addr3>${back[order].addr3.replace(/[\/\\'"ç]/g, '')}</Addr3>
                    <Addr4>${back[order].addr4.replace(/[\/\\'"ç]/g, '')}</Addr4>
                    <City >${back[order].city}</City> 
                    <State >${back[order].state}</State> 
                    <PostalCode >${back[order].postalcode}</PostalCode> 
                </ShipAddress>
                <PONumber >${back[order].po}</PONumber>
                <Memo >${back[order].memo}</Memo>
                <CustomerMsgRef>
                <FullName>${backmessage.rows[0].message}</FullName>
                </CustomerMsgRef>`
                        textproduct = ""
                        for (product in back[order].products[0]) {
                            if (back[order].products[0][product].name == "Shipping Freight") {
                                var text = `
                        <SalesOrderLineAdd>
                            <ItemRef>
                                <FullName>${back[order].products[0][product].name}</FullName>
                            </ItemRef>
                            <Quantity>${back[order].products[0][product].quantity}</Quantity>
                            <InventorySiteRef>
                                <ListID>8000000B-1561577328</ListID>
                            </InventorySiteRef>
                        </SalesOrderLineAdd>`
                                var textproduct = textproduct + text
                            } else {
                                var text = `
                        <SalesOrderLineAdd>
                            <ItemRef>
                                <ListID>${back[order].products[0][product].listid}</ListID>
                            </ItemRef>
                            <Quantity>${back[order].products[0][product].quantity}</Quantity>
                        </SalesOrderLineAdd>`
                                var textproduct = textproduct + text
                            }
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
                //Busca todos as ordens deletadas do quickbooks
                var ListDelOrders = convert(
                    'QBXML',
                    {
                        QBXMLMsgsRq: {
                            _attr: { onError: 'stopOnError' },
                            TxnDeletedQueryRq: {
                                TxnDelType: "SalesOrder",
                            }
                        },
                    }
                );
                requests.push(ListDelOrders);


                //Busca todos os usuarios alterados/criados depois da ultima chamada do web connector
                var Costumers = convert(
                    'QBXML',
                    {
                        QBXMLMsgsRq: {
                            _attr: { onError: 'stopOnError' },
                            CustomerQueryRq: {
                                MaxReturned: 1000,
                                ActiveStatus: "All",
                                FromModifiedDate: backtime.rows[0].lastrun,
                            }
                        },
                    }
                );
                requests.push(Costumers);

                //Lista todos as mensagens 
                var ListMessage = convert(
                    'QBXML',
                    {
                        QBXMLMsgsRq: {
                            _attr: { onError: 'stopOnError' },
                            CustomerMsgQueryRq: {
                                MaxReturned: 100,
                                FromModifiedDate: backtime.rows[0].lastrun,
                            }
                        },
                    }
                );
                requests.push(ListMessage);

                //Busca valor do estoque no site especifico e altera o valor nos produtos, sempre roda.
                var ItensInventorySite = convert(
                    'QBXML',
                    {
                        QBXMLMsgsRq: {
                            _attr: { onError: 'stopOnError' },
                            ItemSitesQueryRq: {
                                ItemSiteFilter :{
                                    SiteFilter: {
                                        ListID : "8000000B-1561577328"
                                    }
                                },
                                MaxReturned: 1000
                            }
                        },
                    }
                );
                requests.push(ItensInventorySite);

                //Busca todos os itens alterados/criados depois da ultima chamada do web connector
                var ItensInventory = convert(
                    'QBXML',
                    {
                        QBXMLMsgsRq: {
                            _attr: { onError: 'stopOnError' },
                            ItemInventoryQueryRq: {
                                MaxReturned: 1000,
                                FromModifiedDate: backtime.rows[0].lastrun,
                                OwnerID: 0,
                            }
                        },
                    }
                );
                requests.push(ItensInventory);

                
                return callback(null, requests);
            })
        })
    })
}
