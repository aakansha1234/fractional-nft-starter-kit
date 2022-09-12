import { Button, Divider, Input } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";

import { Address, Events } from "../components";
import { useBalance } from "eth-hooks";
export default function BidderUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  tx,
  readContracts,
  writeContracts,
}) {
  const [tokenId, setTokenId] = useState("loading...");
  const [amount, setAmount] = useState("loading...");
  const [bidDuration, setBidDuration] = useState("loading...");

  let nftAddress = readContracts && readContracts.YourNFT ? readContracts.YourNFT.address : "...";
  let bidAddress = readContracts && readContracts.YourContract ? readContracts.YourContract.address : "...";

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Bidding UI:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            placeholder="tokenId"
            onChange={e => {
              setTokenId(e.target.value);
            }}
          />
          <Input
            placeholder="Minimum sell amount"
            onChange={e => {
              setAmount(e.target.value);
            }}
          />
          <Input
            placeholder="Bid duration from now in seconds"
            onChange={e => {
              setBidDuration(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.YourNFT["mint(uint256)"](tokenId));
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Mint NFT
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.YourNFT.approve(bidAddress, tokenId));
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Approve NFT
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              console.log("now", Date.now());
              const deadline = (Math.floor(Date.now() / 1000) + parseInt(bidDuration)).toString();
              console.log("deadline", deadline);
              const result = tx(
                writeContracts.YourContract.depositNFT(nftAddress, tokenId, utils.parseEther(amount), deadline),
              );
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Deposit NFT
          </Button>
        </div>
        <Divider />
        NFT Address:
        <Address address={nftAddress} fontSize={16} />
        <br />
        YourContract Address:
        <Address address={bidAddress} fontSize={16} />
        <Divider />
        <Button
          onClick={() => {
            /* look how we call setPurpose AND send some value along */
            tx(
              writeContracts.YourContract.bid({
                value: utils.parseEther("0.5"),
              }),
            );
          }}
        >
          Bid 0.05 ETH
        </Button>
        <Button
          onClick={() => {
            /* look how we call setPurpose AND send some value along */
            tx(writeContracts.YourContract.unbid(utils.parseEther("0.5")));
          }}
        >
          Unbid 0.05 ETH
        </Button>
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <h2>YourContract Bal: {utils.formatEther(useBalance(localProvider, bidAddress))}</h2>
        <Divider />
        <Button
          onClick={() => {
            /* look how we call setPurpose AND send some value along */
            tx(writeContracts.YourContract.withdrawBidETH());
          }}
        >
          Claim sold ETH
        </Button>
        <Divider />
        Your Contract Address:
        <Address
          address={readContracts && readContracts.YourContract ? readContracts.YourContract.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
        <div style={{ margin: 8 }}>
          <Button
            onClick={() => {
              /*
              you can also just craft a transaction and send it to the tx() transactor
              here we are sending value straight to the contract's address:
            */
              tx({
                to: writeContracts.YourContract.address,
                value: utils.parseEther("0.5"),
              });
              /* this should throw an error about "no fallback nor receive function" until you add it */
            }}
          >
            Send 0.5 ETH to YourContract
          </Button>
        </div>
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <h2>NFT transfer events:</h2>
      <Events
        contracts={readContracts}
        contractName="YourNFT"
        eventName="Transfer"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 256 }}></div>
    </div>
  );
}
