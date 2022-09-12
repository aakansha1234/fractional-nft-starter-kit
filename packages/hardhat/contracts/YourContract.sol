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
  constructor() ERC20("Frac", "FRAC") {
  }

  receive() external payable {
    require(nft.ownerOf(id) == address(this));
    require(block.timestamp >= bidDeadline);
  }

  function depositNFT(address _nft, uint256 _id, uint256 _minBidAmount, uint256 _bidDeadline) external onlyOwner {
    IERC721(_nft).transferFrom(msg.sender, address(this), _id);
    require(_minBidAmount > 0, "!minAmt");
    require(_bidDeadline > block.timestamp, "!deadline");
    require(bidDeadline == 0, "already deposited");
    nft = IERC721(_nft);
    id = _id;
    minBidAmount = _minBidAmount;
    bidDeadline = _bidDeadline;
  }

  function bid() external payable {
    require(block.timestamp < bidDeadline, "over");

    _mint(msg.sender, msg.value);
  }

  function unbid(uint256 amount) external {
    require(balanceOf(msg.sender) >= amount, "too high");
    require(block.timestamp < bidDeadline, "over");

    _burn(msg.sender, amount);
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "fail");
  }

  function withdrawNFT() external onlyOwner {
    require(block.timestamp > bidDeadline, "!over");
    require(address(this).balance < minBidAmount, "sold");

    nft.safeTransferFrom(address(this), msg.sender, id);
  }

  function withdrawBidETH() external onlyOwner {
    require(block.timestamp > bidDeadline, "!over");
    require(address(this).balance >= minBidAmount, "!sold");

    (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(success, "fail");
  }

  function proposeCall(address to, bytes calldata callData, uint256 deadline) external {
    require(balanceOf(msg.sender) > 0, "0 vote power");
    require(block.timestamp < deadline, "over");

    bytes32 hash = keccak256(abi.encodePacked(to, callData, deadline));
    require(votes[hash] == 0, "!proposal");
    votes[hash] = balanceOf(msg.sender);
    isVoted[hash][msg.sender] = true;
  }

  function vote(address to, bytes calldata callData, uint256 deadline) external {
    require(balanceOf(msg.sender) > 0, "0 votes");
    require(block.timestamp < deadline, "over");

    bytes32 hash = keccak256(abi.encodePacked(to, callData, deadline));
    require(votes[hash] > 0, "!proposal");
    require(!isVoted[hash][msg.sender], "voted");

    votes[hash] += balanceOf(msg.sender);
    isVoted[hash][msg.sender] = true;
  }

  function getVoteInfo(address to, bytes calldata callData, uint256 deadline) external view returns (uint256 numvotes, uint256 minVotes) {
    bytes32 hash = keccak256(abi.encodePacked(to, callData, deadline));
    return (votes[hash], totalSupply()/2);
  }

  function executeCall(address to, bytes calldata callData, uint256 deadline) external {
    require(block.timestamp > deadline, "!over");

    bytes32 hash = keccak256(abi.encodePacked(to, callData, deadline));
    require(votes[hash] > totalSupply()/2, "!majority");

    (bool success, ) = to.call(callData);
    require(success, "fail");
  }

  function reclaimEther() external {
    uint256 bal = balanceOf(msg.sender);
    require(bal > 0, "!holder");
    require(nft.ownerOf(id) != address(this), "still owner");
    _burn(msg.sender, bal);

    uint256 claimValue = address(this).balance / bal; // precision loss

    (bool success, ) = payable(msg.sender).call{value: claimValue}("");
    require(success, "fail");
  }
}