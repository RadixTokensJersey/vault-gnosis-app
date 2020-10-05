import { AllocationInput } from './types'
const { default: BigNumber } = require('bignumber.js')

export const readAllocationsFromJson = (allocations) => {
    let totalAmount = new BigNumber(0)

    const addresses: string[] = []
    const amounts: number[] = []
    const groups: number[] = []

    for (let allocation of allocations) {
        const address = allocation.address
        const amount = new BigNumber(allocation.amount)

        addresses.push(address)
        amounts.push(amount)
        groups.push(0)

        totalAmount = totalAmount.plus(amount)
    }

    let addressBatches: string[][] = []
    let amountBatches: number[][] = []
    let groupBatches: number[][] = []

    const batchSize = 50
    const count = addresses.length
    const nbrOfBatches = Math.ceil(count / batchSize)

    let allocationNbr = 0

    let txs: AllocationInput[] = []

    for (let batchNbr = 0; batchNbr < nbrOfBatches; batchNbr++) {
        addressBatches[batchNbr] = []
        amountBatches[batchNbr] = []
        groupBatches[batchNbr] = []

        for (
            let _allocationNbr = allocationNbr;
            batchSize * (batchNbr + 1) < count ? _allocationNbr < (batchSize * (batchNbr + 1)) : _allocationNbr < count;
            _allocationNbr++
        ) {
            addressBatches[batchNbr].push(addresses[_allocationNbr])
            amountBatches[batchNbr].push(amounts[_allocationNbr])
            groupBatches[batchNbr].push(groups[_allocationNbr])
            allocationNbr++
        }

        /*
        console.log(`--------- TRANSACTION ${batchNbr} --------------`)
        console.log(vault.methods.addAllocations(
            addressBatches[batchNbr],
            amountBatches[batchNbr],
            groupBatches[batchNbr]
        ).encodeABI())
        console.log('------------------------------------------------')
        */

        txs.push(
            {
                addresses: addressBatches[batchNbr],
                amounts: amountBatches[batchNbr],
                groups: groupBatches[batchNbr]
            }
        )
    }

    return txs
} 
