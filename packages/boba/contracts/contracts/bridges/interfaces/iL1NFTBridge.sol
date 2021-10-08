// SPDX-License-Identifier: MIT
pragma solidity >0.7.5;
pragma experimental ABIEncoderV2;

/**
 * @title iL1NFTBridge
 */
interface iL1NFTBridge {

    event NFTDepositInitiated (
        address indexed _l1Contract,
        address indexed _l2Contract,
        address indexed _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    );

    event NFTWithdrawalFinalized (
        address indexed _l1Contract,
        address indexed _l2Contract,
        address indexed _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    );

    function depositNFT(
        address _l1Contract,
        address _l2Contract,
        uint256 _tokenId,
        uint32 _l2Gas,
        bytes calldata _data
    )
        external;

    function depositNFTTo(
        address _l1Contract,
        address _l2Contract,
        address _to,
        uint256 _tokenId,
        uint32 _l2Gas,
        bytes calldata _data
    )
        external;

    function finalizeNFTWithdrawal(
        address _l1Contract,
        address _l2Contract,
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata _data
    )
        external;

}
