// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper contract to easily mint NFTs for demo
contract YourNFT is ERC721 {
    constructor() ERC721("NFT", "NFT") {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function mint(uint256 tokenId) external {
        _mint(msg.sender, tokenId);
    }
}