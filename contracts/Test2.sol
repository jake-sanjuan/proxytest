//SPDX-License-Identifier: None
pragma solidity ^0.8.0;

import "./Test.sol";

contract Test2 is Test {

    function increment() external {
        value++;
    }
}