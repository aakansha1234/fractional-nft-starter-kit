# 🏗 Fractionalized NFT prototype

This prototype demonstrates how an NFT can be collectively owned and governed by a community.

- NFT owner deploys `YourContract` and deposits their NFT into the contract which starts a bid period.
- People bid with their ETH, and the contract mints equivalents $FRAC tokens to the bidder.
- After a deadline, if enough ETH is collected, original NFT owner can withdraw the ETH. This completes the bidding.
- Now all $FRAC holders collectively own this NFT.
- `YourContract` provides the capability to call any address with any calldata provided the majority of $FRAC holders agree.
- To do this, a holder first proposes this call by adding `to` address, and some calldata on-chain.
- Holders vote, and if 50% of token power votes before the deadline, the call can be executed.
- This lets holders sell this NFT.
- Once NFT is sold, and if there is ether in the contract (maybe through NFT sale or other activity), holders can claim this ETH in proportion to their $FRAC holding. This also burns their tokens.


# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/aakansha1234/fractional-nft-starter-kit.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd fractional-nft-starter-kit
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd fractional-nft-starter-kit
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd fractional-nft-starter-kit
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# 🚶‍♂️ Demo walkthrough

- Prepare 3 separate browser windows for localhost. Make sure all of them have different user addresses.
- The first window will be the NFT seller. Mint, approve and transfer your NFT to the `YourContract` contract from the Bidder UI.
- Then from other 2 windows, bid on this NFT so that the total bid amount is greater than the minimum ask.
- After the deadline, from the owner window, claim the eth accumulated through bid.

Now we'll simulate the action of selling this fractionalized NFT from this contract. You can now move to the VoteUI.
- Transfer some eth (0.1 to 0.5) to `YourContract`.
- Now from other two windows: propose, vote and execute a call to transfer this NFT to another address. You can use `cast` to create the calldata (`cast calldata ...`).
- After execute, you should check if the NFT is no longer owned by `YourContract`.
- If so, claim the eth present in `YourContract` and verify that your FRAC balance drops to 0.


# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum
Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
