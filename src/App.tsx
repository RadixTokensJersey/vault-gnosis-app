import React, { useState } from 'react';
import './App.css';
import initSdk, { Transaction } from '@gnosis.pm/safe-apps-sdk'
import { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import Web3 from 'web3'
import { readAllocationsFromJson } from './addAllocationsFromJson'
import { AllocationInput } from './types';
import { readAllocationsFromExcel } from './addAllocationsFromExcel';
const abi = require('./vault_abi.json')

const VAULT_ADDRESS = "0x226595Fe9c7C8987136B5184E4D87dD92BdCE1c9"

const web3 = new Web3('https://rinkeby.infura.io/v3/token')
const contract = new web3.eth.Contract(abi, VAULT_ADDRESS)

const appsSdk = initSdk()

const onSafeInfo = (safeInfo: SafeInfo): void => {
  console.log(safeInfo);
};

const onTransactionConfirmation = ({ requestId, safeTxHash }) => {
  console.log(requestId, safeTxHash);
};

const onTransactionRejection = ({ requestId }) => {
  console.log(requestId);
};

appsSdk.addListeners({
  onSafeInfo,
  onTransactionConfirmation,
  onTransactionRejection,
})

const sendTransaction = (txs: any[]) => {
  let txObjects: Transaction[] = []

  for (let tx of txs) {
    txObjects.push({
      to: VAULT_ADDRESS,
      value: '0',
      data: tx
    })
  }

  const { requestId } = appsSdk.sendTransactions(txObjects)
  return requestId
}

const unlock = (group: number, percentage: number) => sendTransaction(
  [
    contract.methods.unlock(group, percentage).encodeABI()
  ]
)

const addGroup = (groupName: string) => sendTransaction(
  [
    contract.methods.addGroup(groupName).encodeABI()
  ]
)

const release = (index: number) => sendTransaction(
  [
    contract.methods.release(index).encodeABI()
  ]
)

const revoke = (beneficiary: string, index: number) => sendTransaction(
  [
    contract.methods.revoke(beneficiary, index).encodeABI()
  ]
)

const revokeBeneficiariesInGroup = (beneficiaries: string, group: number) => sendTransaction(
  [
    contract.methods.revokeBeneficiariesInGroup(beneficiaries.split(','), group).encodeABI()
  ]
)

const revokeGroup = (group: number) => sendTransaction(
  [
    contract.methods.revokeGroup(group).encodeABI()
  ]
)

const setFundingAccount = (address: string) => sendTransaction(
  [
    contract.methods.setFundingAccount(address).encodeABI()
  ]
)

const addAllocations = (allocations: AllocationInput[]) => {
  let txs: any[] = []

  for (let allocationInput of allocations) {
    txs.push(
      contract.methods.addAllocations(allocationInput.addresses, allocationInput.amounts, allocationInput.groups).encodeABI()
    )
  }

  return sendTransaction(txs)
}





function App() {
  const [unlockGroup, setUnlockGroup] = useState(0)
  const [unlockPercentage, setUnlockPercentage] = useState(0)
  const [groupName, setGroupName] = useState('')
  const [allocations, setAllocations] = useState(null)
  const [releaseIndex, setReleaseIndex] = useState(0)
  const [revokeBeneficiary, setRevokeBeneficiary] = useState('')
  const [revokeIndex, setRevokeIndex] = useState(0)
  const [revokeIGBeneficiaries, setRevokeIGBeneficiaries] = useState('')
  const [revokeIGGroup, setRevokeIGGroup] = useState(0)
  const [revokeGroupGroup, setRevokeGroupGroup] = useState(0)
  const [fundingAccount, setFundingAccount] = useState('')

  const changeUnlockGroup = (e) => {
    setUnlockGroup(e.target.value)
  }

  const changeUnlockPercentage = (e) => {
    setUnlockPercentage(e.target.value)
  }

  const changeGroupName = (e) => {
    setGroupName(e.target.value)
  }

  const changeReleaseIndex = (e) => {
    setReleaseIndex(e.target.value)
  }

  const changeAllocations = (e) => {
    setAllocations(e.target.value)
  }

  const changeRevokeBeneficiary = (e) => {
    setRevokeBeneficiary(e.target.value)
  }

  const changeRevokeIndex = (e) => {
    setRevokeIndex(e.target.value)
  }

  const changeRevokeIGBeneficiaries = (e) => {
    setRevokeIGBeneficiaries(e.target.value)
  }

  const changeRevokeIGGroup = (e) => {
    setRevokeIGGroup(e.target.value)
  }

  const changeRevokeGroupGroup = (e) => {
    setRevokeGroupGroup(e.target.value)
  }

  const changeFundingAccount = (e) => {
    setFundingAccount(e.target.value)
  }

  const handleAllocationFile = async (e) => {
    const file = e.target.files[0]
    const fileType: string = file.name.split('.')[file.name.split('.').length - 1]

    var reader = new FileReader()

    if (fileType === 'json') {
      reader.onload = (event: any) => {
        const json = JSON.parse(event.target.result)
        const allocations: AllocationInput[] = readAllocationsFromJson(json)
        addAllocations(allocations)
      }

      reader.readAsText(file)
    } else if (fileType === "xlsx") {
        const allocations: AllocationInput[] = await readAllocationsFromExcel(file)
        addAllocations(allocations)
    } else {
      throw new Error('Filetype not supported.')
    }
  }

  return (
    <div className="App">
      <div className="input-group mb-3">
        <input onChange={changeUnlockGroup} type="number" className="form-control" placeholder="group" aria-describedby="button-addon1" />
        <input onChange={changeUnlockPercentage} type="number" className="form-control" placeholder="percentage" aria-label="Example text with button addon" aria-describedby="button-addon1" />
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={() => unlock(unlockGroup, unlockPercentage)}>unlock</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input onChange={changeGroupName} type="text" className="form-control" placeholder="groupName" aria-describedby="button-addon1" />
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={() => addGroup(groupName)}>addGroup</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input onChange={changeReleaseIndex} type="number" className="form-control" placeholder="index" aria-describedby="button-addon1" />
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={() => release(releaseIndex)}>release</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input onChange={changeRevokeBeneficiary} type="text" className="form-control" placeholder="beneficiary" aria-describedby="button-addon1" />
        <input onChange={changeRevokeIndex} type="number" className="form-control" placeholder="index" aria-label="Example text with button addon" aria-describedby="button-addon1" />
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={() => revoke(revokeBeneficiary, revokeIndex)}>revoke</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input onChange={changeRevokeIGBeneficiaries} type="text" className="form-control" placeholder="beneficiaries (0x123,0x456,...)" aria-describedby="button-addon1" />
        <input onChange={changeRevokeIGGroup} type="number" className="form-control" placeholder="group" aria-describedby="button-addon1" />
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={() => revokeBeneficiariesInGroup(revokeIGBeneficiaries, revokeIGGroup)}>revokeBeneficiariesInGroup</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input onChange={changeRevokeGroupGroup} type="number" className="form-control" placeholder="group" aria-describedby="button-addon1" />
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={() => revokeGroup(revokeGroupGroup)}>revokeGroup</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input onChange={changeFundingAccount} type="text" className="form-control" placeholder="account" aria-describedby="button-addon1" />
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={() => setFundingAccount(fundingAccount)}>setFundingAccount</button>
        </div>
      </div>

      <form>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">addAllocations</label>
          <input onChange={handleAllocationFile} type="file" className="form-control-file" id="exampleFormControlFile1" />
        </div>
      </form>
    </div>
  )
}

export default App
