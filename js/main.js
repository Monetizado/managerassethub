const monetizadoAbi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "cost",
				"type": "uint256"
			}
		],
		"name": "add",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "sequenceId",
				"type": "uint256"
			}
		],
		"name": "getContent",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "cost",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "sequenceId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amountAvailable",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct Monetizado.Content",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContentsCreator",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "cost",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "sequenceId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amountAvailable",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct Monetizado.Content[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "sequenceId",
				"type": "uint256"
			}
		],
		"name": "hasAccess",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "sequenceId",
				"type": "uint256"
			}
		],
		"name": "pay",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "sequenceId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];


async function getContract(web3,contractNetwork, userAddress) {
    var contractPublic = await new web3.eth.Contract(monetizadoAbi,contractNetwork);
    if(userAddress != null && userAddress != undefined) {
    contractPublic.defaultAccount = userAddress;
    }
    return contractPublic;
}

var iface = new ethers.utils.Interface(monetizadoAbi);

const networksProperties = {
        "polkadot:testnet": {urlRPC: "https://westend-asset-hub-rpc.polkadot.io", chainId: 420420421, chainName: "Westend Asset Hub", currencyName: "WND", decimals: 18, currencySymbol: "WND"}
    };

const networksContracts = {
    "polkadot:testnet" : "0x86f5304600627e7897AaAfAD39853e3D18E71B43"
}

async function loginWithMetamask() {
    var MMSDK = new MetaMaskSDK.MetaMaskSDK();
    await MMSDK.connect();
    const ethereum = MMSDK.getProvider() // You can also access via window.ethereum
    try {
        var accounts = await ethereum.request({method: 'eth_requestAccounts'});
        await changeNetwork();

    } catch {
        //location.href = "login.html";
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function changeNetwork() {
    
    var networkSelected = "polkadot:testnet";

    var networkSelectedProperties = networksProperties[networkSelected];

    if (window.ethereum.networkVersion !== networkSelectedProperties.chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: Web3.utils.toHex(networkSelectedProperties.chainId) }]
            });
            await getContentList();
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
                await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                    chainName: networkSelectedProperties.chainName,
                    chainId: Web3.utils.toHex(networkSelectedProperties.chainId),
                    nativeCurrency: { name: networkSelectedProperties.currencyName, decimals: networkSelectedProperties.decimals, symbol: networkSelectedProperties.currencySymbol },
                    rpcUrls: [networkSelectedProperties.urlRPC]
                    }
                ]
                });
                await getContentList();
            }

            if (err.code === 4001) {
                //location.href = "login.html";
            }
        }
    }
}

