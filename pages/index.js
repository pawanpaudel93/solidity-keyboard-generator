import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Router from "next/router";
import PrimaryButton from "../components/primary-button";
import Keyboard from "../components/keyboard";
import TipButton from "../components/tip-button";
import addressesEqual from "../utils/addressesEqual";
import { UserCircleIcon } from "@heroicons/react/solid"
import getKeyboardsContract from "../utils/getKeyboardsContract"
import { useMetaMaskAccount } from "../components/meta-mask-account-provider";
import toast from "react-hot-toast";

export default function Home() {
  const { ethereum, connectedAccount, connectAccount } = useMetaMaskAccount();
  const [keyboards, setKeyboards] = useState([]);
  const [keyboardsLoading, setKeyboardsLoading] = useState(false);

  const keyboardsContract = getKeyboardsContract(ethereum);

  const getKeyboards = async () => {
    if (ethereum && connectedAccount) {
      setKeyboardsLoading(true);
      try {
        const keyboards = await keyboardsContract.getKeyboards();
        setKeyboards(keyboards);
      } finally {
        setKeyboardsLoading(false);
      }
    }
  }

  useEffect(() => getKeyboards(), [!!keyboardsContract, connectedAccount]);

  const addContractEventHandlers = () => {
    if (keyboardsContract && connectedAccount) {
      keyboardsContract.on('KeyboardCreated', async (keyboard) => {
        if(connectAccount && !addressesEqual(keyboard.owner, connectedAccount)) {
          toast('Somebody created a new keyboard!', {id: JSON.stringify(keyboard)});
        }
        await getKeyboards();
      })

      keyboardsContract.on('TipSent', (recipient, amount) => {
        if (addressesEqual(recipient, connectedAccount)) {
          toast(`You tipped ${ethers.utils.formatEther(amount)} ETH!`, {id: recipient+amount});
        }
      })
    }
  }

  useEffect(() => addContractEventHandlers(), [!!keyboardsContract, connectedAccount]);

  if (!ethereum) {
    return <p>Please install Metamask to connect to this site</p>
  }

  if(!connectedAccount) {
    return <PrimaryButton onClick={connectAccount}>Connect to Metamask Wallet</PrimaryButton>
  }
  if (keyboards.length > 0) {
    return (
      <div className="flex flex-col gap-4">
          <PrimaryButton onClick={() => Router.push('/create')}>Create a Keyboard!</PrimaryButton>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {keyboards.map(
              ([kind, isPBT, filter, owner], i) => (
                <div key={i} className="relative">
                  <Keyboard kind={kind} isPBT={isPBT} filter={filter} />
                  <span className="absolute top-1 right-6">
                  {addressesEqual(owner, connectedAccount) ?
                    <UserCircleIcon className="h-5 w-5 text-indigo-100" /> :
                    <TipButton keyboardsContract={keyboardsContract} index={i} />
                  }
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )
  }

  if (keyboardsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PrimaryButton onClick={() => Router.push('/create')}>Create a Keyboard!</PrimaryButton>
        <p>Loading Keyboards...</p>
      </div>
    )
  }

  // No keyboards yet
  return (
    <div className="flex flex-col gap-4">
      <PrimaryButton onClick={() => Router.push('/create')}>Create a Keyboard!</PrimaryButton>
      <p>No keyboards yet</p>
    </div>
  )
  
}