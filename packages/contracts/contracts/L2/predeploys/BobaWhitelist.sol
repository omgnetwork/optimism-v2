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
  // The whitelisted ERC20 contracts can use 0 gas price to
  // approve the whitelisted contracts
  mapping(address => bool) public whitelistedERC20Contracts;

  /********************
   *      Events      *
   ********************/

  event AddWhitelistedContract(address owner, address contractAddress);

  event RemoveWhitelistedContract(address sender, address contractAddress);

  event AddWhitelistedERC20Contract(address owner, address contractAddress);

  event RemoveWhitelistedERC20Contract(address sender, address contractAddress);

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

  /**
   * @dev Add whitelisted contract
   *
   * @param _whitelistedERC20Contract a whitelisted ERC20 contract address
   */
  function addWhitelistedERC20Contract(address _whitelistedERC20Contract) public onlyOwner {
    whitelistedERC20Contracts[_whitelistedERC20Contract] = true;

    emit AddWhitelistedERC20Contract(owner(), _whitelistedERC20Contract);
  }

  /**
   * @dev Remove whitelisted ERC20 contract
   *
   * @param _whitelistedERC20Contract a whitelisted ERC20 contract address
   */
  function removeWhitelistedERC20Contract(address _whitelistedERC20Contract) public onlyOwner {
    whitelistedERC20Contracts[_whitelistedERC20Contract] = false;

    emit RemoveWhitelistedERC20Contract(owner(), _whitelistedERC20Contract);
  }
}
