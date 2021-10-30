const abi = require('./apenout.json');

export function getApenoutContract(web3) {
    const instance = new web3.eth.Contract(
        abi,
        '0xDF59B2f439a2D43b4538599211444419fA53c83d'
    );
    return instance;
}