/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import { AlphaRouter } from '@uniswap/smart-order-router'
import { BigNumber, ethers } from "ethers";
import React from 'react';
// require("dotenv").config();

export default () => {

	const chianId = 1
	const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
	const router = new AlphaRouter({ chainId: chianId, provider: provider });

	const [privateKey, setPrivateKey] = useState<string|null>(localStorage.getItem('privateKey') ? localStorage.getItem('privateKey') : '');
	const [minGas, setMinGas] = useState<number>(localStorage.getItem('minGas')? Number(localStorage.getItem('minGas')) : 0.0001);
	let timeOut : any = null;let wallet : any = null;

	useEffect(() => {  
		console.log('privateKey',privateKey)
		console.log('minGas',minGas)
		const temp = document.getElementById('wallet-address')
		if(privateKey && privateKey.length === 64 ){
			wallet = new ethers.Wallet(privateKey,provider);
			if(temp) {
				temp.innerHTML = wallet.address;
			}
		}
		else{
			if(temp) {
				temp.innerHTML = '0x0000000000000000000000000000000000000000';
			}
		}
	}, []);

	const run = () => {
		timeOut = setTimeout(async function()
		{
			console.log(timeOut)
			const balance = await balanceOf()
			console.log("balance -> ",balance)
			if (balance!==null && balance>=minGas) {
				await swap(balance)
				if(timeOut){
					run()
				}
			}
		}, 3000);
	};

	const onStart = () => {
		if(privateKey){
			try{
				const element = document.getElementById('start-stop')
				if(timeOut){
					console.log('clear timer ',timeOut)
					clearTimeout(timeOut);
					timeOut = null;
					if(element){
						element.innerHTML = 'START' 
					}
				}else{
					if(element){
						element.innerHTML = 'STOP' 
					}
					console.log('run timer',timeOut)
					run();
				}
			}
			catch(error){
				console.log(error)
				alert('Input correct wallet address')
			}
		}
		else{
			alert('Input wallet address')
		}
	}

	const onSave = () => {
		console.log('onSave->',privateKey + " " + minGas)
		localStorage.setItem('privateKey', privateKey ? privateKey : '');
		localStorage.setItem('minGas', minGas.toString());
		// setPrivateKey('')
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

	const swap = async (balance : number) => {
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
			const swapAmount = ethers.utils.parseEther(balance.toString())
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

				console.log('transaction param -> ',transaction);
			
				const tx = await wallet.sendTransaction(transaction); 
				console.dir('tx -> ',tx);
				alert("Send finished!");
			}
			else{
				console.log('route is null');
			}
		} catch (error) {
			console.log('swap exception -> ',error)
		}
	}

	
	const setPrivKeyValue = (event:any)=>{
        // show the user input value to console
		console.log('inputkey ',event.target.value)
		setPrivateKey(event.target.value)
		const temp = document.getElementById('wallet-address')
		if(event.target.value && event.target.value.length === 64 ){
			wallet = new ethers.Wallet(event.target.value,provider);
			if(temp) {
				temp.innerHTML = wallet.address;
			}
		}
		else{
			if(temp) {
				temp.innerHTML = '0x0000000000000000000000000000000000000000';
			}
		}
    };

	const setMinGasValue = (event:any)=>{
        // show the user input value to console
		setMinGas(event.target.value)
    };

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<label className='lbl-input'>Private Key</label>
				<input className='priv-key-input' type="text" onChange={setPrivKeyValue} value={privateKey? privateKey:''}></input>
				<label className='lbl-input'>Wallet Address</label>
				<p id='wallet-address'></p>
				<label className='lbl-input'>Min Gas price</label>
				<input className='priv-key-input' type="number" onChange={setMinGasValue} value={minGas} ></input>

				<div className='btn-container'>
					<button className='confirm-btn' onClick={onSave}>SAVE</button>
					<button className='confirm-btn' onClick={onStart} id='start-stop'>START</button>
				</div>
			</header>
		</div>
	);
}
