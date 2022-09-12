import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";

import { Address, Balance, Events } from "../components";
import { useBalance } from "eth-hooks";
export default function VoteUI({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [to, setTo] = useState("loading...");
  const [data, setData] = useState("loading...");
  const [deadline, setDeadline] = useState("loading...");
  const [fracBal, setFracBal] = useState();
  const [fracTotal, setFracTotal] = useState();
  const [curTime, setcurTime] = useState();

  let nftAddress = readContracts && readContracts.YourNFT ? readContracts.YourNFT.address : "...";
  let bidAddress = readContracts && readContracts.YourContract ? readContracts.YourContract.address : "...";

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>FRAC holder UI:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            placeholder="to"
            onChange={e => {
              setTo(e.target.value);
            }}
          />
          <Input
            placeholder="calldata"
            onChange={e => {
              setData(e.target.value);
            }}
          />
          <Input
            placeholder="deadline in unix epoch seconds"
            onChange={e => {
              setDeadline(e.target.value);
            }}
          />
          <div style={{ margin: 8 }}>
            <Button
              onClick={() => {
                tx(writeContracts.YourContract.proposeCall(to, data, deadline));
              }}
            >
              Propose
            </Button>
            <Button
              onClick={() => {
                tx(writeContracts.YourContract.vote(to, data, deadline));
              }}
            >
              Vote
            </Button>
            <Button
              onClick={() => {
                tx(writeContracts.YourContract.executeCall(to, data, deadline));
              }}
            >
              Execute
            </Button>
            <br />
            <Button
              onClick={() => {
                setcurTime(Math.floor(Date.now() / 1000));
              }}
            >
              Current unix epoch second:
            </Button>
            {curTime}
          </div>
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
            tx(writeContracts.YourContract.reclaimEther());
          }}
        >
          Claim ETH
        </Button>
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <h2>YourContract Bal: {utils.formatEther(useBalance(localProvider, bidAddress))}</h2>
        <Divider />
        <Button
          onClick={async () => setFracBal(utils.formatEther(await readContracts.YourContract.balanceOf(address)))}
        >
          Your $FRAC Balance:
        </Button>
        {fracBal}
        <br />
        <Button onClick={async () => setFracTotal(utils.formatEther(await readContracts.YourContract.totalSupply()))}>
          Total $FRAC supply:
        </Button>
        {fracTotal}
        <Divider />
        YourContract Address:
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
                value: utils.parseEther("0.05"),
              });
              /* this should throw an error about "no fallback nor receive function" until you add it */
            }}
          >
            Send 0.05 ETH to YourContract
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