async function getContentList(){
    var accounts = await ethereum.request({method: 'eth_requestAccounts'});
    var account = accounts[0];
    
    var networkSelected = "polkadot:testnet";

    const contractNetwork = networksContracts[networkSelected];
    var networkSelectedProperties = networksProperties[networkSelected];

    var web3 = new Web3(new Web3.providers.HttpProvider(networkSelectedProperties.urlRPC));

    var contractPublic = await getContract(web3,contractNetwork,account);

    if(contractPublic != undefined) {
        var contentInfo = await ethereum
        .request({
            method: 'eth_call',
            params: [
            {
                from: account, // The user's active address.
                data: contractPublic.methods.getContentsCreator().encodeABI(),
                to: contractNetwork
            },
            ],
        });
        contentInfo = iface.decodeFunctionResult("getContentsCreator", contentInfo);
        if(contentInfo[0].length > 0) {
            $('#my_contents').html('');
            var list = document.querySelector('#my_contents');
              var table = document.createElement('table');
              var thead = document.createElement('thead');
              var tbody = document.createElement('tbody');
      
              var theadTr = document.createElement('tr');
              var balanceHeader = document.createElement('th');
              balanceHeader.innerHTML = 'ID';
              theadTr.appendChild(balanceHeader);
              var contractNameHeader = document.createElement('th');
              contractNameHeader.innerHTML = 'Name';
              theadTr.appendChild(contractNameHeader);
              var contractTickerHeader = document.createElement('th');
              contractTickerHeader.innerHTML = 'Access cost';
              theadTr.appendChild(contractTickerHeader);
              

              var usdHeader2 = document.createElement('th');
              usdHeader2.innerHTML = 'Available amount';
              theadTr.appendChild(usdHeader2);

              var usdHeader3 = document.createElement('th');
              usdHeader3.innerHTML = 'Collected amount';
              theadTr.appendChild(usdHeader3);

              var usdHeaderOptions = document.createElement('th');
              usdHeaderOptions.innerHTML = 'Options';
              theadTr.appendChild(usdHeaderOptions);
      
              thead.appendChild(theadTr)
      
              table.className = 'table';
              table.appendChild(thead);
      
              contentInfo[0].forEach((valor, clave) => {
                var tbodyTr = document.createElement('tr');
                var contractTd = document.createElement('td');
                contractTd.innerHTML = "<b>"+valor.sequenceId+"</b>";
                tbodyTr.appendChild(contractTd);
                var contractTickerTd = document.createElement('td');
                contractTickerTd.innerHTML = '<b>' + valor.name + '</b>';
                tbodyTr.appendChild(contractTickerTd);
                var balanceTd = document.createElement('td');
                balanceTd.innerHTML = '<b>' + Web3.utils.fromWei(valor.cost,"ether") + '</b>';
                tbodyTr.appendChild(balanceTd);
                var balanceUSDTd2 = document.createElement('td');
                balanceUSDTd2.innerHTML = '<b>' + Web3.utils.fromWei(valor.amountAvailable,"ether") + '</b>';
                tbodyTr.appendChild(balanceUSDTd2);
                var balanceUSDTd3 = document.createElement('td');
                balanceUSDTd3.innerHTML = '<b>' + Web3.utils.fromWei(valor.totalAmount,"ether") + '</b>';
                tbodyTr.appendChild(balanceUSDTd3);
                var balanceUSDTdOption2 = document.createElement('td');
                balanceUSDTdOption2.innerHTML = '<input type="button" id="copyMonetizadoTagButton" onclick="getMonetizadoTag('+valor.sequenceId+')" value="Copy Monetizado tag to clipboard" class="btn btn-secondary btn-block" />';
                tbodyTr.appendChild(balanceUSDTdOption2);
                var balanceUSDTdOption3 = document.createElement('td');
                balanceUSDTdOption3.innerHTML = '<input type="button" id="collectMoneyButton" onclick="collectMoney('+valor.sequenceId+')" value="Collect money" class="btn btn-secondary btn-block" />';
                tbodyTr.appendChild(balanceUSDTdOption3);
                tbody.appendChild(tbodyTr);
            });
      
            table.appendChild(tbody);
      
              list.appendChild(table);
          }
          //$('.loading_message').css('display','none');
        }
        //return contentInfo;
    
}

async function getMonetizadoTag(sequenceId) {
    var accounts = await ethereum.request({method: 'eth_requestAccounts'});
    var account = accounts[0];
    
    var networkSelected = "polkadot:testnet";

    var tag = networkSelected+"://"+account+"/"+sequenceId;
    navigator.clipboard.writeText(tag);
}


