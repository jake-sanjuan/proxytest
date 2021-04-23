//SPDX-License-Identifier: None
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Test is Initializable {

  uint public value;

  function initialize (uint _value) external initializer { 
    value = _value;
  }

  function getValue() external view returns (uint) {
    return value;
  }
}
