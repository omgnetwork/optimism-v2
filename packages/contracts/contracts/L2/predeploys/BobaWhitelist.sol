// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title BobaWhitelist
 * @dev A contract that stores whitelisted contracts
 * that users can interact with 0 gas fee
 */
contract BobaWhitelist is Ownable {
  /**********************
   * Contract Variables *
   **********************/

  mapping(address => bool) public whitelistedContracts;

  /********************
   *      Events      *
   ********************/

  event AddWhitelistedContract(
    address owner,
    address contractAddress
  );

  event RemoveWhitelistedContract(address sender, address contractAddress);

  /********************
   * Public Functions *
   ********************/

  /**
   * @dev Add whitelisted contract
   *
   * @param _whitelistedContract a whitelisted contract address
   */
  function addWhitelistedContract(address _whitelistedContract) public onlyOwner {
    whitelistedContracts[_whitelistedContract] = true;

    emit AddWhitelistedContract(owner(), _whitelistedContract);
  }

  /**
   * @dev Remove whitelisted contract
   *
   * @param _whitelistedContract a whitelisted contract address
   */
  function removeWhitelistedContract(address _whitelistedContract) public onlyOwner {
    whitelistedContracts[_whitelistedContract] = false;

    emit RemoveWhitelistedContract(owner(), _whitelistedContract);
  }
}