async function collectMoney(sequenceId){
    var accounts = await ethereum.request({method: 'eth_requestAccounts'});
    var account = accounts[0];
    
    var networkSelected = "polkadot:testnet";

    const contractNetwork = networksContracts[networkSelected];
    var networkSelectedProperties = networksProperties[networkSelected];

    var web3 = new Web3(new Web3.providers.HttpProvider(networkSelectedProperties.urlRPC));

    var contractPublic = await getContract(web3,contractNetwork,account);

    const networkName = networkSelected.split(':')[0];

    const isEIP1559 = networksEIP1559.includes(networkName);

    if(contractPublic != undefined) {
        var amountToCollect = 0;
        var contentInfo = await ethereum
              .request({
                method: 'eth_call',
                params: [
                  {
                    from: account, // The user's active address.
                    data: contractPublic.methods.getContent(account,sequenceId).encodeABI(),
                    to: contractNetwork
                  },
                ],
              });
        contentInfo = iface.decodeFunctionResult("getContent", contentInfo);
        if(contentInfo.length > 0) {
            amountToCollect = contentInfo[0].amountAvailable.toBigInt();
        }
        const query = contractPublic.methods.withdraw(sequenceId,amountToCollect);
        const encodedABI = query.encodeABI();

        const paramsForEIP1559 =  { from: account, 
            to: contractNetwork,
            data: encodedABI};

        var withdrawMoneyFromContentId = await ethereum
        .request({
        method: 'eth_sendTransaction',
        params: [
            paramsForEIP1559
        ],
        });
        await sleep(10000);
        //checkTx(withdrawMoneyFromContentId,web3);

        await getContentList();
    }
}

async function createContent() {
    var accounts = await ethereum.request({method: 'eth_requestAccounts'});
    var account = accounts[0];
    
    var networkSelected = "polkadot:testnet";

    const contractNetwork = networksContracts[networkSelected];
    var networkSelectedProperties = networksProperties[networkSelected];

    var web3 = new Web3(new Web3.providers.HttpProvider(networkSelectedProperties.urlRPC));

    var contractPublic = await getContract(web3,contractNetwork,account);

    const networkName = networkSelected.split(':')[0];


    if(contractPublic != null) {
      var contentName = $('#content_name').val();
      if(contentName == '') {
        $('#errorCreateContent').css("display","block");
        $('#errorCreateContent').text("Content name is invalid");
        return;
      }
      var contentAmount = $('#content_amount').val();
      if(contentAmount == '' || contentAmount < 0) {
        $('#errorCreateContent').css("display","block");
        $('#errorCreateContent').text("The amount to pay is not valid.");
        return;
      }
      try
      {
        $('.loading_message_creating').css("display","block");
        contentAmount = web3.utils.toWei(contentAmount,"ether");
        const query = contractPublic.methods.add(contentName, contentAmount);
        const encodedABI = query.encodeABI();
        //const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());

        const paramsForEIP1559 = { from: account, 
            to: contractNetwork,
            data: encodedABI};

        var createContentId = await ethereum
            .request({
            method: 'eth_sendTransaction',
            params: [
                paramsForEIP1559
            ],
        });
        await sleep(10000);
        //checkTx(createContentId,web3);
        
        var contentCreated = await web3.eth.getTransactionReceipt(createContentId);
        if(contentCreated == null) {
          $('#successCreateContent').css("display","none");
          $('.invalid-feedback').css("display","block");
          $('.invalid-feedback').text("Error creating the content");
          return;
        }
        
        $('#content_name').val('');
        $('#amount_name').val('');
        $('#errorCreateContent').css("display","none");
        $('.loading_message_creating').css("display","none");
        $('#successCreateContent').css("display","block");
        $('#successCreateContent').text("Content created successfully with the name: " + contentName);
      } catch(e) {
        $('.valid-feedback').css('display','none');
          $('.invalid-feedback').css('display','block');
          $('.loading_message_creating').css("display","none");
          $('.invalid-feedback').text(e.message);
      }
      
      
    }
  }


function checkTx(hash, web3) {
    //let statusElement = document.getElementById("tx-status")

    // Log which tx hash we're checking
    console.log("Waiting for tx " + hash)
    //statusElement.innerHTML = "Waiting"

    // Set interval to regularly check if we can get a receipt
    let interval = setInterval(() => {

        web3.eth.getTransactionReceipt(hash, (err, receipt) => {

            // If we've got a receipt, check status and log / change text accordingly
            if (receipt) {
                
                console.log("Gotten receipt")
                if (receipt.status === true) {
                    console.log(receipt)
                    //statusElement.innerHTML = "Success"
                } else if (receipt.status === false) {
                    console.log("Tx failed")
                    //statusElement.innerHTML = "Failed"
                }

                // Clear interval
                clearInterval(interval)
            }
        })
    }, 1000)
}
