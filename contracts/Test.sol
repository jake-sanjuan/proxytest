//SPDX-License-Identifier: None
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/proxy/Initializable.sol";

contract Test is Initializable {

  uint public value;

  function initialize (uint _value) public initializer { 
    value = _value;
  }

  function getValue() external view returns (uint) {
    return value;
  }
}
