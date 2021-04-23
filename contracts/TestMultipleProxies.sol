//SPDX-License-Identifier: None
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * TODO: Deploy behind different proxy, make sure multiple proxies can 
 * be handled via ProxyAdmin
 */ 

contract TestMultipleProxies is Initializable {

    uint public value;

    function initialize(uint _value) external initializer {
        value = _value;
    }

    function multiplyByTwo() external {
        value *= 2;
    }
}