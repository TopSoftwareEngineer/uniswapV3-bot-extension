/* eslint-disable import/no-anonymous-default-export */
import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import { AlphaRouter } from '@uniswap/smart-order-router'
import { BigNumber, ethers } from "ethers";
// require("dotenv").config();

export default () => {
	const minGas = 0.0001
	const chianId = 1
	const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
	const wallet = new ethers.Wallet('a5406b9513539b6752a5e549ae6b54c83e58f05037fb93d61b353183c460df94',provider);
	const router = new AlphaRouter({ chainId: chianId, provider: provider });
	console.log(wallet.address)

	const [url, setUrl] = useState<string|undefined>('');

	useEffect(() => {  
		
	}, []);

	const onStart = () => {
		run()
	}

	const balanceOf = async () => {
		try {
			const balance = await provider.getBalance(wallet.address);
			const balanceInEth = ethers.utils.formatEther(balance)
			return Number(balanceInEth)
		} catch (error) {
			console.error(error)
		}
		return null
	}

	const swap = async () => {
		try {
			console.log('swap called')
			const WETH = new Token(
				chianId,
				"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
				// "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5",
				18,
				"WETH",
				"Wrapped Ether"
			);
			
			const USDT = new Token(
				chianId,
				"0xdAC17F958D2ee523a2206206994597C13D831ec7",
				// "0x98B78F473dcFA4122dcE98583E088d594185Fba7",
				6,
				"USDT",
				"USD Coin"
			);
			const swapAmount = ethers.utils.parseEther("0.001")
			const route = await router.route(CurrencyAmount.fromRawAmount(WETH, swapAmount.toHexString()), USDT, TradeType.EXACT_INPUT, {
				recipient: wallet.address,
				slippageTolerance: new Percent(5, 100),
				deadline: Math.floor(Date.now()/1000 +1800)
			});

			if(route && route.methodParameters){
				console.log("estimated gas: " + ethers.utils.formatEther(route.estimatedGasUsed.mul(route.gasPriceWei)))
			
				const transaction = {
					data: route.methodParameters.calldata,
					to: process.env.ROUTER,
					value: BigNumber.from(route.methodParameters.value),
					from: wallet.address,
					gasPrice: BigNumber.from(route.gasPriceWei),
				};
			
				const tx = await wallet.sendTransaction(transaction); 
				console.dir(tx);
				alert("Send finished!");
			}
			else{
				console.log('route is null');
			}
		} catch (error) {
			console.error('swap exception ->',error)
		}
	}

	const run = async () => {
		const balance = await balanceOf()
		console.log("balance -> ",balance)
		if (balance!==null && balance>=minGas) await swap()
		setTimeout(run, 3000)
	};

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
		<button onClick={onStart}>START</button>
      </header>
    </div>
  );
}
