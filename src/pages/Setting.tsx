/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import {Link} from 'react-router-dom'

export const Setting = () => {
	const [privateKey, setPrivateKey] = useState<string|null>(localStorage.getItem('privateKey') ? localStorage.getItem('privateKey') : '');
	const [minGas, setMinGas] = useState<number>(localStorage.getItem('minGas')? Number(localStorage.getItem('minGas')) : 0.0001);
	let wallet : any = null;

	useEffect(() => {  
		console.log('privateKey',privateKey)
		console.log('minGas',minGas)
		const temp = document.getElementById('wallet-address')
		if(privateKey && privateKey.length === 64 ){
			wallet = new ethers.Wallet(privateKey);
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

	const onSave = () => {
		console.log('onSave->',privateKey + " " + minGas)
		localStorage.setItem('privateKey', privateKey ? privateKey : '');
		localStorage.setItem('minGas', minGas.toString());
		// setPrivateKey('')
	}
	
	const setPrivKeyValue = (event:any)=>{
        // show the user input value to console
		console.log('inputkey ',event.target.value)
		setPrivateKey(event.target.value)
		const temp = document.getElementById('wallet-address')
		if(event.target.value && event.target.value.length === 64 ){
			wallet = new ethers.Wallet(event.target.value);
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
		<div>
			<div className='lbl-input'>Private Key</div>
			<input className='priv-key-input' type="text" onChange={setPrivKeyValue} value={privateKey? privateKey:''} ></input>
			<div className='lbl-input'>Wallet Address</div>
			<p id='wallet-address'></p>
			<div className='lbl-input'>Min Gas price</div>
			<input className='priv-key-input' type="number" onChange={setMinGasValue} value={minGas} ></input>	
			<div className='btn-container'>
				<button className='confirm-btn' onClick={onSave}>SAVE</button>
				<Link to="/" ><button className="confirm-btn">Home</button></Link>
			</div>
		</div>
	);
}
