//SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0 < 0.7.0;

contract Funds {
  uint256 public funds;
  mapping(address => bool) public permissions;

  constructor() public {
    permissions[msg.sender] = true;
  }

  function givePermission(address _user) public {
    require(permissions[msg.sender], "Permission required to grant permission");

    permissions[_user] = true;
  }

  function add(uint256 amount) public {
    require(permissions[msg.sender], "Permission required to add funds");

    funds += amount;
  }

  function withdraw(uint256 amount) public {  
    require(permissions[msg.sender], "Permission required to withdraw funds");

    funds -= amount;
  }
}
