// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourContract is ERC20, Ownable {
  uint256 public minBidAmount;
  uint256 public bidDeadline;

  IERC721 public nft;
  uint256 public id;

  mapping(bytes32 => uint256) votes;
  mapping(bytes32 => mapping(address => bool)) isVoted;

  uint256 totalMinted = 0;
  uint256 totalEth = 0;
  constructor() ERC20("Frac", "FRAC") {
  }

  receive() external payable {
    // require(nft.ownerOf(id) == address(this));
    // require(block.timestamp >= bidDeadline);
  }

  // this kicks off the entire process.
  // NFT sellers calls this to transfer their NFT and sets Bid parameters.
  function depositNFT(address _nft, uint256 _id, uint256 _minBidAmount, uint256 _bidDeadline) external onlyOwner {
    IERC721(_nft).transferFrom(msg.sender, address(this), _id);
    require(_minBidAmount > 0, "set minBidAmount > 0");
    require(_bidDeadline > block.timestamp, "set bidDeadline in future");
    require(bidDeadline == 0, "NFT already deposited");
    nft = IERC721(_nft);
    id = _id;
    minBidAmount = _minBidAmount;
    bidDeadline = _bidDeadline;
  }

  // once NFT has been deposited, bidders bid with their ETH
  function bid() external payable {
    // require(block.timestamp < bidDeadline, "over");

    _mint(msg.sender, msg.value);
  }

  // Take back bid amount if the bid is still active
  function unbid(uint256 amount) external {
    require(balanceOf(msg.sender) >= amount, "too high");
    // require(block.timestamp < bidDeadline, "over");

    _burn(msg.sender, amount);
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "fail");
  }

  // If the total eth raised during the bid is lower than `minBidAmount`, owner can withdraw the NFT.
  function withdrawNFT() external onlyOwner {
    // require(block.timestamp > bidDeadline, "!over");
    require(address(this).balance < minBidAmount, "sold");

    nft.safeTransferFrom(address(this), msg.sender, id);
  }

  // If the total eth raised during the bid is higher than `minBidAmount`, owner can withdraw the ETH.
  function withdrawBidETH() external onlyOwner {
    // require(block.timestamp > bidDeadline, "!over");
    require(address(this).balance >= minBidAmount, "!sold");

    renounceOwnership();

    (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(success, "fail");
  }

  // If the bid is successful, FRAC holders have full control over this contract.
  // they can propose any external call from this contract.
  // Holders will vote and if it reaches the majority, it can be executed.
  function proposeCall(address to, bytes calldata data, uint256 deadline) external {
    require(balanceOf(msg.sender) > 0, "0 vote power");
    // require(block.timestamp < deadline, "over");

    bytes32 hash = keccak256(abi.encodePacked(to, data, deadline));
    require(votes[hash] == 0, "!proposal");
    votes[hash] = balanceOf(msg.sender);
    isVoted[hash][msg.sender] = true;
  }

  // vote on an open proposal (before the deadline)
  function vote(address to, bytes calldata data, uint256 deadline) external {
    require(balanceOf(msg.sender) > 0, "0 votes");
    // require(block.timestamp < deadline, "over");

    bytes32 hash = keccak256(abi.encodePacked(to, data, deadline));
    require(votes[hash] > 0, "!proposal");
    require(!isVoted[hash][msg.sender], "voted");

    votes[hash] += balanceOf(msg.sender);
    isVoted[hash][msg.sender] = true;
  }

  function getVoteInfo(address to, bytes calldata data, uint256 deadline) external view returns (uint256 numvotes, uint256 minVotes) {
    bytes32 hash = keccak256(abi.encodePacked(to, data, deadline));
    return (votes[hash], totalSupply()/2);
  }

  // If at least 50% of the tokens have voted, execute the call.
  // this has the potential to transfer the NFT as well, so can be used to integrate with marketplaces or P2P deal.
  function executeCall(address to, bytes calldata data, uint256 deadline) external {
    // require(block.timestamp > deadline, "!over");

    bytes32 hash = keccak256(abi.encodePacked(to, data, deadline));
    require(votes[hash] > totalSupply()/2, "!majority");

    (bool success, ) = to.call(data);
    require(success, "fail");
  }

  // If this contract no longer owns the NFT (either it is sold or transferred),
  // FRAC holders can burn their tokens and claim any ETH held by this contract in proportion.
  function reclaimEther() external {
    uint256 bal = balanceOf(msg.sender);
    require(bal > 0, "!holder");
    require(nft.ownerOf(id) != address(this), "still owner");
    if (totalMinted == 0) {
      totalMinted = totalSupply();
      totalEth = address(this).balance;
    }

    _burn(msg.sender, bal);

    uint256 claimValue = totalEth * bal / totalMinted;

    (bool success, ) = payable(msg.sender).call{value: claimValue}("");
    require(success, "fail");
  }
}