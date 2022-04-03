import { useState } from "react";
import SecondaryButton from "./secondary-button";
import { ethers } from "ethers";
import abi from "../artifacts/contracts/Keyboards.sol/Keyboards.json"

export default function TipButton({keyboardsContract, index}) {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const contractABI = abi.abi;

    const [mining, setMining] = useState(false);

    const submitTip = async (e) => {
        if(!keyboardsContract) {
            console.error('KeyboardsContract object is required to tip a keyboard');
            return;
        }

        setMining(true);
        try {
            const tx = await contract.tipKeyboard(index, {value: ethers.utils.parseEther('0.01')});
            await tx.wait();
            console.log(tx.hash);
        } finally {
            setMining(false);
        }
    }

    return <SecondaryButton onClick={submitTip} disabled={mining}>{mining ? 'Tipping...': 'Tip 0.01 eth!'}</SecondaryButton>
}