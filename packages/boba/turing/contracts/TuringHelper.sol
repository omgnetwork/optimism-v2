//SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.12;

import "hardhat/console.sol";

contract TuringHelper {

  bytes public data_URL;
  TuringHelper Self;
  bytes[] methods;

  event OffchainResponse(uint version, bytes responseData);

  constructor (string memory _url) public {
    console.log("TuringHelper.sol: Deploying a helper contract with data source:", _url);
    data_URL = bytes(_url);
    Self = TuringHelper(address(this));
  }

  //RegisterMethod(bytes)
  //a8847e88
  function RegisterMethod(bytes memory methodName) public {
    //require (bytes1(methodName[0]) == bytes1("h"), "Method != start with h");
    methods.push(methodName);
  }

  // function GetMethod(uint32 method_idx) 
  //   public view returns (bytes memory) 
  // {
  //   require (method_idx < methods.length, "IDX not in methods[]");
  //   return methods[method_idx];
  // }

  function _lenCalc1(bytes memory item, uint32 len) internal pure
    returns (uint8, uint32)
  {
    uint32 L = uint32(item.length);
    uint8 prefix;

    if (L > 255) {       //256 to ...
      len += 3;
      prefix = 0xb9;
    } else if (L > 55) { //56 to 255
      len += 2;
      prefix = 0xb8; 
    } else {             //0 to 55 case
      len += 1;
      prefix = 0x80 + uint8(L); //range [0x80, 0xb7]
    }

    return (prefix, len);
  }

  //genRequestRLP(bytes,bytes)
  //0d9bb200
  function genRequestRLP(bytes memory method, bytes memory payload) 
    internal view returns (bytes memory)
  {
    // This function generates a Turing request consisting of a
    // fixed prefix string followed by parameters in RLP encoding.
    // The outer container is a 4-element array containing a
    // single-byte version number and 3 strings: URL, method, request
    // payload. The payload is passed as-is to the remote server,
    // which is responsible for unpacking and interpreting it.

    // For now this is the only valid value and all others are reserved.
    byte request_version = 0x01;

    bytes memory prefix = bytes("_OMGXTURING_");
    require (prefix.length == 12, "Incorrect prefix length");
    uint i;
    uint j;

    // Constrain these to simplify the RLP encoding logic.
    require (data_URL.length < 65536, "data_URL too long");
    require (payload.length < 65536, "payload too long");

    uint32 l1 = uint32(data_URL.length);
    uint32 l2 = uint32(method.length);
    uint32 l3 = uint32(payload.length);

    uint32 pLen = 1 + l1 + l2 + l3; // Payload length + inner headers
    uint32 hLen = 1; // Extra length of list header

    uint8[4] memory pre;

    (pre[1], pLen) = _lenCalc1(data_URL, pLen);
    (pre[2], pLen) = _lenCalc1(method, pLen);
    (pre[3], pLen) = _lenCalc1(payload, pLen);

    //the goal here is to augment pLen in just the right way to accomodate 
    //all the possible lengths for all possible payloads

    // We now have the total length of the three items which will be in the list.
    // This determines the encoding required for the list header

    if (pLen > 65535) {      //total list payload: > 65535 case
      hLen += 3;
      pre[0] = 0xfa;
    } else if (pLen > 255) { //total list payload: 256 to 65535 case
      hLen += 2;
      pre[0] = 0xf9;
    } else if (pLen > 55) { //total list payload: 56 to 255 case
      hLen += 1;
      pre[0] = 0xf8;
    } else {                //total list payload: 0 to 55 case
      pre[0] = 0xc0 + uint8(pLen);
    }

    bytes memory result = new bytes(hLen + pLen + prefix.length);
    
    //add the prefix, not encoded 
    for (i=0; i < prefix.length; i++) result[j++] = prefix[i];
    
    //create the header for the list
    result[j++] = bytes1(pre[0]);
    if (pre[0] > 0xf9) {
      result[j++] = bytes1(uint8(pLen / 65536));
      pLen = pLen % 65536;
    }
    if (pre[0] > 0xf8) {
      result[j++] = bytes1(uint8(pLen / 256));
      pLen = pLen % 256;
    }
    if (pre[0] > 0xf7) {
      result[j++] = bytes1(uint8(pLen));
    }
    //first list entry
    result[j++] = request_version;

    //second list entry - data_URL
    result[j++] = bytes1(pre[1]);
    if (pre[1] > 0xb8) {
      result[j++] = bytes1(uint8(l1 / 256));
      l1 = l1 % 256;
    }
    if (pre[1] > 0xb7) {
      result[j++] = bytes1(uint8(l1));
    }
    for (i=0; i<data_URL.length; i++) result[j++] = data_URL[i];

    //third list entry - method
    result[j++] = bytes1(pre[2]);
    if (pre[2] > 0xb8) {
      result[j++] = bytes1(uint8(l2 / 256));
      l2 = l2 % 256;
    }
    if (pre[2] > 0xb7) {
      result[j++] = bytes1(uint8(l2));
    }
    for (i=0; i<method.length; i++) result[j++] = method[i];

    //third list entry - parameters
    result[j++] = bytes1(pre[3]);
    if (pre[3] > 0xb8) {
      result[j++] = bytes1(uint8(l3 / 256));
      l3 = l3 % 256;
    }
    if (pre[3] > 0xb7) {
      result[j++] = bytes1(uint8(l3));
    }
    for (i=0; i<payload.length; i++) result[j++] = payload[i];

    return result;
  }

  /* This is the interface to the off-chain mechanism. Although
     marked as "public", it is only to be called by TuringCall() 
     or TuringTX().
     The _slot parameter is overloaded to represent either the
     request parameters or the off-chain response, with the rType
     parameter indicating which is which. 
     When called as a request (rType == 1), it reverts with 
     an encoded TURING string. 
     The modified l2geth intercepts this special revert, 
     performs the off-chain interaction, then rewrites the parameters 
     and calls the method again in "response" mode (rType == 2). 
     This response is then passed back to the caller.
  */
  //GetResponse(uint32,uint32,bytes,uint32)
  //a6c40354

  function GetResponse(uint32 method_idx, uint32 rType, bytes memory _slot)
    public view returns (bytes memory) {

    require (msg.sender == address(this), "Turing:GetResponse:msg.sender != address(this)");
    require (method_idx < methods.length, "Turing:GetResponse:method not registered");
    require (rType == 1 || rType == 2, "Turing:GetResponse:rType != 1 || 2"); // l2geth can pass 0 here to indicate an error
    require (_slot.length > 0, "Turing:GetResponse:_slot.length == 0");

    if (rType == 1) {
      // knock knock - wake up the l2geth
      // force a revert
      // the if() avoids calling genRequestRLP unnecessarily
      //require (rType == 2, "Trigger first revert");
      require (rType == 2, string(genRequestRLP(methods[method_idx], _slot)));
    }
    //if (rType == 2) -> the l2geth has obtained fresh data for us
    return _slot;
  }

  // /* Checks the Turing payload generated for Geth
  // */
  // function GetResponseDryRun(uint32 method_idx, uint32 rType, bytes memory _slot)
  //   public view returns (bytes memory) {

  //   require (msg.sender == address(this), "Turing:GetResponse:msg.sender != address(this)");
  //   require (method_idx < methods.length, "Turing:GetResponse:method not registered");
  //   require (rType == 1 || rType == 2, "Turing:GetResponse:rType != 1 || 2"); // l2geth can pass 0 here to indicate an error
  //   require (_slot.length > 0, "Turing:GetResponse:_slot.length == 0");

  //   // if (rType == 1) {
  //   //   // knock knock - wake up the l2geth
  //   //   // force a revert
  //   //   // the if() avoids calling genRequestRLP unnecessarily
  //   //   require (rType == 2, string(genRequestRLP(methods[method_idx], _slot)));
  //   // }
  //   //if (rType == 2) -> the l2geth has obtained fresh data for us
  //   //note the change from string() here
  //   bytes memory example = genRequestRLP(methods[method_idx], _slot);
  //   return example;//genRequestRLP(methods[method_idx], _slot);
  // }

  /* This is called from the external contract. It takes a method
     selector and an abi-encoded request payload. The URL and the
     list of allowed methods are supplied when the contract is
     created. In the future some of this registration might be moved
     into l2geth, allowing for security measures such as TLS client
     certificates. A configurable timeout could also be added.

     This is a "view" function and may be used from eth_call. See below.
  */
  function TuringCall(uint32 method_idx, bytes memory _payload)
    public view returns (bytes memory) {
      require (method_idx < methods.length, "Turing:TuringCall:method not registered");
      require (_payload.length > 0, "Turing:TuringCall:payload length == 0");

      /* Initiate the request. This can't be a local function call
         because that would stay inside the EVM and not give l2geth
         a place to intercept and re-write the call.
      */
      bytes memory response = Self.GetResponse(method_idx, 0, _payload);
      return response;
  }

  // /* Confirms correct payload packing and structure.
  // */
  // function TuringCallDryRun(uint32 method_idx, bytes memory _payload)
  //   public view returns (bytes memory) {
  //     require (method_idx < methods.length, "Turing:TuringCall:method not registered");
  //     require (_payload.length > 0, "Turing:TuringCall:payload length == 0");

  //     /* Initiate the request. This can't be a local function call
  //        because that would stay inside the EVM and not give l2geth
  //        a place to intercept and re-write the call.
  //     */
  //     bytes memory response = Self.GetResponseDryRun(method_idx, 1, _payload);
  //     return response;
  // }

  /* Same as TuringCall() but logs the offchain response so that a future
     verifier or fraud prover can replay the transaction and ensure that it
     results in the same state root as during the initial execution. Note -
     a future version might need to include a timestamp and/or more details
     about the offchain interaction.
  */
  function TuringTx(uint32 method_idx, bytes memory _payload)
    public returns (bytes memory) {
      require (method_idx < methods.length, "Turing:TuringTx:method not registered");
      require (_payload.length > 0, "Turing:TuringTx:payload length == 0");

      /* Initiate the request. This can't be a local function call
         because that would stay inside the EVM and not give l2geth
         a place to intercept and re-write the call.
      */
      bytes memory response = Self.GetResponse(method_idx, 1, _payload);
      emit OffchainResponse(0x01, response);
      return response;
  }
}

